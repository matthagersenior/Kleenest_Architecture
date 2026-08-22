import {useEffect,useState} from 'react';
import {CloudOff,MapPin,RefreshCw,Upload,CheckCircle2} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

export default function OfflineJourneyPage(){
 const {services}=useAppContext();
 const [online,setOnline]=useState(typeof navigator==='undefined'||navigator.onLine),[packs,setPacks]=useState([]),[pending,setPending]=useState([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const load=async()=>{try{const[p,e]=await Promise.all([services.offline.listCached(),services.offline.pending()]);setPacks(Array.isArray(p)?p:[]);setPending(Array.isArray(e)?e:[])}catch(e){setError(e.message||'Unable to inspect offline state.')}};
 useEffect(()=>{const on=()=>setOnline(true),off=()=>setOnline(false);addEventListener('online',on);addEventListener('offline',off);void load();return()=>{removeEventListener('online',on);removeEventListener('offline',off)}},[]);
 const sync=async()=>{setBusy(true);setError('');setMessage('');try{const r=await services.offline.sync();setMessage(`${r.synced||0} queued action(s) synchronized; ${r.pending||0} remain pending.`);await load()}catch(e){setError(e.message||'Synchronization failed.')}finally{setBusy(false)}};
 return <WorkspaceShell><section className="page"><div className="page-header"><div><span className="eyebrow">CONSUMER CONTINUITY</span><h1>Offline journey</h1><p>Keep the Map → Visit → Evidence workflow usable when connectivity is interrupted.</p></div><div className="hero-actions"><span className="membership-badge">{online?'Online':'Offline'}</span><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button></div></div>
 {message&&<p className="form-success" role="status">{message}</p>}{error&&<p className="form-error" role="alert">{error}</p>}
 <section className="reward-stats"><div className="reward-stat"><MapPin size={18}/><strong>{packs.length}</strong><span>cached packs</span></div><div className="reward-stat"><Upload size={18}/><strong>{pending.length}</strong><span>queued actions</span></div><div className="reward-stat"><CloudOff size={18}/><strong>{online?'Connected':'Offline'}</strong><span>network</span></div></section>
 <div className="dashboard-grid"><article className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">REPLAY</span><h2>Queued consumer activity</h2></div><Upload size={22}/></div><p>Offline check-ins, observations, and arrival events remain queued locally until they can be replayed through the authoritative services.</p><button className="primary" onClick={sync} disabled={busy||!online}><Upload size={16}/>{busy?'Synchronizing…':'Synchronize now'}</button></article><article className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">RECOVERY</span><h2>Continue your journey</h2></div><CheckCircle2 size={22}/></div><div className="hero-actions"><Link className="secondary" to="/map">Open Map</Link><Link className="secondary" to="/visit">Open Visit</Link><Link className="secondary" to="/evidence">Add evidence</Link></div></article></div>
 <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CACHE</span><h2>Available offline packs</h2></div></div>{packs.length?packs.map(p=><div className="business-row" key={p.id}><div><strong>{p.name||'Offline pack'}</strong><span>{p.pack_type||'area'} · {p.cached_at?new Date(p.cached_at).toLocaleString():''}</span></div></div>):<p>No cached packs are available.</p>}</section>
 </section></WorkspaceShell>
}
