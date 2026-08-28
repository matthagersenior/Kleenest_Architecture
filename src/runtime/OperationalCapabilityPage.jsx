import { useEffect, useMemo, useState } from 'react';
import { Database, RefreshCw, Search, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Layers3, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import { auditCapabilitySurface } from '../architecture/capabilityContract.js';
import { buildCapabilityPresentation } from '../architecture/capabilityPresentation.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import './OperationalCapabilityPage.css';

export default function OperationalCapabilityPage() {
  const { profile, services, isPlatformOwner, loading: authLoading } = useAppContext();
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ready = !authLoading && isPlatformOwner && !!profile;

  const load = async () => {
    if (!ready) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const value = services?.admin?.operationalCapabilityCatalog ? await services.admin.operationalCapabilityCatalog(profile) : [];
      setData(Array.isArray(value) ? value : (value?.rows || value?.data || []));
    } catch (e) {
      setData([]);
      setError(e?.message || 'Unable to load operational catalog telemetry.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (authLoading) return; if (ready) void load(); else setLoading(false); }, [authLoading, ready, services]);

  const visibleCapabilities = services?.workspaceCapabilities || [];
  const rows = useMemo(() => buildCapabilityPresentation({ workspace: 'admin', services, visibleCapabilities, catalog: data, contracts: [] }), [services, visibleCapabilities, data]);
  const filtered = useMemo(() => rows.filter(row => !query || `${row.id} ${row.label} ${(row.facts || []).join(' ')} ${(row.services || []).join(' ')} ${(row.ui || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const missing = rows.filter(row => !row.serviceCovered);
  const disabled = rows.filter(row => !row.catalogEnabled);
  const wired = rows.filter(row => row.serviceCovered && row.catalogEnabled);
  const audit = useMemo(() => auditCapabilitySurface({ workspace: 'admin', services: services || {}, visibleCapabilities, catalog: data }), [services, visibleCapabilities, data]);

  if (authLoading) return <WorkspaceShell workspace="owner"><section className="empty-state"><ShieldCheck size={28} /><h2>Loading capability catalog</h2><p>Waiting for the authenticated owner session before querying protected capability metadata.</p></section></WorkspaceShell>;
  if (!isPlatformOwner) return <WorkspaceShell workspace="consumer"><section className="empty-state"><ShieldCheck size={28} /><h2>Capability catalog</h2><p>Platform owner access is required.</p></section></WorkspaceShell>;

  return <WorkspaceShell workspace="owner"><section className="page capability-operations">
    <div className="page-header"><div><span className="eyebrow">CANONICAL CAPABILITY REGISTRY</span><h1>Operational Capabilities</h1><p>The live owner view of what Kleenest can do: canonical services, facts, workspace exposure, runtime coverage, and current UI entry points.</p></div><div className="hero-actions"><Link className="button secondary" to="/admin/capabilities"><Layers3 size={16} />Capability Hub</Link><button className="button secondary" type="button" onClick={load} disabled={loading}><RefreshCw size={16} />{loading ? 'Refreshing…' : 'Refresh telemetry'}</button></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="reward-stats"><div className="reward-stat"><Layers3 size={18} /><strong>{rows.length}</strong><span>canonical capabilities</span></div><div className="reward-stat"><CheckCircle2 size={18} /><strong>{wired.length}</strong><span>runtime covered</span></div><div className="reward-stat"><AlertTriangle size={18} /><strong>{missing.length}</strong><span>missing services</span></div><div className="reward-stat"><Database size={18} /><strong>{data.length}</strong><span>telemetry records</span></div></section>
    <section className="detail-panel"><div className="hero-actions"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search capability, service, fact, or workspace" aria-label="Search capabilities" /></div></section>
    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE REGISTRY</span><h2>{filtered.length} capabilities</h2><p>{audit.complete}/{audit.total} fully reconciled for the owner surface.</p></div><Code2 size={21} /></div><div className="business-list">{filtered.map(row => <div className="business-row" key={row.id}><div><strong>{row.label}</strong><span>{row.id} · {row.status} · {row.services?.length || 0} services · {row.facts?.length || 0} authoritative facts · {(row.ui || []).join(', ') || 'no UI scope'}</span><small>{row.flow || row.rule || 'Canonical capability contract.'}</small></div><div className="hero-actions"><span className={`tag ${row.status === 'implemented' ? 'active' : ''}`}>{row.status.replaceAll('-', ' ').toUpperCase()}</span>{row.route && <Link className="button secondary" to={row.route}>Open <ArrowRight size={14} /></Link>}</div></div>)}{!filtered.length && !loading && <div className="empty-state"><Search size={20} /><strong>No matching capabilities</strong></div>}</div></section>
    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">TELEMETRY RECONCILIATION</span><h2>Backend catalog records</h2></div><Database size={21} /></div>{data.length ? <div className="business-list">{data.slice(0, 100).map((row, index) => <div className="business-row" key={`${row.resource || row.feature_code || 'record'}-${index}`}><div><strong>{row.name || row.feature_code || row.resource || 'Unknown capability'}</strong><span>{row.workspace || '—'} · {row.category || '—'} · {row.exists === false ? 'dataset missing' : 'dataset present'} · {row.estimated_rows == null ? '—' : Math.max(0, Number(row.estimated_rows)).toLocaleString()} rows</span></div><span className="eyebrow">{row.status || 'TELEMETRY'}</span></div>)}</div> : <div className="empty-state"><Database size={20} /><strong>No separate telemetry records returned</strong><span>The canonical registry remains authoritative.</span></div>}</section>
    {disabled.length > 0 && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CATALOG OVERRIDES</span><h2>{disabled.length} disabled capabilities</h2></div><AlertTriangle size={21} /></div><p>Disabled catalog entries are surfaced for owner investigation; client visibility does not override backend authorization.</p></section>}
    <footer className="home-footer"><small>Registry authority: canonical capability contracts · reconciliation: live services/catalog</small></footer>
  </section></WorkspaceShell>;
}
