import { useEffect,useState } from 'react';
import { BarChart3,Clock3,MapPin,Route as RouteIcon,ShieldCheck,Truck,UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';

const arr=v=>Array.isArray(v)?v:[];
const label=v=>v?.name||v?.display_name||v?.unit_code||'Unassigned';
const when=v=>v?new Date(v).toLocaleString():'Not scheduled';

export default function FleetUserDispatchPanel({businessId=null}){
  const{services}=useAppContext();
  const[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const load=async()=>{setLoading(true);setError('');try{setData(await services.fleet.currentUserDispatch(businessId||null));}catch(e){setError(e.message||'Unable to load your Fleet dispatch.');}finally{setLoading(false)}};
  useEffect(()=>{void load();const refresh=()=>void load();window.addEventListener('kleenest:fleet-updated',refresh);return()=>window.removeEventListener('kleenest:fleet-updated',refresh)},[businessId,services]);
  if(loading)return <section className="empty-state"><Truck size={32}/><h2>Loading your dispatch</h2><p>Retrieving only the vehicle, routes, stops, and performance assigned to your driver account.</p></section>;
  if(error)return <section className="empty-state"><ShieldCheck size={32}/><h2>Dispatch unavailable</h2><p>{error}</p></section>;
  if(!data?.driver)return <section className="empty-state"><UserRound size={32}/><h2>No driver assignment yet</h2><p>Your Fleet account is active, but it has not been linked to a driver record. A Fleet owner or admin can assign your driver identity and vehicle.</p></section>;
  const routes=arr(data.routes),score=data.performance||{},vehicle=data.vehicle;
  return <section className="fleet-user-dispatch">
    <header className="page-header"><div><span className="eyebrow">FLEET · MY DISPATCH</span><h1>Your assigned work</h1><p>Driver view only. Fleet command, assignment, configuration, and business-wide controls stay with Fleet owners and admins.</p></div><div className="hero-actions"><button className="secondary" onClick={load}>Refresh</button><Link className="secondary" to="/fleet/performance"><BarChart3 size={16}/>My performance</Link></div></header>
    <section className="reward-stats"><div className="reward-stat"><UserRound size={18}/><strong>{label(data.driver)}</strong><span>driver</span></div><div className="reward-stat"><Truck size={18}/><strong>{label(vehicle)}</strong><span>assigned vehicle</span></div><div className="reward-stat"><RouteIcon size={18}/><strong>{routes.length}</strong><span>assigned routes</span></div><div className="reward-stat"><BarChart3 size={18}/><strong>{score.safety_score??'—'}</strong><span>safety score</span></div></section>
    {vehicle&&<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">VEHICLE</span><h2>{label(vehicle)}</h2></div><Truck size={21}/></div><div className="detail-grid"><div><span>Status</span><strong>{vehicle.status||'unknown'}</strong></div><div><span>Unit</span><strong>{vehicle.unit_code||'—'}</strong></div><div><span>Odometer</span><strong>{vehicle.odometer_miles??'—'} mi</strong></div></div></section>}
    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ROUTES</span><h2>Dispatch queue</h2></div><RouteIcon size={21}/></div>{routes.length?routes.map(route=><article className="business-row crud-record-row" key={route.id}><div className="crud-record-main"><strong>{route.name}</strong><span>{route.status||'planned'} · <Clock3 size={13}/> {when(route.scheduled_for)} · {route.estimated_minutes??'—'} min</span><div className="fleet-dispatch-stop-list">{arr(route.stops).map(stop=><span key={stop.id}><MapPin size={12}/> #{stop.stop_order} {stop.metadata?.display_name||stop.metadata?.name||'Assigned stop'} · {stop.status||'pending'}</span>)}</div></div><Link className="button secondary compact" to="/fleet/routes">Open route</Link></article>):<p className="muted">No routes are currently assigned to you.</p>}</section>
    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PERFORMANCE</span><h2>Latest driver scorecard</h2></div><BarChart3 size={21}/></div><div className="detail-grid"><div><span>Safety</span><strong>{score.safety_score??'—'}</strong></div><div><span>Efficiency</span><strong>{score.efficiency_score??'—'}</strong></div><div><span>Route completion</span><strong>{score.route_completion_score??'—'}</strong></div><div><span>Idle minutes</span><strong>{score.idle_minutes??'—'}</strong></div></div></section>
  </section>;
}
