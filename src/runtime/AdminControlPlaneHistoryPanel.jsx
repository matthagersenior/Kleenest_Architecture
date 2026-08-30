import { Activity, History, Settings2, ShieldCheck } from 'lucide-react';

const arr=v=>Array.isArray(v)?v:[];
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const when=v=>{if(!v)return 'Unknown time';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleString();};

export default function AdminControlPlaneHistoryPanel({history,loading=false,error='',onRefresh}){
  const changes=arr(history?.capability_changes);
  const audits=arr(history?.audit_runs);
  const retirements=arr(history?.retirements);
  const config=history?.configuration||{};
  return <section className="admin-panel">
    <div className="panel-heading"><div><span className="eyebrow">CONTROL-PLANE HISTORY</span><h2>Governance activity & configuration</h2><p>Owner-only history from capability changes, architecture audit runs, retired backend contracts, and the current feature/pricing catalogs.</p></div><History size={22}/></div>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <div className="reward-stats">
      <div className="reward-stat"><Settings2 size={18}/><strong>{n(config.features_enabled)}/{n(config.features_total)}</strong><span>features enabled</span></div>
      <div className="reward-stat"><Activity size={18}/><strong>{n(config.pricing_active)}/{n(config.pricing_entries)}</strong><span>pricing entries active</span></div>
      <div className="reward-stat"><ShieldCheck size={18}/><strong>{changes.length}</strong><span>recent access changes</span></div>
      <div className="reward-stat"><History size={18}/><strong>{audits.length}</strong><span>recent audit runs</span></div>
    </div>
    <div className="action-row"><button className="button secondary" onClick={onRefresh} disabled={loading}>{loading?'Refreshing…':'Refresh governance history'}</button></div>
    <div className="dashboard-grid">
      <article className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CAPABILITY CHANGES</span><h3>Recent owner actions</h3></div></div>{changes.length?changes.slice(0,8).map(row=><div className="business-row" key={row.id}><div><strong>{row.reason||'Capability access change'}</strong><span>{when(row.created_at)} · target {row.target_user_id||'unknown'}</span></div></div>):<p className="muted">No capability changes are recorded in the current history window.</p>}</article>
      <article className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">AUDIT RUNS</span><h3>Architecture governance</h3></div></div>{audits.length?audits.slice(0,8).map(row=><div className="business-row" key={row.id}><div><strong>{row.source||'Capability audit'}</strong><span>{when(row.executed_at)} · {n(row.issue_count)} issues · {n(row.uncovered_rpc_count)} uncovered RPCs</span></div></div>):<p className="muted">No capability audit runs are recorded in the current history window.</p>}</article>
    </div>
    <details><summary>Retired backend contracts ({retirements.length})</summary><div className="business-list">{retirements.length?retirements.slice(0,12).map(row=><div className="business-row" key={row.id}><div><strong>{row.function_signature}</strong><span>{row.canonical_replacement?`Replacement: ${row.canonical_replacement} · `:''}{when(row.retired_at)}</span></div></div>):<p className="muted">No retired contracts are recorded.</p>}</div></details>
  </section>;
}
