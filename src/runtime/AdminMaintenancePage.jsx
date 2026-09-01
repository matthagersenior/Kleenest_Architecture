import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, MapPinned, Settings2, Radio, Users, Building2, Wrench, Network, ShieldCheck, Database, Globe2, RefreshCw } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import AiAssistPanel from './AiAssistPanel.jsx';
import AdminControlPlaneHistoryPanel from './AdminControlPlaneHistoryPanel.jsx';
import './AdminMaintenancePage.css';

const n=v=>Number.isFinite(Number(v))?Number(v):0;
const sourceUsage=(status,key)=>Array.isArray(status?.today_usage)?status.today_usage.find(x=>x.source_key===key)||{}:{};
const bytes=v=>{const x=Number(v||0);if(x>=1024**3)return`${(x/1024**3).toFixed(2)} GB`;if(x>=1024**2)return`${(x/1024**2).toFixed(0)} MB`;return`${Math.round(x/1024)} KB`;};
const stamp=v=>{if(!v)return'never';const d=new Date(v);return Number.isNaN(d.getTime())?'unknown':d.toLocaleString();};
const age=v=>{if(!v)return'unknown';const ms=Date.now()-new Date(v).getTime();if(!Number.isFinite(ms))return'unknown';const s=Math.max(0,Math.round(ms/1000));if(s<60)return`${s}s ago`;const m=Math.round(s/60);if(m<60)return`${m}m ago`;return`${Math.round(m/60)}h ago`;};
const osmLabel=p=>{if(!p)return'not started';const sub=p.subdivision,cells=Array.isArray(sub?.cells)?sub.cells:[];return`${n(p.tile_cursor)}/${n(p.tile_count)||'?' } tiles${sub&&cells.length?` · subdivision ${n(sub.index)+1}/${cells.length} · L${n(sub.level)||1}`:''}`;};
const dataGovLabel=p=>p?`${n(p.query_cursor)}/${n(p.query_count)||'?'} searches`:'not started';

export default function AdminMaintenancePage(){
  const { services, profile, isPlatformOwner, loading: authLoading } = useAppContext();
  const [busy,setBusy]=useState('');
  const [result,setResult]=useState(null);
  const [resultOperation,setResultOperation]=useState('');
  const [snapshot,setSnapshot]=useState(null);
  const [snapshotError,setSnapshotError]=useState('');
  const [history,setHistory]=useState(null);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [historyError,setHistoryError]=useState('');
  const [ingestion,setIngestion]=useState(null);
  const [ingestionError,setIngestionError]=useState('');
  const [storage,setStorage]=useState(null);

  const loadSnapshot=async()=>{if(authLoading||!isPlatformOwner||!profile)return;setSnapshotError('');try{setSnapshot(await services.admin.controlPlaneSnapshot(profile));}catch(error){setSnapshotError(error?.message||'Unable to load owner control-plane snapshot.');}};
  const loadHistory=async()=>{if(authLoading||!isPlatformOwner||!profile)return;setHistoryLoading(true);setHistoryError('');try{setHistory(await services.admin.controlPlaneHistory(profile,50));}catch(error){setHistoryError(error?.message||'Unable to load owner governance history.');}finally{setHistoryLoading(false);}};
  const loadIngestion=async()=>{if(authLoading||!isPlatformOwner||!profile)return;setIngestionError('');try{const status=await services.admin.nationalIngestionStatus(profile);setIngestion(status);setStorage(status?.storage_guard||null);}catch(error){setIngestionError(error?.message||'Unable to load national ingestion status.');}};
  useEffect(()=>{void loadSnapshot();void loadHistory();void loadIngestion();},[authLoading,isPlatformOwner,profile]);
  useEffect(()=>{if(authLoading||!isPlatformOwner||!profile)return;const id=setInterval(()=>void loadIngestion(),15000);return()=>clearInterval(id);},[authLoading,isPlatformOwner,profile]);
  const refreshControlPlane=async()=>{await Promise.all([loadSnapshot(),loadHistory(),loadIngestion()]);};
  const run=async(key,fn)=>{if(authLoading||!isPlatformOwner||!profile)return;setBusy(key);setResult(null);setResultOperation(key);try{setResult(await fn());await refreshControlPlane();}catch(error){setResult({ok:false,error:error?.message||String(error)})}finally{setBusy('')}};
  const setResumeAuthorization=authorized=>run(authorized?'authorize-ingestion':'revoke-ingestion',()=>services.admin.setNationalIngestionResumeAuthorization(profile,authorized));

  if(authLoading)return <WorkspaceShell workspace="admin"><section className="empty-state"><ShieldCheck size={28}/><h2>Loading administration</h2><p>Waiting for the authenticated owner session before starting administrative operations.</p></section></WorkspaceShell>;
  if(!isPlatformOwner)return <WorkspaceShell workspace="consumer"><section className="empty-state"><ShieldCheck size={28}/><h2>Administration unavailable</h2><p>Platform owner access is required for security and maintenance operations.</p></section></WorkspaceShell>;

  const overview=snapshot?.overview||{},integrity=snapshot?.integrity||{},capSummary=snapshot?.capabilities?.summary||{},resources=Array.isArray(snapshot?.resources?.items)?snapshot.resources.items:[];
  const markets=ingestion?.markets||{},activeMarkets=Array.isArray(ingestion?.active_markets)?ingestion.active_markets:[],recentRuns=Array.isArray(ingestion?.recent_runs)?ingestion.recent_runs:[],scheduler=ingestion?.scheduler||{},osmUsage=sourceUsage(ingestion,'osm'),dataGovUsage=sourceUsage(ingestion,'data_gov');
  const storagePct=n(storage?.observed_percent),pausePct=n(storage?.pause_fraction)*100,hardPct=n(storage?.hard_stop_fraction)*100;

  return <WorkspaceShell workspace="admin"><section className="page admin-maintenance">
    <header className="admin-hero"><div><span className="eyebrow">ADMINISTRATION · CONTROL PLANE</span><h1>Network operations & platform health</h1><p>Govern the Kleenest network from one owner-only surface with authoritative platform health, capability contracts, backend resources, automated ingestion, diagnostics, source provenance, and governance history.</p></div><div className="hero-actions"><button className="button secondary" onClick={refreshControlPlane}><RefreshCw size={17}/>Refresh control plane</button><Link className="button secondary" to="/admin/capabilities"><Network size={17}/>Capability Hub</Link><Link className="button secondary" to="/admin/operational-capabilities"><Database size={17}/>Operational catalog</Link></div></header>

    {snapshotError&&<p className="form-error" role="alert">{snapshotError}</p>}
    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">OWNER CONTROL PLANE</span><h2>Platform health snapshot</h2><p>One protected snapshot joins platform counts, integrity findings, capability authorization health, and live backend catalog state.</p></div><ShieldCheck size={22}/></div><div className="reward-stats"><div className="reward-stat"><Users size={18}/><strong>{n(overview.users)}</strong><span>users</span></div><div className="reward-stat"><Building2 size={18}/><strong>{n(overview.businesses)}</strong><span>businesses</span></div><div className="reward-stat"><MapPinned size={18}/><strong>{n(overview.locations)}</strong><span>locations</span></div><div className="reward-stat"><AlertTriangle size={18}/><strong>{n(integrity.high)}</strong><span>high integrity issues</span></div><div className="reward-stat"><Activity size={18}/><strong>{n(capSummary.backend_contract_present)}</strong><span>secured capability contracts</span></div><div className="reward-stat"><Database size={18}/><strong>{resources.length}</strong><span>cataloged backend resources</span></div></div><p className="muted">Integrity status: <strong>{integrity.status||'unavailable'}</strong> · Snapshot source remains live owner-only database authority.</p></section>

    <AdminControlPlaneHistoryPanel history={history} loading={historyLoading} error={historyError} onRefresh={loadHistory}/>

    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">CONTROL CENTER</span><h2>Network operations</h2></div><MapPinned size={22}/></div><div className="action-row"><Link className="button secondary" to="/admin/crud"><Settings2 size={18}/>Network CRUD</Link><Link className="button secondary" to="/owner/audit"><ShieldCheck size={18}/>Owner audit</Link><Link className="button secondary" to="/fleet"><Radio size={18}/>Fleet operations</Link><Link className="button secondary" to="/business"><Building2 size={18}/>Business operations</Link><Link className="button secondary" to="/map"><MapPinned size={18}/>Network map</Link><Link className="button secondary" to="/notifications"><Users size={18}/>Community activity</Link></div></section>

    <section className="admin-panel ingestion-live"><div className="panel-heading"><div><span className="eyebrow">NATIONAL DATA INGESTION · LIVE</span><h2>{storage?.paused?'Ingestion paused by storage guard':activeMarkets.length?`${activeMarkets.length} markets actively ingesting`:'National ingestion queue idle'}</h2><p>Live owner view of every running market, adaptive OSM checkpoint, Data.gov completion, recent runs, source quotas, scheduler state, and storage protection.</p></div><Globe2 size={22}/></div>
      {ingestionError&&<p className="form-error" role="alert">{ingestionError}</p>}
      <div className="notice">Status refreshed {age(ingestion?.refreshed_at)} · backend timestamp {stamp(ingestion?.refreshed_at)}</div>
      <div className="reward-stats"><div className="reward-stat"><MapPinned size={18}/><strong>{n(markets.completed)}/{n(markets.total)}</strong><span>markets completed</span></div><div className="reward-stat"><Activity size={18}/><strong>{n(markets.running)}</strong><span>markets running</span></div><div className="reward-stat"><Database size={18}/><strong>{storagePct.toFixed(1)}%</strong><span>observed disk use</span></div><div className="reward-stat"><Database size={18}/><strong>{bytes(storage?.observed_bytes)}</strong><span>DB + WAL observed</span></div><div className="reward-stat"><Database size={18}/><strong>{n(osmUsage.requests_used)}</strong><span>OSM requests today</span></div><div className="reward-stat"><Database size={18}/><strong>{n(osmUsage.records_imported)}</strong><span>OSM imported today</span></div></div>
      <div className="detail-grid"><div><span>Scheduler</span><strong>{scheduler?.active?'Active':'Inactive'} · {scheduler?.schedule||'unknown'}</strong></div><div><span>OSM quota</span><strong>{n(osmUsage.requests_used)}/500 today · 60/hour ceiling</strong></div><div><span>OSM runs</span><strong>{n(osmUsage.completed_runs)} completed · {n(osmUsage.failed_runs)} failed</strong></div><div><span>Data.gov imports</span><strong>{n(dataGovUsage.records_imported)} today</strong></div><div><span>Automatic pause</span><strong>{pausePct||50}% · {bytes(Number(storage?.allocation_bytes||0)*Number(storage?.pause_fraction||0.5))}</strong></div><div><span>Hard stop</span><strong>{hardPct||80}% · cannot be overridden</strong></div></div>

      <h3>Active markets</h3>
      <div className="market-grid">{activeMarkets.length?activeMarkets.map(m=>{const op=m?.source_progress?.osm||{},dg=m?.source_progress?.data_gov||{};return <div className="market-card" key={m.id||m.market_key}><strong>{m.name}{m.state_code?`, ${m.state_code}`:''}</strong><span>{m.current_source||'waiting'} · updated {age(m.updated_at)}</span><div className="ingestion-line"><b>OSM</b><span>{osmLabel(op)}</span></div><div className="ingestion-line"><b>Data.gov</b><span>{dataGovLabel(dg)}{dg.completed?' · complete':''}</span></div><div className="ingestion-line"><b>Records</b><span>{n(op.records_seen)} seen · {n(op.records_imported)} imported · {n(op.records_updated)} updated</span></div>{op.last_success_at&&<div className="ingestion-line"><b>Last OSM success</b><span>{stamp(op.last_success_at)}</span></div>}{op.last_error&&<p className="ingestion-error">{op.last_error}</p>}</div>}) : <p className="muted">No markets are currently running.</p>}</div>

      <h3>Recent ingestion runs</h3>
      <div className="run-list">{recentRuns.slice(0,12).map(r=><div className={`run-row ${r.status}`} key={r.id}><div><strong>{r.market_name||r.market_key||'Unknown market'} · {r.source_key}</strong><span>{stamp(r.started_at)} · {r.status}</span></div><div className="run-metrics"><span>{n(r.requests_used)} req</span><span>{n(r.records_seen)} seen</span><span>{n(r.records_imported)} imported</span><span>{n(r.records_updated)} updated</span></div><div className="run-detail">{r.error||r.detail?.endpoint||'Completed without error'}</div></div>)}</div>

      {storage?.paused&&!storage?.hard_stop&&<div className="action-row"><button disabled={!!busy} onClick={()=>setResumeAuthorization(true)}>{busy==='authorize-ingestion'?'Authorizing…':'Authorize ingestion continuation'}</button></div>}{storage?.resume_authorized&&!storage?.hard_stop&&<div className="action-row"><button className="secondary" disabled={!!busy} onClick={()=>setResumeAuthorization(false)}>{busy==='revoke-ingestion'?'Revoking…':'Return to 50% automatic pause'}</button></div>}
    </section>

    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">DIAGNOSTICS</span><h2>Data health & reconciliation</h2><p>These controls operate against protected owner-only functions and refresh the control-plane snapshot and governance history after completion.</p></div><Wrench size={22}/></div><div className="action-row"><button disabled={!!busy} onClick={()=>run('health',()=>services.admin.health(profile))}>{busy==='health'?'Checking…':'Backend health'}</button><button disabled={!!busy} onClick={()=>run('refresh',()=>services.admin.refreshDerived(profile))}>{busy==='refresh'?'Refreshing…':'Refresh derived data'}</button><button disabled={!!busy} onClick={()=>run('quality',()=>services.admin.locationQuality(profile))}>{busy==='quality'?'Auditing…':'Location quality audit'}</button><button disabled={!!busy} onClick={()=>run('addresses',()=>services.admin.backfillAddresses(profile,25))}>{busy==='addresses'?'Backfilling…':'Backfill 25 addresses'}</button></div></section>

    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">DATASET INTELLIGENCE</span><h2>External evidence is scheduler-managed</h2><p>Catalog discovery and provider imports run inside the national ingestion program. Review and intelligence tools remain available without duplicating ingestion controls.</p></div><Database size={22}/></div><div className="action-row"><Link className="button secondary" to="/intelligence">Open network intelligence</Link><Link className="button secondary" to="/admin/crud">Review external data</Link></div></section>

    {result&&<AiAssistPanel task="admin_operations" title="Admin operations copilot" description="Summarizes the authoritative result below and highlights failures, stale or low-quality signals, unusual counts, and the safest next checks. It cannot run maintenance actions." instruction="Summarize this administrative operation result. Identify concrete problems or anomalies and recommend only non-destructive next checks. Do not claim any repair occurred." context={{operation:resultOperation,result}} actionLabel="Analyze operation"/>}
    {result&&<pre className="result">{JSON.stringify(result,null,2)}</pre>}
  </section></WorkspaceShell>;
}
