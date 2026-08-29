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
 const load=async()=>{if(!ready){setLoading(false);return}setLoading(true);setError('');try{const v=await services.admin.operationalCapabilityCatalog(profile);setData(Array.isArray(v)?v:(v?.items||v?.rows||v?.data||[]))}catch(e){setData([]);setError(e.message||'Unable to load operational capability catalog.')}finally{setLoading(false)}};
 useEffect(()=>{if(authLoading)return;if(ready)void load();else setLoading(false)},[authLoading,isPlatformOwner,profile,services]);
 const backend=useMemo(()=>new Map(data.map(x=>[String(x.resource||x.feature_code||''),x])),[data]);
 const rows=useMemo(()=>Object.entries(REGISTRY).map(([id,cap])=>{
   const resources=(cap.facts||[]).map(String);
   const evidence=data.filter(item=>resources.includes(String(item.resource||item.feature_code||'')));
   const catalog=backend.get(id);
   const coverage=serviceReady(services,cap.services||[]);
   const exists=evidence.some(item=>item.exists!==false);
   const status=catalog?.status||(!evidence.length?'unverified_runtime':coverage&&exists?'backend_evidence':exists?'backend_evidence_runtime_gap':'backend_resource_gap');
   return{id,...cap,label:cap.label||label(id),catalog,evidence,coverage,exists,route:routes[id]||null,status};
 }),[services,data,backend]);
 const filtered=useMemo(()=>rows.filter(x=>!query||`${x.id} ${x.label} ${x.domain||''} ${(x.facts||[]).join(' ')} ${(x.services||[]).join(' ')} ${x.status} ${x.evidence.map(v=>v.resource).join(' ')}`.toLowerCase().includes(query.toLowerCase())),[rows,query]);
 const backendEvidence=rows.filter(x=>x.evidence.some(v=>v.exists!==false));
 const readyRows=rows.filter(x=>x.coverage&&x.exists);
 const investigation=rows.filter(x=>!x.evidence.length);
 const directCatalog=rows.filter(x=>x.catalog);
 if(authLoading)return <WorkspaceShell workspace="owner"><section className="empty-state"><ShieldCheck size={28}/><h2>Loading capability catalog</h2><p>Waiting for the authenticated owner session.</p></section></WorkspaceShell>;
 if(!isPlatformOwner)return <WorkspaceShell workspace="consumer"><section className="empty-state"><ShieldCheck size={28}/><h2>Capability catalog</h2><p>Platform owner access is required.</p></section></WorkspaceShell>;
 return <WorkspaceShell workspace="owner"><section className="page capability-operations">
   <div className="page-header"><div><span className="eyebrow">CANONICAL CAPABILITY REGISTRY</span><h1>Operational Capabilities</h1><p>The registry contains the complete 31-domain product model. Live backend evidence is reconciled at the resource/fact level so a capability is not incorrectly marked missing just because its domain name is not itself a database table.</p></div><div className="hero-actions"><Link className="button secondary" to="/admin/capabilities"><Layers3 size={16}/>Capability Hub</Link><button className="button secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>{loading?'Refreshing…':'Refresh catalog'}</button></div></div>
   {error&&<p className="form-error" role="alert">{error}</p>}
   <section className="reward-stats">
    <div className="reward-stat"><Layers3 size={18}/><strong>{rows.length}</strong><span>registry domains</span></div>
    <div className="reward-stat"><Database size={18}/><strong>{data.length}</strong><span>backend resources</span></div>
    <div className="reward-stat"><CheckCircle2 size={18}/><strong>{backendEvidence.length}</strong><span>domains with backend evidence</span></div>
    <div className="reward-stat"><AlertTriangle size={18}/><strong>{investigation.length}</strong><span>domains needing investigation</span></div>
   </section>
   <section className="detail-panel"><div className="hero-actions"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search capability, service, fact, backend resource, or workspace" aria-label="Search capabilities"/></div></section>
   <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">RECONCILED CAPABILITY MATRIX</span><h2>{filtered.length} of {rows.length} registry domains</h2><p>{readyRows.length} have both runtime service coverage and at least one existing backend fact/resource. {directCatalog.length} also have a direct catalog record.</p></div><Code2 size={21}/></div><div className="business-list">
    {filtered.map(x=><div className="business-row" key={x.id}>
      <div><strong>{x.label}</strong><span>{label(x.id)} · {x.services?.length||0} services · {x.facts?.length||0} canonical facts · {x.evidence.length} backend evidence records</span><small>{x.evidence.length?`Evidence: ${x.evidence.slice(0,5).map(v=>label(v.resource)).join(', ')}${x.evidence.length>5?'…':''}`:'No matching backend resource is currently mapped to the registry facts for this domain.'}</small></div>
      <div className="hero-actions"><span className={`tag ${x.status==='backend_evidence'||x.status==='wired'?'active':''}`}>{label(x.status)}</span>{x.route&&<Link className="button secondary" to={x.route}>Open <ArrowRight size={14}/></Link>}</div>
    </div>)}
    {!filtered.length&&!loading&&<div className="empty-state"><Search size={20}/><strong>No matching capabilities</strong></div>}
   </div></section>
   <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE BACKEND EVIDENCE</span><h2>{data.length} governed resources</h2><p>These records come from the protected operational catalog. They are evidence for capability domains, not one-to-one capability names.</p></div><Database size={21}/></div>{data.length?<div className="business-list">{data.slice(0,250).map((x,i)=><div className="business-row" key={`${x.resource||x.feature_code||'record'}-${i}`}><div><strong>{label(x.feature_code||x.resource)}</strong><span>{label(x.workspace)} · {label(x.category)} · {x.exists===false?'backend resource missing':'backend resource present'} · {x.estimated_rows==null?'row count unavailable':`${Math.max(0,Number(x.estimated_rows)).toLocaleString()} estimated rows`}</span></div><span className={`tag ${x.status==='wired'?'active':''}`}>{label(x.status||'unknown')}</span></div>)}</div>:<div className="empty-state"><Database size={20}/><strong>{loading?'Loading live catalog…':'No backend catalog records returned'}</strong><span>{error?'Backend query failed; no state is inferred.':'The protected catalog returned no records.'}</span></div>}</section>
   {investigation.length>0&&<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">INVESTIGATION QUEUE</span><h2>{investigation.length} domains have no mapped backend evidence yet</h2><p>This is now a precise investigation queue rather than a blanket "unverified" label. Each domain retains its canonical services and facts so the next slice can classify an existing RPC/table/Edge Function as canonical, supporting, internal, legacy, or unknown.</p></div><XCircle size={21}/></div><div className="business-list">{investigation.map(x=><div className="business-row" key={`investigate-${x.id}`}><div><strong>{x.label}</strong><span>{x.services?.length||0} expected services · {x.facts?.length||0} expected facts</span><small>{(x.facts||[]).slice(0,8).map(label).join(' · ')}</small></div><Link className="button secondary" to={x.route||'/admin/capabilities'}><Link2 size={14}/>Inspect surface</Link></div>)}</div></section>}
   <small>Authority: admin_operational_capability_catalog() → live Supabase schema evidence; registry domains remain the product model and are never silently promoted to wired status.</small>
 </section></WorkspaceShell>;
}
