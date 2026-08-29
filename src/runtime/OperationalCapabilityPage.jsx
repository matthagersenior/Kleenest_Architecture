import{useEffect,useMemo,useState}from'react';
import{Database,RefreshCw,Search,CheckCircle2,AlertTriangle,ShieldCheck,ArrowRight,Layers3,Code2,XCircle,Link2}from'lucide-react';
import{Link}from'react-router-dom';
import{useAppContext}from'../AppContext.jsx';
import{getCapabilityRegistry}from'../architecture/capabilityRegistry.js';
import WorkspaceShell from'./WorkspaceShell.jsx';
import'./OperationalCapabilityPage.css';

const REGISTRY=getCapabilityRegistry();
const label=s=>String(s||'').replaceAll('_',' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\b\w/g,m=>m.toUpperCase());
const routes={identity:'/profile',locations:'/map',discovery:'/map',maps:'/map',checkins:'/activity',reviews:'/community',evidence:'/evidence',qr:'/engage',geofencing:'/engagement/orchestrate',progression:'/play',quests:'/play/quest',rewards:'/rewards',reputation:'/profile',leaderboards:'/leaderboards',business:'/business',businessLifecycle:'/business',access:'/access',monetization:'/pricing',fleet:'/fleet',enterprise:'/enterprise',social:'/community',family:'/family',notifications:'/notifications',analytics:'/intelligence',liveNetwork:'/intelligence',intelligence:'/intelligence',reporting:'/owner/reports',externalData:'/admin',offline:'/route',support:'/support',admin:'/admin'};
const serviceReady=(services,names)=>names.every(name=>Boolean(services?.[name]));

export default function OperationalCapabilityPage(){
 const{profile,services,isPlatformOwner,loading:authLoading}=useAppContext();
 const[data,setData]=useState([]),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const ready=!authLoading&&isPlatformOwner&&!!profile;
 const load=async()=>{if(!ready){setLoading(false);return}setLoading(true);setError('');try{const v=await services.admin.backendResourceCatalog(profile);setData(Array.isArray(v)?v:(v?.items||v?.rows||v?.data||[]))}catch(e){setData([]);setError(e.message||'Unable to load live backend resource catalog.')}finally{setLoading(false)}};
 useEffect(()=>{if(authLoading)return;if(ready)void load();else setLoading(false)},[authLoading,isPlatformOwner,profile,services]);
 const backend=useMemo(()=>new Map(data.map(x=>[String(x.resource||''),x])),[data]);
 const rows=useMemo(()=>Object.entries(REGISTRY).map(([id,cap])=>{
   const facts=(cap.facts||[]).map(String);
   const evidence=facts.map(resource=>backend.get(resource)).filter(Boolean);
   const coverage=serviceReady(services,cap.services||[]);
   const exists=evidence.some(item=>item.exists!==false);
   const status=!evidence.length?'backend_resource_gap':coverage?'backend_evidence':'backend_evidence_runtime_gap';
   return{id,...cap,label:cap.label||label(id),evidence,coverage,exists,route:routes[id]||null,status};
 }),[services,data,backend]);
 const filtered=useMemo(()=>rows.filter(x=>!query||`${x.id} ${x.label} ${x.domain||''} ${(x.facts||[]).join(' ')} ${(x.services||[]).join(' ')} ${x.status} ${x.evidence.map(v=>v.resource).join(' ')}`.toLowerCase().includes(query.toLowerCase())),[rows,query]);
 const backendEvidence=rows.filter(x=>x.evidence.some(v=>v.exists!==false));
 const runtimeGaps=rows.filter(x=>x.exists&&!x.coverage);
 const investigation=rows.filter(x=>!x.evidence.length);
 const fullyReconciled=rows.filter(x=>x.exists&&x.coverage);
 if(authLoading)return <WorkspaceShell workspace="owner"><section className="empty-state"><ShieldCheck size={28}/><h2>Loading capability catalog</h2><p>Waiting for the authenticated owner session.</p></section></WorkspaceShell>;
 if(!isPlatformOwner)return <WorkspaceShell workspace="consumer"><section className="empty-state"><ShieldCheck size={28}/><h2>Capability catalog</h2><p>Platform owner access is required.</p></section></WorkspaceShell>;
 return <WorkspaceShell workspace="owner"><section className="page capability-operations">
   <div className="page-header"><div><span className="eyebrow">CANONICAL CAPABILITY REGISTRY</span><h1>Operational Capabilities</h1><p>The registry contains the complete 31-domain product model. Live backend evidence is reconciled against the protected public schema catalog at the resource/fact level, while runtime service coverage is checked separately.</p></div><div className="hero-actions"><Link className="button secondary" to="/admin/capabilities"><Layers3 size={16}/>Capability Hub</Link><button className="button secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>{loading?'Refreshing…':'Refresh catalog'}</button></div></div>
   {error&&<p className="form-error" role="alert">{error}</p>}
   <section className="reward-stats">
    <div className="reward-stat"><Layers3 size={18}/><strong>{rows.length}</strong><span>registry domains</span></div>
    <div className="reward-stat"><Database size={18}/><strong>{data.length}</strong><span>backend resources</span></div>
    <div className="reward-stat"><CheckCircle2 size={18}/><strong>{fullyReconciled.length}</strong><span>evidence + runtime</span></div>
    <div className="reward-stat"><AlertTriangle size={18}/><strong>{investigation.length+runtimeGaps.length}</strong><span>reconciliation queue</span></div>
   </section>
   <section className="detail-panel"><div className="hero-actions"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search capability, service, fact, backend resource, or workspace" aria-label="Search capabilities"/></div></section>
   <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">RECONCILED CAPABILITY MATRIX</span><h2>{filtered.length} of {rows.length} registry domains</h2><p>{backendEvidence.length} have backend evidence, {runtimeGaps.length} have backend evidence but a runtime-service gap, and {investigation.length} have no mapped fact/resource yet.</p></div><Code2 size={21}/></div><div className="business-list">
    {filtered.map(x=><div className="business-row" key={x.id}>
      <div><strong>{x.label}</strong><span>{label(x.id)} · {x.services?.length||0} services · {x.facts?.length||0} canonical facts · {x.evidence.length} backend evidence records</span><small>{x.evidence.length?`Evidence: ${x.evidence.slice(0,6).map(v=>`${label(v.resource)}${v.resource_type?` (${label(v.resource_type)})`:''}`).join(', ')}${x.evidence.length>6?'…':''}`:'No matching backend resource is currently mapped to the registry facts for this domain.'}</small></div>
      <div className="hero-actions"><span className={`tag ${x.status==='backend_evidence'?'active':''}`}>{label(x.status)}</span>{x.route&&<Link className="button secondary" to={x.route}>Open <ArrowRight size={14}/></Link>}</div>
    </div>)}
    {!filtered.length&&!loading&&<div className="empty-state"><Search size={20}/><strong>No matching capabilities</strong></div>}
   </div></section>
   <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE BACKEND EVIDENCE</span><h2>{data.length} governed public resources</h2><p>Tables, views, materialized views, and public functions are cataloged from PostgreSQL metadata. Estimated row counts are diagnostic evidence, not capability status.</p></div><Database size={21}/></div>{data.length?<div className="business-list">{data.slice(0,300).map((x,i)=><div className="business-row" key={`${x.resource||'record'}-${x.resource_type||'resource'}-${i}`}><div><strong>{label(x.resource)}</strong><span>{label(x.resource_type)} · {x.exists===false?'resource missing':'resource present'} · {x.estimated_rows==null?'row estimate unavailable':`${Math.max(0,Number(x.estimated_rows)).toLocaleString()} estimated rows`}</span></div><span className="tag active">LIVE</span></div>)}</div>:<div className="empty-state"><Database size={20}/><strong>{loading?'Loading live catalog…':'No backend resources returned'}</strong><span>{error?'Backend query failed; no state is inferred.':'The protected catalog returned no resources.'}</span></div>}</section>
   {investigation.length>0&&<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">INVESTIGATION QUEUE</span><h2>{investigation.length} domains have no mapped backend evidence yet</h2><p>These are the only domains for which the current canonical fact list has no matching public schema resource. They are not being labeled "missing" merely because their domain name is not a table.</p></div><XCircle size={21}/></div><div className="business-list">{investigation.map(x=><div className="business-row" key={`investigate-${x.id}`}><div><strong>{x.label}</strong><span>{x.services?.length||0} expected services · {x.facts?.length||0} expected facts</span><small>{(x.facts||[]).slice(0,10).map(label).join(' · ')}</small></div><Link className="button secondary" to={x.route||'/admin/capabilities'}><Link2 size={14}/>Inspect surface</Link></div>)}</div></section>}
   {runtimeGaps.length>0&&<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">RUNTIME GAP QUEUE</span><h2>{runtimeGaps.length} domains have backend evidence but incomplete service coverage</h2><p>Backend evidence is real; the remaining work is to reconcile the frontend/domain service boundary rather than create another database object.</p></div><AlertTriangle size={21}/></div><div className="business-list">{runtimeGaps.map(x=><div className="business-row" key={`runtime-${x.id}`}><div><strong>{x.label}</strong><span>Backend evidence present · expected services: {(x.services||[]).join(', ')||'none declared'}</span></div><span className="tag">RUNTIME GAP</span></div>)}</div></section>}
   <small>Authority: admin_backend_resource_catalog() → live PostgreSQL public schema evidence; capabilityRegistry.js remains the product model and is never silently promoted to wired status.</small>
 </section></WorkspaceShell>;
}
