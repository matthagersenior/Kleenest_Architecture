import {useEffect,useState} from 'react';
import {CalendarDays,Gift,Megaphone,Power,QrCode,RefreshCw,Trophy} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

const arr=v=>Array.isArray(v)?v:[];
const Card=({icon:Icon,title,children})=><section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">ASSET LIFECYCLE</span><h2>{title}</h2></div><Icon size={20}/></div>{children}</section>;
const Action=({busy,children,...p})=><button className="secondary" disabled={busy} {...p}>{busy?'Saving…':children}</button>;

export default function BusinessAssetLifecyclePage(){
 const {services,user}=useAppContext();
 const [business,setBusiness]=useState(null),[locations,setLocations]=useState([]),[qrs,setQrs]=useState([]),[campaigns,setCampaigns]=useState([]),[promotions,setPromotions]=useState([]),[events,setEvents]=useState([]),[contests,setContests]=useState([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const bs=arr(await services.business.listBusinesses());const b=bs[0]||null;setBusiness(b);if(!b)return;const id=b.business_id||b.id;const [l,q,c,p,e,x]=await Promise.all([services.business.listLocations(id),services.business.listQrs(id),services.business.listCampaigns(id),services.business.listPromotions(id),services.business.listEvents(id),services.business.listContests(id)]);setLocations(arr(l));setQrs(arr(q));setCampaigns(arr(c));setPromotions(arr(p));setEvents(arr(e));setContests(arr(x));}catch(e){setError(e.message||'Unable to load asset lifecycle.')}finally{setLoading(false)}};
 useEffect(()=>{if(user)void load();else setLoading(false)},[user]);
 const run=async(key,fn)=>{setBusy(key);setMessage('');setError('');try{await fn();setMessage('Asset updated.');await load()}catch(e){setError(e.message||'Unable to update asset.')}finally{setBusy('')}};
 if(!user)return <WorkspaceShell workspace="business"><section className="empty-state"><h2>Sign in to manage assets</h2><Link className="primary" to="/auth">Sign in</Link></section></WorkspaceShell>;
 if(loading)return <WorkspaceShell workspace="business"><section className="empty-state">Loading asset lifecycle…</section></WorkspaceShell>;
 if(!business)return <WorkspaceShell workspace="business"><section className="empty-state"><h2>No business account</h2><Link className="secondary" to="/business">Business dashboard</Link></section></WorkspaceShell>;
 const id=business.business_id||business.id;
 return <WorkspaceShell workspace="business"><section className="page"><div className="page-header"><div><span className="eyebrow">BUSINESS OPERATIONS</span><h1>Asset lifecycle</h1><p>Create, activate, pause, update, and retire the assets customers interact with.</p></div><div className="hero-actions"><Link className="secondary" to="/business/manage">Create assets</Link><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button></div></div>
 {message&&<p className="form-success" role="status">{message}</p>}{error&&<p className="form-error" role="alert">{error}</p>}
 <div className="business-manage-grid">
 <Card icon={Power} title="Locations">{locations.slice(0,10).map(x=><div className="management-item" key={x.id}><span><strong>{x.name||'Location'}</strong><small>{x.is_active===false?'Inactive':'Active'}</small></span><Action busy={busy===`location-${x.id}`} onClick={()=>run(`location-${x.id}`,()=>services.business.setLocationActive(id,x.id,x.is_active===false))}><Power size={15}/>{x.is_active===false?'Activate':'Deactivate'}</Action></div>)}{!locations.length&&<p>No locations yet.</p>}</Card>
 <Card icon={QrCode} title="QR programs">{qrs.slice(0,10).map(x=><div className="management-item" key={x.id}><span><strong>{x.label||'QR code'}</strong><small>{x.active===false?'Inactive':'Active'}</small></span><Action busy={busy===`qr-${x.id}`} onClick={()=>run(`qr-${x.id}`,()=>services.business.setQrActive(id,x.id,x.active===false))}><Power size={15}/>{x.active===false?'Activate':'Deactivate'}</Action></div>)}{!qrs.length&&<p>No QR assets yet.</p>}</Card>
 <Card icon={Megaphone} title="Campaigns">{campaigns.slice(0,10).map(x=><div className="management-item" key={x.id}><span><strong>{x.name||x.title||'Campaign'}</strong><small>{x.status||'draft'}</small></span><Action busy={busy===`campaign-${x.id}`} onClick={()=>run(`campaign-${x.id}`,()=>services.business.pauseCampaign(id,x.id))}>{String(x.status).toLowerCase()==='paused'?'Paused':'Pause'}</Action></div>)}{!campaigns.length&&<p>No campaigns yet.</p>}</Card>
 <Card icon={Gift} title="Promotions">{promotions.slice(0,10).map(x=><div className="management-item" key={x.id}><span><strong>{x.title||x.name||'Promotion'}</strong><small>{x.active===false?'Inactive':'Active'}</small></span><Action busy={busy===`promotion-${x.id}`} onClick={()=>run(`promotion-${x.id}`,()=>services.business.managePromotion(id,x.id,x.active===false?'activate':'deactivate',{}))}><Power size={15}/>{x.active===false?'Activate':'Deactivate'}</Action></div>)}{!promotions.length&&<p>No promotions yet.</p>}</Card>
 <Card icon={CalendarDays} title="Events">{events.slice(0,10).map(x=><div className="management-item" key={x.id}><span><strong>{x.title||x.name||'Event'}</strong><small>{x.event_date||'Scheduled'}</small></span><Action busy={busy===`event-${x.id}`} onClick={()=>run(`event-${x.id}`,()=>services.business.deleteEvent(id,x.id))}>Delete</Action></div>)}{!events.length&&<p>No events yet.</p>}</Card>
 <Card icon={Trophy} title="Contests">{contests.slice(0,10).map(x=><div className="management-item" key={x.id}><span><strong>{x.name||x.title||'Contest'}</strong><small>{x.status||'draft'}</small></span><Action busy={busy===`contest-${x.id}`} onClick={()=>run(`contest-${x.id}`,()=>services.business.deleteContest(id,x.id))}>Delete</Action></div>)}{!contests.length&&<p>No contests yet.</p>}</Card>
 </div></section></WorkspaceShell>;
}
