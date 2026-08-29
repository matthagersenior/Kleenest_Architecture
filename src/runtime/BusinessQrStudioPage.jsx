import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { BarChart3, Check, Copy, Download, ExternalLink, ImagePlus, Link2, Palette, Plus, Printer, QrCode, RefreshCw, ShieldCheck, Trash2, ToggleLeft, ToggleRight, Users, X } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { supabase } from '../infrastructure/supabase/client.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import './qr-studio.css';

const DEFAULT_APP_URL = () => `${window.location.origin}${import.meta.env.BASE_URL || '/'}`;
const normalizeTier = value => String(value || '').toLowerCase().replace(/[-\s]/g, '_');

export default function BusinessQrStudioPage(){
  const { services, selectedBusiness, previewTier, isPlatformOwner } = useAppContext();
  const businessId = selectedBusiness?.business_id || selectedBusiness?.id || null;
  const [business,setBusiness] = useState(selectedBusiness || null);
  const [locations,setLocations] = useState([]),[codes,setCodes] = useState([]),[selectedId,setSelectedId] = useState('');
  const [locationId,setLocationId] = useState(''),[label,setLabel] = useState(''),[purpose,setPurpose] = useState('Visit / engagement'),[actionType,setActionType] = useState('check_in');
  const [actionUrl,setActionUrl] = useState(''),[appDownloadUrl,setAppDownloadUrl] = useState(DEFAULT_APP_URL()),[reviewUrl,setReviewUrl] = useState('');
  const [frameLabel,setFrameLabel] = useState('Scan with Kleenest'),[ctaLabel,setCtaLabel] = useState('Get the Kleenest app to rate & review');
  const [foreground,setForeground] = useState('#10182d'),[background,setBackground] = useState('#ffffff'),[logoUrl,setLogoUrl] = useState(''),[logoFile,setLogoFile] = useState(null);
  const [singleUse,setSingleUse] = useState(false),[maxRedemptions,setMaxRedemptions] = useState(''),[busy,setBusy] = useState(''),[error,setError] = useState(''),[notice,setNotice] = useState('');
  const [analytics,setAnalytics] = useState(null),[programs,setPrograms] = useState([]),[programType,setProgramType] = useState('engagement'),[programName,setProgramName] = useState('QR engagement'),[programDescription,setProgramDescription] = useState('');
  const canvasRef = useRef(null);
  const effectiveTier = normalizeTier(previewTier?.id || business?.business_tier || selectedBusiness?.business_tier);
  const customLogoAllowed = isPlatformOwner || ['business_growth','business_fleet','business_enterprise','growth','enterprise','fleet'].includes(effectiveTier);
  const standardBranding = !customLogoAllowed;

  const load = async () => {
    if(!businessId) return;
    setBusy('load'); setError('');
    try{
      const [ls,qs,bs] = await Promise.all([
        services.business.listLocations(businessId),
        services.business.listQrs(businessId),
        supabase?.from('businesses').select('id,name,business_tier,logo_url').eq('id',businessId).maybeSingle()
      ]);
      setLocations(Array.isArray(ls)?ls:ls?.rows||[]); const rows=Array.isArray(qs)?qs:qs?.rows||[]; setCodes(rows);
      if(bs?.data) setBusiness(bs.data);
      const current=rows.find(x=>String(x.id)===String(selectedId)) || rows[0];
      if(current && !selectedId) selectCode(current);
    }catch(e){setError(e?.message||'Unable to load QR Studio.');}finally{setBusy('');}
  };
  useEffect(()=>{void load()},[businessId]);

  const selectedCode = useMemo(()=>codes.find(x=>String(x.id)===String(selectedId)) || null,[codes,selectedId]);
  const target = useMemo(()=>locations.find(x=>String(x.id||x.location_id)===String(locationId))||null,[locations,locationId]);

  function selectCode(row){
    setSelectedId(row?.id||''); setLocationId(row?.location_id||''); setLabel(row?.label||''); setPurpose(row?.purpose||'Visit / engagement'); setActionType(row?.action_type||'check_in');
    const c=row?.customization||{}; setForeground(c.foreground||'#10182d'); setBackground(c.background||'#ffffff'); setLogoUrl(c.logo_url||''); setFrameLabel(c.frame_label||'Scan with Kleenest'); setCtaLabel(c.cta_label||'Get the Kleenest app to rate & review');
    setAppDownloadUrl(c.app_download_url||DEFAULT_APP_URL()); setReviewUrl(c.review_url||''); setActionUrl(row?.action_payload?.url||row?.action_payload?.landing_url||''); setSingleUse(!!row?.single_use); setMaxRedemptions(row?.max_redemptions??'');
    void loadPrograms(row?.id);
  }

  const publicUrl = row => { const code=row?.code||row?.qr_code||row?.token; return code ? `${window.location.origin}${import.meta.env.BASE_URL||'/'}#/visit?locationId=${encodeURIComponent(row.location_id||'')}&qr=${encodeURIComponent(code)}` : ''; };
  const landingPayload = () => ({ location_id:locationId, url:actionUrl||publicUrl(selectedCode)||'', landing_url:actionUrl||publicUrl(selectedCode)||'', app_download_url:appDownloadUrl, review_url:reviewUrl, cta_label:ctaLabel });
  const branding = () => standardBranding ? {brand_mode:'kleenest',logo_url:null,logo_storage_path:null,foreground:'#10182d',background:'#ffffff',frame_label:'Scan with Kleenest',cta_label:'Get the Kleenest app to rate & review',app_download_url:appDownloadUrl,review_url:reviewUrl,review_prompt:true,custom_logo_locked:true} : {brand_mode:'custom',logo_url:logoUrl||null,logo_storage_path:logoUrl||null,foreground,background,frame_label:frameLabel,cta_label:ctaLabel,app_download_url:appDownloadUrl,review_url:reviewUrl,review_prompt:Boolean(reviewUrl)};

  const uploadLogo = async file => {
    if(!file || !businessId || standardBranding) return;
    if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) return setError('Use PNG, JPEG, WebP, or SVG for a QR logo.');
    if(file.size>2*1024*1024) return setError('QR logos must be 2 MB or smaller.');
    setBusy('logo'); setError('');
    try{
      const ext=(file.name.split('.').pop()||'png').toLowerCase().replace('jpeg','jpg'); const path=`${businessId}/${crypto.randomUUID()}.${ext}`;
      const {error:uploadError}=await supabase.storage.from('qr-branding').upload(path,file,{upsert:true,contentType:file.type,cacheControl:'3600'}); if(uploadError) throw uploadError;
      const {data}=supabase.storage.from('qr-branding').getPublicUrl(path); setLogoUrl(data.publicUrl); setLogoFile(file); setNotice('Logo uploaded and ready for QR branding.');
    }catch(e){setError(e?.message||'Unable to upload QR logo.');}finally{setBusy('');}
  };

  const create = async () => {
    if(!businessId||!locationId||!label.trim()) return setError('Select a location and give the QR asset a label.');
    setBusy('create'); setError(''); setNotice('');
    try{
      const row=await services.business.customQr.create(businessId,locationId,{label:label.trim(),purpose:purpose.trim()||'Engagement',actionType,actionPayload:landingPayload(),customization:branding(),singleUse,maxRedemptions:maxRedemptions?Number(maxRedemptions):null});
      await load(); setSelectedId(row?.id||''); if(row) selectCode(row); setNotice('QR asset created and connected to the Kleenest engagement pipeline.');
    }catch(e){setError(e?.message||'Unable to create QR asset.');}finally{setBusy('');}
  };
  const save = async () => {
    if(!selectedCode) return create(); setBusy('save'); setError('');
    try{await services.business.customQr.update(businessId,selectedCode.id,{label:label.trim(),purpose:purpose.trim()||'Engagement',actionType,actionPayload:landingPayload(),customization:branding(),active:selectedCode.active!==false,singleUse,maxRedemptions:maxRedemptions?Number(maxRedemptions):null});await load();setNotice('QR asset saved.');}catch(e){setError(e?.message||'Unable to save QR asset.')}finally{setBusy('');}
  };
  const toggle = async row => {setBusy(`toggle:${row.id}`);try{await services.business.customQr.update(businessId,row.id,{label:row.label,purpose:row.purpose,actionType:row.action_type||'custom',actionPayload:row.action_payload||{},customization:row.customization||{},active:row.active===false,singleUse:!!row.single_use,maxRedemptions:row.max_redemptions??null});await load()}catch(e){setError(e?.message||'Unable to change QR status.')}finally{setBusy('')}};
  const remove = async row => {if(!window.confirm(`Delete ${row.label||'this QR asset'}?`))return;setBusy(`remove:${row.id}`);try{await services.business.customQr.remove(businessId,row.id);setSelectedId('');await load()}catch(e){setError(e?.message||'Unable to delete QR asset.')}finally{setBusy('')}};
  const copy = async row => {const url=publicUrl(row);if(!url)return;try{await navigator.clipboard.writeText(url);setNotice('QR link copied.')}catch{setError('Clipboard access is unavailable; use Test or Download instead.')}};
  const loadPrograms = async id => {if(!id)return setPrograms([]);try{const data=await services.business.listQrPrograms(id);setPrograms(Array.isArray(data)?data:data?.rows||[])}catch{setPrograms([])}};
  const createProgram = async () => {if(!selectedCode||!programName.trim())return;setBusy('program');try{await services.business.createQrProgram(selectedCode.id,programType,programName.trim(),programDescription.trim()||null,{qr_code_id:selectedCode.id,source:'qr_studio'},1);await loadPrograms(selectedCode.id);setProgramName('');setProgramDescription('');setNotice('Engagement program connected to this QR.')}catch(e){setError(e?.message||'Unable to create engagement program.')}finally{setBusy('')}};

  useEffect(()=>{
    const row=selectedCode; const canvas=canvasRef.current; if(!canvas||!row)return;
    const url=publicUrl(row); QRCode.toCanvas(canvas,url,{width:420,margin:3,errorCorrectionLevel:'H',color:{dark:standardBranding?'#10182d':foreground,light:background}},err=>{if(err)return; const ctx=canvas.getContext('2d'); const imageUrl=standardBranding ? `${window.location.origin}${import.meta.env.BASE_URL||'/'}kleenest-mark.svg` : logoUrl; if(!imageUrl)return; const img=new Image(); img.crossOrigin='anonymous'; img.onload=()=>{const size=70,x=(canvas.width-size)/2,y=(canvas.height-size)/2;ctx.fillStyle=background;ctx.fillRect(x-7,y-7,size+14,size+14);ctx.drawImage(img,x,y,size,size)};img.src=imageUrl;});
  },[selectedCode,logoUrl,foreground,background,standardBranding]);

  const download = () => {if(!canvasRef.current)return;const a=document.createElement('a');a.download=`${(selectedCode?.label||'kleenest-qr').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.png`;a.href=canvasRef.current.toDataURL('image/png');a.click()};
  const print = () => window.print();
  const stats = selectedCode ? {scans:Number(selectedCode.scans||0),checkIns:Number(selectedCode.check_ins||0),uniqueUsers:Number(selectedCode.unique_users||0),redemptions:Number(selectedCode.redemptions||0),programs:Number(selectedCode.engagement_programs||programs.length||0)} : null;

  if(!businessId)return <WorkspaceShell workspace="business"><section className="empty-state"><QrCode size={28}/><h2>Select a business workspace</h2><p>QR Studio operates against the canonical business membership selected by the app shell.</p></section></WorkspaceShell>;
  return <WorkspaceShell workspace="business"><main className="page qr-studio-page">
    <div className="page-header"><div><span className="eyebrow">BUSINESS · QR STUDIO</span><h1>QR Studio</h1><p>Design, publish, measure, and manage every QR experience across your business locations.</p></div><button className="secondary" onClick={load} disabled={busy!==''}><RefreshCw size={16}/>Refresh</button></div>
    {error&&<div className="qr-alert qr-alert-error" role="alert"><X size={17}/>{error}</div>}{notice&&<div className="qr-alert qr-alert-success"><Check size={17}/>{notice}</div>}
    <div className="qr-tier-banner"><ShieldCheck size={20}/><div><strong>{standardBranding?'Business Standard QR branding':'Advanced QR branding enabled'}</strong><span>{standardBranding?'Kleenest branding is included. Every scan can send customers to the app to rate & review.':'Use your own logo, brand colors, calls-to-action, campaign destinations, and engagement programs.'}</span></div>{!customLogoAllowed&&<span className="qr-lock-pill">Custom logo · Growth+</span>}</div>
    <div className="qr-studio-grid">
      <section className="detail-panel qr-builder-panel"><div className="panel-heading"><div><span className="eyebrow">CREATE / EDIT</span><h2>{selectedCode?'Edit QR experience':'Create a QR experience'}</h2></div><QrCode size={22}/></div>
        <div className="form-grid"><label>Business location<select value={locationId} onChange={e=>setLocationId(e.target.value)}><option value="">Select a location</option>{locations.map(x=><option key={x.id||x.location_id} value={x.id||x.location_id}>{x.name||x.location_name||x.address||x.id}</option>)}</select></label><label>QR name<input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Front desk / restroom / entrance"/></label><label>Purpose<input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Visit, review, campaign…"/></label><label>QR action<select value={actionType} onChange={e=>setActionType(e.target.value)}><option value="check_in">Check in</option><option value="engagement">Engagement</option><option value="redeem">Redeem</option><option value="campaign">Campaign</option><option value="custom">Custom destination</option></select></label><label>Destination URL<input value={actionUrl} onChange={e=>setActionUrl(e.target.value)} placeholder="Optional campaign or landing URL"/></label><label>App download URL<input value={appDownloadUrl} onChange={e=>setAppDownloadUrl(e.target.value)} placeholder="Your app download / install page"/></label><label>Review URL<input value={reviewUrl} onChange={e=>setReviewUrl(e.target.value)} placeholder="Optional review destination"/></label><label>Max redemptions<input type="number" min="1" value={maxRedemptions} onChange={e=>setMaxRedemptions(e.target.value)} placeholder="Unlimited"/></label><label className="checkbox-row"><input type="checkbox" checked={singleUse} onChange={e=>setSingleUse(e.target.checked)}/> Single-use / redemption-limited</label></div>
        <div className="qr-section-divider"/><div className="qr-branding-head"><div><span className="eyebrow">BRANDING</span><h3>Make the QR unmistakably yours</h3></div><Palette size={20}/></div>
        {standardBranding ? <div className="qr-standard-brand"><div className="qr-logo-placeholder"><QrCode size={28}/></div><div><strong>Kleenest logo included</strong><p>Business Standard receives the Kleenest mark on the QR with a built-in app/download and rate & review call-to-action.</p><small>Upgrade to Growth or higher to upload a custom logo and control QR branding.</small></div></div> : <div className="qr-branding-grid"><label>QR logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e=>{setLogoFile(e.target.files?.[0]||null);void uploadLogo(e.target.files?.[0])}}/>{logoUrl&&<span className="field-help">Logo ready. {logoFile?.name||'Stored QR logo'}</span>}</label><label>Frame label<input value={frameLabel} onChange={e=>setFrameLabel(e.target.value)} placeholder="Scan with Kleenest"/></label><label>CTA label<input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)} placeholder="What customers should do next"/></label><label>Foreground<input type="color" value={foreground} onChange={e=>setForeground(e.target.value)}/></label><label>Background<input type="color" value={background} onChange={e=>setBackground(e.target.value)}/></label><div className="qr-logo-preview">{logoUrl?<img src={logoUrl} alt="QR logo preview"/>:<ImagePlus size={28}/>}<span>Center logo</span></div></div>}
        {target&&<div className="qr-linked-location"><Link2 size={16}/><span><strong>{target.name||target.address||target.id}</strong>{target.address&&<small>{target.address}</small>}</span></div>}
        <div className="hero-actions"><button className="primary" disabled={busy!==''||!locationId||!label.trim()} onClick={selectedCode?save:create}><QrCode size={16}/>{busy==='save'?'Saving…':busy==='create'?'Creating…':selectedCode?'Save QR asset':'Create QR asset'}</button>{selectedCode&&<button className="secondary" onClick={()=>{setSelectedId('');setLabel('');setActionUrl('');setLogoUrl('');}}><Plus size={16}/>New asset</button>}</div>
      </section>
      <section className="detail-panel qr-preview-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE PREVIEW</span><h2>{selectedCode?.label||'Your QR'}</h2></div><QrCode size={22}/></div>{selectedCode?<><div className="qr-poster"><canvas ref={canvasRef} aria-label="Generated QR code"/><strong>{standardBranding?'Scan with Kleenest':frameLabel}</strong><span>{ctaLabel}</span></div><div className="hero-actions qr-preview-actions"><button className="primary" onClick={download}><Download size={16}/>Download PNG</button><button className="secondary" onClick={print}><Printer size={16}/>Print</button><button className="secondary" onClick={()=>copy(selectedCode)}><Copy size={16}/>Copy link</button><a className="secondary compact" href={publicUrl(selectedCode)} target="_blank" rel="noreferrer"><ExternalLink size={15}/>Test scan</a></div><div className="qr-url"><Link2 size={15}/><code>{publicUrl(selectedCode)}</code></div></>:<div className="qr-empty"><QrCode size={42}/><strong>Select or create an asset</strong><span>The preview will generate a high-error-correction QR with your selected branding.</span></div>}</section>
    </div>
    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">QR ASSETS</span><h2>Business QR library</h2></div><BarChart3 size={21}/></div>{busy==='load'?<p>Loading QR assets…</p>:codes.length?codes.map(row=><div className={`business-row qr-asset-row${String(row.id)===String(selectedId)?' selected':''}`} key={row.id} onClick={()=>selectCode(row)}><div className="qr-asset-main"><div className="qr-mini"><QrCode size={20}/></div><div><strong>{row.label||'QR asset'}</strong><span>{row.purpose||row.action_type||'Engagement'} · {row.active===false?'Inactive':'Active'} · {row.location_name||row.location_id||'Location linked'}</span><small>{Number(row.scans||0)} scans · {Number(row.check_ins||0)} check-ins · {Number(row.redemptions||0)} redemptions · {Number(row.engagement_programs||0)} programs</small></div></div><div className="hero-actions"><button className="secondary compact" onClick={e=>{e.stopPropagation();void toggle(row)}} disabled={busy!==''}>{row.active===false?<><ToggleLeft size={15}/>Activate</>:<><ToggleRight size={15}/>Deactivate</>}</button><button className="secondary compact" onClick={e=>{e.stopPropagation();void copy(row)}}><Copy size={15}/>Copy</button><button className="secondary compact" onClick={e=>{e.stopPropagation();selectCode(row)}}><Palette size={15}/>Edit</button><button className="secondary compact" onClick={e=>{e.stopPropagation();void remove(row)}} disabled={busy!==''}><Trash2 size={15}/>Delete</button></div></div>):<p>No QR assets yet. Create the first one above.</p>}</section>
    {selectedCode&&<section className="qr-metrics-grid"><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">MEASUREMENT</span><h2>QR performance</h2></div><BarChart3 size={20}/></div><div className="qr-stat-grid"><div><strong>{stats.scans}</strong><span>Scans</span></div><div><strong>{stats.checkIns}</strong><span>Check-ins</span></div><div><strong>{stats.uniqueUsers}</strong><span>Unique users</span></div><div><strong>{stats.redemptions}</strong><span>Redemptions</span></div><div><strong>{stats.programs}</strong><span>Programs</span></div></div><p className="muted">Metrics are sourced from the QR attribution, check-in, redemption, and engagement chains.</p></div>
      <div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ENGAGEMENT</span><h2>Attach an engagement program</h2></div><Users size={20}/></div><div className="form-grid"><label>Program type<select value={programType} onChange={e=>setProgramType(e.target.value)}><option value="engagement">Engagement</option><option value="review">Review</option><option value="campaign">Campaign</option><option value="reward">Reward</option></select></label><label>Program name<input value={programName} onChange={e=>setProgramName(e.target.value)}/></label><label>Description<input value={programDescription} onChange={e=>setProgramDescription(e.target.value)} placeholder="What should happen after the scan?"/></label></div><button className="primary" onClick={createProgram} disabled={busy!==''||!programName.trim()}><Plus size={16}/>Connect program</button>{programs.length>0&&<div className="qr-program-list">{programs.map(p=><div key={p.id}><Check size={15}/><span><strong>{p.name}</strong><small>{p.program_type||'engagement'} · trigger {p.trigger_count||1}×</small></span></div>)}</div>}</div></section>}
  </main></WorkspaceShell>;
}
