import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { BarChart3, Check, Copy, Download, ExternalLink, ImagePlus, Link2, Palette, Plus, Printer, QrCode, RefreshCw, ShieldCheck, Trash2, ToggleLeft, ToggleRight, Users, X } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { supabase } from '../infrastructure/supabase/client.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import './qr-studio.css';

const normalizeTier = value => String(value || '').toLowerCase().replace(/[-\s]/g, '_');
const baseUrl = () => `${window.location.origin}${import.meta.env.BASE_URL || '/'}`;
const publicUrl = row => row?.code ? `${baseUrl()}#/visit?locationId=${encodeURIComponent(row.location_id || '')}&qr=${encodeURIComponent(row.code)}` : '';

export default function BusinessQrStudioPageV3() {
  const { services, selectedBusiness, previewTier, isPlatformOwner } = useAppContext();
  const businessId = selectedBusiness?.business_id || selectedBusiness?.id || null;
  const [business, setBusiness] = useState(selectedBusiness || {});
  const [locations, setLocations] = useState([]);
  const [codes, setCodes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [label, setLabel] = useState('');
  const [purpose, setPurpose] = useState('Visit / engagement');
  const [actionType, setActionType] = useState('check_in');
  const [actionUrl, setActionUrl] = useState('');
  const [appDownloadUrl, setAppDownloadUrl] = useState(baseUrl());
  const [reviewUrl, setReviewUrl] = useState('');
  const [frameLabel, setFrameLabel] = useState('Scan with Kleenest');
  const [ctaLabel, setCtaLabel] = useState('Get the Kleenest app to rate & review');
  const [foreground, setForeground] = useState('#10182d');
  const [background, setBackground] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [singleUse, setSingleUse] = useState(false);
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [programs, setPrograms] = useState([]);
  const [programName, setProgramName] = useState('QR engagement');
  const [programType, setProgramType] = useState('engagement');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canvasRef = useRef(null);

  const effectiveTier = normalizeTier(previewTier?.id || business?.business_tier);
  const customLogoAllowed = isPlatformOwner || ['business_growth', 'business_fleet', 'business_enterprise', 'growth', 'fleet', 'enterprise'].includes(effectiveTier);
  const standard = !customLogoAllowed;
  const selected = useMemo(() => codes.find(row => String(row.id) === String(selectedId)) || null, [codes, selectedId]);

  const branding = () => standard
    ? { brand_mode: 'kleenest', logo_url: null, foreground: '#10182d', background: '#ffffff', frame_label: 'Scan with Kleenest', cta_label: 'Get the Kleenest app to rate & review', app_download_url: appDownloadUrl, review_url: reviewUrl, review_prompt: true, custom_logo_locked: true }
    : { brand_mode: 'custom', logo_url: logoUrl || null, logo_storage_path: logoUrl || null, foreground, background, frame_label: frameLabel, cta_label: ctaLabel, app_download_url: appDownloadUrl, review_url: reviewUrl, review_prompt: Boolean(reviewUrl) };

  const payload = () => ({ location_id: locationId, url: actionUrl || publicUrl(selected) || '', landing_url: actionUrl || publicUrl(selected) || '', app_download_url: appDownloadUrl, review_url: reviewUrl, cta_label: ctaLabel });

  const selectCode = row => {
    setSelectedId(row?.id || '');
    setLocationId(row?.location_id || '');
    setLabel(row?.label || '');
    setPurpose(row?.purpose || 'Visit / engagement');
    setActionType(row?.action_type || 'check_in');
    const c = row?.customization || {};
    setLogoUrl(c.logo_url || '');
    setForeground(c.foreground || '#10182d');
    setBackground(c.background || '#ffffff');
    setFrameLabel(c.frame_label || 'Scan with Kleenest');
    setCtaLabel(c.cta_label || 'Get the Kleenest app to rate & review');
    setAppDownloadUrl(c.app_download_url || baseUrl());
    setReviewUrl(c.review_url || '');
    setActionUrl(row?.action_payload?.url || row?.action_payload?.landing_url || '');
    setSingleUse(Boolean(row?.single_use));
    setMaxRedemptions(row?.max_redemptions ?? '');
    void loadPrograms(row?.id);
  };

  const loadPrograms = async qrId => {
    if (!qrId) return setPrograms([]);
    try {
      const result = await services.business.listQrPrograms(qrId);
      setPrograms(Array.isArray(result) ? result : result?.rows || []);
    } catch { setPrograms([]); }
  };

  const load = async () => {
    if (!businessId) return;
    setBusy('load'); setError('');
    try {
      const [locationRows, qrRows, context] = await Promise.all([
        services.business.listLocations(businessId),
        services.business.listQrs(businessId),
        services.business.members.context(businessId)
      ]);
      const nextLocations = Array.isArray(locationRows) ? locationRows : locationRows?.rows || [];
      const nextCodes = Array.isArray(qrRows) ? qrRows : qrRows?.rows || [];
      setLocations(nextLocations); setCodes(nextCodes); setBusiness(context?.business || context || selectedBusiness || {});
      const next = nextCodes.find(row => String(row.id) === String(selectedId)) || nextCodes[0];
      if (next) selectCode(next);
    } catch (e) { setError(e?.message || 'Unable to load QR Studio.'); }
    finally { setBusy(''); }
  };

  useEffect(() => { void load(); }, [businessId]);

  const uploadLogo = async file => {
    if (!file || standard) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      setError('QR logos must be PNG, JPEG, WebP, or SVG and 2 MB or smaller.'); return;
    }
    setBusy('logo'); setError('');
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace('jpeg', 'jpg');
      const path = `${businessId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('qr-branding').upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const url = supabase.storage.from('qr-branding').getPublicUrl(path).data.publicUrl;
      setLogoUrl(url); setLogoFile(file); setNotice('Custom logo uploaded and ready for QR branding.');
    } catch (e) { setError(e?.message || 'Unable to upload QR logo.'); }
    finally { setBusy(''); }
  };

  const save = async createNew => {
    if (!businessId || !locationId || !label.trim()) return setError('Select a location and give the QR asset a name.');
    setBusy(createNew ? 'create' : 'save'); setError(''); setNotice('');
    try {
      const input = { label: label.trim(), purpose: purpose.trim() || 'Engagement', actionType, actionPayload: payload(), customization: branding(), singleUse, maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null };
      const row = createNew ? await services.business.customQr.create(businessId, locationId, input) : await services.business.customQr.update(businessId, selected.id, input);
      await load(); if (row) selectCode(row); setNotice(createNew ? 'QR asset created and connected to the engagement pipeline.' : 'QR asset saved.');
    } catch (e) { setError(e?.message || 'Unable to save QR asset.'); }
    finally { setBusy(''); }
  };

  const toggle = async row => {
    setBusy(`toggle:${row.id}`); setError('');
    try {
      await services.business.customQr.update(businessId, row.id, { label: row.label, purpose: row.purpose, actionType: row.action_type || 'custom', actionPayload: row.action_payload || {}, customization: row.customization || {}, active: row.active === false, singleUse: Boolean(row.single_use), maxRedemptions: row.max_redemptions ?? null });
      await load();
    } catch (e) { setError(e?.message || 'Unable to change QR status.'); }
    finally { setBusy(''); }
  };

  const remove = async row => {
    if (!window.confirm(`Delete ${row.label || 'this QR asset'}?`)) return;
    setBusy(`delete:${row.id}`); setError('');
    try { await services.business.customQr.remove(businessId, row.id); setSelectedId(''); await load(); setNotice('QR asset deleted.'); }
    catch (e) { setError(e?.message || 'Unable to delete QR asset.'); }
    finally { setBusy(''); }
  };

  const createProgram = async () => {
    if (!selected || !programName.trim()) return;
    setBusy('program'); setError('');
    try { await services.business.createQrProgram(selected.id, programType, programName.trim(), null, { source: 'qr_studio' }, 1); await loadPrograms(selected.id); setProgramName(''); setNotice('Engagement program connected to this QR.'); }
    catch (e) { setError(e?.message || 'Unable to connect engagement program.'); }
    finally { setBusy(''); }
  };

  useEffect(() => {
    if (!selected || !canvasRef.current) return;
    const target = publicUrl(selected);
    if (!target) return;
    QRCode.toCanvas(canvasRef.current, target, { width: 420, margin: 3, errorCorrectionLevel: 'H', color: { dark: standard ? '#10182d' : foreground, light: background } }, errorValue => {
      if (errorValue || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      const src = standard ? `${baseUrl()}kleenest-mark.svg` : logoUrl;
      if (!src) return;
      const image = new Image(); image.onload = () => { const size = 70; const x = (canvasRef.current.width - size) / 2; const y = (canvasRef.current.height - size) / 2; ctx.fillStyle = background; ctx.fillRect(x - 8, y - 8, size + 16, size + 16); ctx.drawImage(image, x, y, size, size); }; image.src = src;
    });
  }, [selected, standard, foreground, background, logoUrl]);

  const download = () => { if (!canvasRef.current) return; const anchor = document.createElement('a'); anchor.download = `${(label || 'kleenest-qr').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`; anchor.href = canvasRef.current.toDataURL('image/png'); anchor.click(); };
  const copy = async () => { const link = publicUrl(selected); if (!link) return; try { await navigator.clipboard.writeText(link); setNotice('QR link copied.'); } catch { setError('Clipboard access is unavailable. Use Test or Download instead.'); } };

  if (!businessId) return <WorkspaceShell workspace="business"><section className="empty-state"><QrCode size={28} /><h2>Select a business workspace</h2><p>QR Studio is available inside the Business workspace.</p></section></WorkspaceShell>;

  return <WorkspaceShell workspace="business"><main className="page qr-studio-page">
    <div className="page-header"><div><span className="eyebrow">BUSINESS · QR STUDIO</span><h1>QR Studio</h1><p>Design, publish, print, track, and optimize every QR experience across your business locations.</p></div><button className="secondary" onClick={load} disabled={busy !== ''}><RefreshCw size={16} /> Refresh</button></div>
    {error && <div className="qr-alert qr-alert-error"><X size={17} /> {error}</div>}{notice && <div className="qr-alert qr-alert-success"><Check size={17} /> {notice}</div>}
    <div className="qr-tier-banner"><ShieldCheck size={20} /><div><strong>{standard ? 'Business Standard QR branding' : 'Advanced QR branding enabled'}</strong><span>{standard ? 'Kleenest logo, app download, verified visit, rating and review flow are included.' : 'Custom logo, colors, CTA, destination, redemption rules and engagement programs are enabled.'}</span></div>{standard && <span className="qr-lock-pill">Custom logo · Growth+</span>}</div>

    <div className="qr-studio-grid">
      <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">BUILD</span><h2>{selected ? 'Edit QR experience' : 'Create QR experience'}</h2></div><QrCode size={22} /></div>
        <div className="form-grid">
          <label>Location<select value={locationId} onChange={e => setLocationId(e.target.value)}><option value="">Select location</option>{locations.map(row => <option key={row.id || row.location_id} value={row.id || row.location_id}>{row.name || row.location_name || row.address || row.id}</option>)}</select></label>
          <label>Name<input value={label} onChange={e => setLabel(e.target.value)} placeholder="Front desk / restroom / entrance" /></label>
          <label>Purpose<input value={purpose} onChange={e => setPurpose(e.target.value)} /></label>
          <label>Action<select value={actionType} onChange={e => setActionType(e.target.value)}><option value="check_in">Verified visit / check-in</option><option value="engagement">Engagement</option><option value="redeem">Redeem</option><option value="campaign">Campaign</option><option value="custom">Custom destination</option></select></label>
          <label>Destination URL<input value={actionUrl} onChange={e => setActionUrl(e.target.value)} placeholder="Optional" /></label>
          <label>App download URL<input value={appDownloadUrl} onChange={e => setAppDownloadUrl(e.target.value)} /></label>
          <label>Review URL<input value={reviewUrl} onChange={e => setReviewUrl(e.target.value)} placeholder="Optional review destination" /></label>
          <label>Max redemptions<input type="number" min="1" value={maxRedemptions} onChange={e => setMaxRedemptions(e.target.value)} placeholder="Unlimited" /></label>
          <label className="checkbox-row"><input type="checkbox" checked={singleUse} onChange={e => setSingleUse(e.target.checked)} /> Single-use QR</label>
        </div>
        <div className="qr-section-divider" /><div className="qr-branding-head"><div><span className="eyebrow">BRANDING</span><h3>QR appearance</h3></div><Palette size={20} /></div>
        {standard ? <div className="qr-standard-brand"><div className="qr-logo-placeholder"><QrCode size={28} /></div><div><strong>Kleenest logo included</strong><p>Business Standard uses the Kleenest brand and directs customers into the app flow for verified visits, rating and review. Custom logos unlock on Growth and above.</p></div></div> : <div className="qr-branding-grid"><label>Custom logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e => void uploadLogo(e.target.files?.[0])} />{logoUrl && <span className="field-help">{logoFile?.name || 'Custom logo ready'}</span>}</label><label>Frame label<input value={frameLabel} onChange={e => setFrameLabel(e.target.value)} /></label><label>CTA label<input value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} /></label><label>Foreground<input type="color" value={foreground} onChange={e => setForeground(e.target.value)} /></label><label>Background<input type="color" value={background} onChange={e => setBackground(e.target.value)} /></label><div className="qr-logo-preview">{logoUrl ? <img src={logoUrl} alt="Custom QR logo" /> : <ImagePlus size={28} />}</div></div>}
        <div className="hero-actions"><button className="primary" onClick={() => void save(!selected)} disabled={busy !== '' || !locationId || !label.trim()}><QrCode size={16} /> {selected ? 'Save QR asset' : 'Create QR asset'}</button>{selected && <button className="secondary" onClick={() => { setSelectedId(''); setLabel(''); setLogoUrl(''); setPrograms([]); }}><Plus size={16} /> New</button>}</div>
      </section>

      <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PREVIEW</span><h2>{selected?.label || 'QR preview'}</h2></div><QrCode size={22} /></div>{selected ? <><div className="qr-poster"><canvas ref={canvasRef} /><strong>{standard ? 'Scan with Kleenest' : frameLabel}</strong><span>{ctaLabel}</span></div><div className="hero-actions qr-preview-actions"><button className="primary" onClick={download}><Download size={16} /> Download PNG</button><button className="secondary" onClick={() => window.print()}><Printer size={16} /> Print</button><button className="secondary" onClick={copy}><Copy size={16} /> Copy link</button><a className="secondary compact" href={publicUrl(selected)} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Test</a></div><div className="qr-url"><Link2 size={15} /><code>{publicUrl(selected)}</code></div></> : <div className="qr-empty"><QrCode size={42} /><strong>Create or select a QR asset</strong><span>Your QR, branding, public landing experience, analytics and engagement wiring will appear here.</span></div>}</section>
    </div>

    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LIBRARY</span><h2>QR assets</h2></div><BarChart3 size={21} /></div>{codes.length ? codes.map(row => <div className={`business-row qr-asset-row${String(row.id) === String(selectedId) ? ' selected' : ''}`} key={row.id} onClick={() => selectCode(row)}><div className="qr-asset-main"><div className="qr-mini"><QrCode size={20} /></div><div><strong>{row.label || 'QR asset'}</strong><span>{row.location_name || row.location_id} · {row.active === false ? 'Inactive' : 'Active'}</span><small>{Number(row.scans || 0)} scans · {Number(row.check_ins || 0)} check-ins · {Number(row.redemptions || 0)} redemptions · {Number(row.engagement_programs || 0)} programs</small></div></div><div className="hero-actions"><button className="secondary compact" onClick={e => { e.stopPropagation(); void toggle(row); }}>{row.active === false ? <><ToggleLeft size={15} /> Activate</> : <><ToggleRight size={15} /> Deactivate</>}</button><button className="secondary compact" onClick={e => { e.stopPropagation(); selectCode(row); }}><Palette size={15} /> Edit</button><button className="secondary compact" onClick={e => { e.stopPropagation(); void remove(row); }}><Trash2 size={15} /> Delete</button></div></div>) : <p>No QR assets yet. Create your first one above.</p>}</section>

    {selected && <section className="qr-metrics-grid"><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ANALYTICS</span><h2>QR performance</h2></div><BarChart3 size={20} /></div><div className="qr-stat-grid"><div><strong>{Number(selected.scans || 0)}</strong><span>Scans</span></div><div><strong>{Number(selected.check_ins || 0)}</strong><span>Verified visits</span></div><div><strong>{Number(selected.redemptions || 0)}</strong><span>Redemptions</span></div><div><strong>{Number(selected.engagement_programs || 0)}</strong><span>Programs</span></div></div><p className="field-help">Use QR analytics to connect physical placement to visits, engagement, redemption and downstream trust outcomes.</p></div><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ENGAGEMENT</span><h2>Programs</h2></div><Users size={20} /></div><div className="form-grid"><label>Program name<input value={programName} onChange={e => setProgramName(e.target.value)} /></label><label>Program type<select value={programType} onChange={e => setProgramType(e.target.value)}><option value="engagement">Engagement</option><option value="review">Review</option><option value="campaign">Campaign</option><option value="reward">Reward</option></select></label></div><div className="hero-actions"><button className="primary" onClick={() => void createProgram()} disabled={busy !== '' || !programName.trim()}><Plus size={16} /> Connect program</button></div>{programs.length ? <div className="qr-program-list">{programs.map(program => <div className="business-row" key={program.id}><div><strong>{program.name || 'QR program'}</strong><span>{program.program_type || 'engagement'} · {program.active === false ? 'Inactive' : 'Active'}</span></div><Check size={18} /></div>)}</div> : <p className="field-help">No programs connected yet.</p>}</div></section>}
  </main></WorkspaceShell>;
}
