import {useEffect,useState} from 'react';
import {Activity,Database,Search,ShieldCheck,Users,RefreshCw,ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

const resources=['profiles','families','family_members','businesses','fleets','locations','location_evidence','routes','campaigns','contests','subscriptions','support_requests','activity_events','notifications'];

function value(obj,key,fallback='—'){const v=obj?.[key];return v===null||v===undefined||v===''?fallback:v}

export default function OwnerControlCenter(){
 const {profile,services}=useAppContext();
 const [overview,setOverview]=useState(null),[integrity,setIntegrity]=useState(null),[query,setQuery]=useState(''),[users,setUsers]=useState([]),[loading,setLoading]=useState(true),[searching,setSearching]=useState(false),[error,setError]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const[o,i]=await Promise.all([services.admin.overview(profile),services.admin.integrity(profile)]);setOverview(o);setIntegrity(i)}catch(e){setError(e.message||'Unable to load owner diagnostics.')}finally{setLoading(false)}};
 useEffect(()=>{void load()},[profile,services]);
 const search=async()=>{if(!query.trim())return;setSearching(true);setError('');try{setUsers(await services.admin.searchUsers(profile,query.trim()))}catch(e){setError(e.message||'Unable to search users.')}finally{setSearching(false)}};
 return <WorkspaceShell workspace="owner"><section className="page">
  <div className="page-header"><div><span className="eyebrow">PLATFORM OPERATIONS</span><h1>Owner Control Center</h1><p>Operate the platform through the existing owner-authorized control plane.</p></div><div className="hero-actions"><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Refresh</button></div></div>
  {error&&<p className="form-error" role="alert">{error}</p>}
  <section className="reward-stats">
   <div className="reward-stat"><Activity size={18}/><strong>{loading?'…':value(overview,'users_count',value(overview,'total_users'))}</strong><span>users</span></div>
   <div className="reward-stat"><Database size={18}/><strong>{loading?'…':value(overview,'businesses_count',value(overview,'total_businesses'))}</strong><span>businesses</span></div>
   <div className="reward-stat"><ShieldCheck size={18}/><strong>{loading?'…':value(integrity,'status',value(integrity,'health','Ready'))}</strong><span>integrity</span></div>
   <div className="reward-stat"><Users size={18}/><strong>{resources.length}</strong><span>governed resources</span></div>
  </section>
  <div className="dashboard-grid">
   <article className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">HEALTH</span><h2>Platform integrity</h2></div><ShieldCheck size={22}/></div><p>{integrity?.summary||integrity?.message||'Integrity diagnostics are available from the owner control plane.'}</p><details><summary>Diagnostic details</summary><pre>{JSON.stringify(integrity,null,2)}</pre></details></article>
   <article className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">OVERVIEW</span><h2>Platform snapshot</h2></div><Activity size={22}/></div><details open><summary>Current overview</summary><pre>{JSON.stringify(overview,null,2)}</pre></details></article>
  </div>
  <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ACCOUNTS</span><h2>Global user search</h2></div><Search size={22}/></div><div className="hero-actions"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Email, name, or user identifier"/><button className="primary" onClick={search} disabled={searching||!query.trim()}><Search size={16}/>{searching?'Searching…':'Search'}</button></div>{users.length>0&&<div className="business-list">{users.map((u,i)=><div className="business-row" key={u.id||i}><div><strong>{u.email||u.name||u.id||'User'}</strong><span>{u.id||'No identifier returned'}</span></div><ArrowRight size={16}/></div>)}</div>}</section>
  <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CONTROL PLANES</span><h2>Owner operations</h2></div></div><div className="hero-actions"><Link className="secondary" to="/owner/data">Governed data</Link><Link className="secondary" to="/owner/audit">Audit history</Link><Link className="secondary" to="/admin/maintenance">Maintenance & ingestion</Link><Link className="secondary" to="/owner/preview">Tier preview</Link></div></section>
 </section></WorkspaceShell>
}
