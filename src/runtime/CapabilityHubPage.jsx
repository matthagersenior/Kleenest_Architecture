import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Route, ShieldCheck, Trophy, QrCode, Radio, Building2, BarChart3, Truck, Globe2, Bell, Settings, Search, AlertTriangle, Database, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import { auditCapabilitySurface } from '../architecture/capabilityContract.js';
import { buildCapabilityPresentation } from '../architecture/capabilityPresentation.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import './CapabilityHubPage.css';

const ICONS = { identity: ShieldCheck, locations: MapPin, discovery: Search, maps: MapPin, checkins: ShieldCheck, reviews: ShieldCheck, evidence: ShieldCheck, qr: QrCode, geofencing: Radio, progression: Trophy, quests: Trophy, rewards: Trophy, reputation: ShieldCheck, leaderboards: Trophy, business: Building2, businessLifecycle: Building2, access: ShieldCheck, monetization: BarChart3, fleet: Truck, enterprise: Globe2, social: Globe2, family: ShieldCheck, notifications: Bell, analytics: BarChart3, liveNetwork: Radio, intelligence: BarChart3, reporting: BarChart3, externalData: Database, offline: Route, support: Bell, admin: Settings };
function normalizeWorkspace(value) { const raw = String(value || '').toLowerCase(); return ['consumer', 'profile', 'community', 'play', 'business', 'fleet', 'enterprise', 'admin', 'owner'].includes(raw) ? raw : 'consumer'; }

export default function CapabilityHubPage() {
  const { workspaceCapabilities, membershipTier, configured, services, activeWorkspace } = useAppContext();
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const workspace = normalizeWorkspace(activeWorkspace || membershipTier);
  const loadLiveState = async () => {
    if (!configured || !services?.capabilityCoverage) return;
    setLoading(true); setError('');
    try {
      const [coverage, liveCatalog, contractRows] = await Promise.all([services.capabilityCoverage.list(), services.capabilityCoverage.catalog(), services.capabilityCoverage.contracts()]);
      setCatalog(Array.isArray(liveCatalog) ? liveCatalog : (Array.isArray(coverage) ? coverage : []));
      setContracts(Array.isArray(contractRows) ? contractRows : []);
    } catch (e) { setCatalog([]); setContracts([]); setError(e?.message || 'Unable to reconcile live capability state.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadLiveState(); }, [configured, services]);
  const visibleIds = useMemo(() => new Set((workspaceCapabilities || []).map(value => typeof value === 'string' ? value : value?.code || value?.feature_code || value?.key || value?.id).filter(Boolean)), [workspaceCapabilities]);
  const capabilities = useMemo(() => buildCapabilityPresentation({ workspace, services, visibleCapabilities: [...visibleIds], catalog, contracts }), [workspace, services, visibleIds, catalog, contracts]);
  const filtered = useMemo(() => capabilities.filter(item => { const q = query.trim().toLowerCase(); return !q || `${item.id} ${item.label} ${(item.facts || []).join(' ')} ${(item.services || []).join(' ')} ${item.flow || ''} ${item.contract?.canonical_rpc || ''}`.toLowerCase().includes(q); }), [capabilities, query]);
  const runtimeAudit = useMemo(() => auditCapabilitySurface({ workspace, services: services || {}, visibleCapabilities: [...visibleIds], catalog }), [workspace, services, visibleIds, catalog]);
  const supabaseFiltered = useMemo(() => contracts.filter(row => { const active = row?.enabled !== false && row?.active !== false && row?.status !== 'disabled' && row?.status !== 'inactive'; const q = query.trim().toLowerCase(); return active && (!q || `${row.domain} ${row.canonical_capability} ${row.canonical_rpc} ${row.owner_surface}`.toLowerCase().includes(q)); }), [contracts, query]);
  const catalogFiltered = useMemo(() => catalog.filter(row => { const q = query.trim().toLowerCase(); return !q || `${row.feature_code} ${row.name} ${row.category} ${row.minimum_tier}`.toLowerCase().includes(q); }), [catalog, query]);
  const gapCount = runtimeAudit.missingServices.length + runtimeAudit.hidden.length + runtimeAudit.disabled.length;

  return <WorkspaceShell workspace={workspace}><main className="page capability-hub">
    <div className="page-header"><div><span className="eyebrow">KLEENEST PLATFORM</span><h1>Everything Kleenest can do.</h1><p>The canonical presentation model reconciles registry authority, runtime coverage, workspace exposure, backend contracts, and the live feature catalog.</p></div><div className="hero-actions"><span className="membership-badge">Workspace · {workspace}</span><button className="button secondary" type="button" onClick={loadLiveState} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh live state'}</button><Link className="button secondary" to="/integration">Integration health <ArrowRight size={15} /></Link></div></div>
    {error && <div className="state error" role="alert">{error}</div>}
    <section className="detail-panel capability-runtime"><div><span className="eyebrow">LIVE CAPABILITY STATUS</span><h2>{configured ? `Connected · ${workspace}` : 'Connection needs attention'}</h2><p>{configured ? 'Registry, runtime services, workspace exposure, backend contracts, and the live catalog are reconciled here.' : 'Supabase is not currently configured for this runtime.'}</p></div><div className="runtime-stats"><div><strong>{filtered.length}</strong><span>matching capabilities</span></div><div><strong>{supabaseFiltered.length}</strong><span>live contracts</span></div><div><strong>{catalogFiltered.length}</strong><span>catalog features</span></div><div><strong>{runtimeAudit.complete}/{runtimeAudit.total}</strong><span>fully reconciled</span></div></div></section>
    <section className="detail-panel capability-runtime"><div><span className="eyebrow"><Server size={14} /> CONTRACT AUDIT</span><h2>{gapCount ? `${gapCount} reconciliation gap${gapCount === 1 ? '' : 's'}` : 'Capability contract reconciled'}</h2><p>{gapCount ? `${runtimeAudit.missingServices.length} missing runtime service coverage; ${runtimeAudit.hidden.length} hidden from this workspace; ${runtimeAudit.disabled.length} disabled in the live catalog.` : 'The canonical registry, runtime services, workspace exposure, and live catalog agree for the audited surface.'}</p></div></section>
    <section className="detail-panel capability-search"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search capabilities, facts, services, Supabase RPCs, or domains…" aria-label="Search capabilities" /></section>
    <section className="capability-section"><div className="section-heading"><div><span className="eyebrow"><ShieldCheck size={14} /> CANONICAL CAPABILITY REGISTRY</span><h2>{workspace} capabilities</h2><p>Every card uses the same canonical presentation model as the owner operational view.</p></div><span className="tag">{filtered.length} capabilities</span></div><div className="capability-grid">{filtered.map(item => { const Icon = ICONS[item.id] || Settings; return <Link className="capability-card" to={item.route} key={item.id}><span className="capability-card-icon"><Icon size={20} /></span><span><strong>{item.label}</strong><em>{item.flow || `${(item.services || []).length} runtime services · ${(item.facts || []).length} canonical facts`}{item.contract ? ` · RPC: ${item.contract.canonical_rpc}` : ''}</em></span><span className="tag">{item.status.replaceAll('-', ' ').toUpperCase()}</span></Link>; })}{!filtered.length && <div className="capability-card passive"><span className="capability-card-icon"><AlertTriangle size={19} /></span><span><strong>No matching capabilities</strong><em>Try a different search or workspace.</em></span></div>}</div></section>
    <section className="capability-section"><div className="section-heading"><div><span className="eyebrow"><Server size={14} /> LIVE SUPABASE CONTRACTS</span><h2>Authoritative backend capabilities</h2><p>Only active rows from the live capability-domain contract table are shown.</p></div><span className="tag">{supabaseFiltered.length} active contracts</span></div><div className="capability-grid">{supabaseFiltered.length ? supabaseFiltered.map(row => <div className="capability-card passive" key={`${row.domain}:${row.canonical_rpc}`}><span className="capability-card-icon"><Database size={19} /></span><span><strong>{row.canonical_capability}</strong><em>{row.domain} · RPC: {row.canonical_rpc} · surface: {row.owner_surface}</em></span><span className="tag">ACTIVE</span></div>) : <div className="capability-card passive"><span className="capability-card-icon"><Database size={19} /></span><span><strong>No matching Supabase contracts</strong><em>Try a different capability, RPC, or domain.</em></span></div>}</div></section>
    <section className="capability-section"><div className="section-heading"><div><span className="eyebrow">LIVE FEATURE CATALOG</span><h2>Current entitlement surface</h2></div><span className="tag">{catalogFiltered.length} features</span></div><div className="capability-grid">{catalogFiltered.map(row => <div className="capability-card passive" key={row.feature_code}><span className="capability-card-icon">{row.enabled ? <ShieldCheck size={19} /> : <AlertTriangle size={19} />}</span><span><strong>{row.name}</strong><em>{row.feature_code} · {row.category} · minimum tier: {row.minimum_tier}</em></span><span className="tag">{row.enabled ? 'ENABLED' : 'DISABLED'}</span></div>)}</div></section>
    <footer className="home-footer"><span>Registry authority: canonical capability contracts. Live state: Supabase capability coverage and feature catalog. Presentation does not grant authorization.</span><Link className="text-link" to="/pricing">Membership details <ArrowRight size={14} /></Link></footer>
  </main></WorkspaceShell>;
}
