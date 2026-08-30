import { useEffect,useState } from 'react';
import { BarChart3,ShieldCheck,Truck,UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import { fleetAccessState } from '../domains/fleet/access.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import FleetControllerPerformancePage from './FleetControllerPerformancePage.jsx';

export default function FleetPerformancePage(){
  const{services,isPlatformOwner,profile,loading:authLoading,selectedBusinessId,selectedBusiness}=useAppContext();
  const role=profile?.role||profile?.business_role||profile?.membership_role||'';
  const tier=profile?.business_tier||profile?.tier||'';
  const access=fleetAccessState({isPlatformOwner,role,businessTier:tier});
  const businessId=selectedBusinessId||selectedBusiness?.business_id||selectedBusiness?.id||null;
  const[data,setData]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  useEffect(()=>{if(authLoading||access.operate||!access.observe)return;let active=true;setLoading(true);services.fleet.currentUserDispatch(businessId||null).then(value=>{if(active)setData(value)}).catch(e=>{if(active)setError(e.message||'Unable to load your performance.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[authLoading,access.operate,access.observe,businessId,services]);
  if(authLoading)return <WorkspaceShell workspace="fleet"><section className="empty-state"><ShieldCheck size={32}/><h2>Loading Fleet performance</h2><p>Waiting for the authenticated session.</p></section></WorkspaceShell>;
  if(access.operate)return <FleetControllerPerformancePage/>;
  if(!access.observe)return <WorkspaceShell workspace="fleet"><section className="empty-state"><BarChart3 size={32}/><h2>Fleet performance unavailable</h2><p>This account does not currently have Fleet access.</p></section></WorkspaceShell>;
  const driver=data?.driver,vehicle=data?.vehicle,score=data?.performance||{};
  return <WorkspaceShell workspace="fleet"><section className="page business-page"><header className="page-header"><div><span className="eyebrow">FLEET · MY PERFORMANCE</span><h1>Your driver scorecard.</h1><p>Only your linked driver identity, assigned vehicle context, and latest scorecard are shown here. Fleet-wide metrics and configuration remain controller-only.</p></div><div className="hero-actions"><Link className="secondary" to="/fleet"><Truck size={16}/>My dispatch</Link><Link className="secondary" to="/fleet/routes">My routes</Link></div></header>{error&&<p className="form-error" role="alert">{error}</p>}{loading?<div className="empty-state">Loading your performance…</div>:!driver?<section className="empty-state"><UserRound size={32}/><h2>No driver identity linked</h2><p>A Fleet owner or admin must link this account to a driver before personal performance can be shown.</p></section>:<><section className="reward-stats"><div className="reward-stat"><UserRound size={18}/><strong>{driver.name}</strong><span>driver</span></div><div className="reward-stat"><Truck size={18}/><strong>{vehicle?.name||vehicle?.unit_code||'Unassigned'}</strong><span>vehicle</span></div><div className="reward-stat"><BarChart3 size={18}/><strong>{score.safety_score??'—'}</strong><span>safety</span></div></section><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LATEST SCORECARD</span><h2>{score.score_date||'Current performance'}</h2></div><BarChart3 size={21}/></div><div className="detail-grid"><div><span>Safety score</span><strong>{score.safety_score??'—'}</strong></div><div><span>Efficiency</span><strong>{score.efficiency_score??'—'}</strong></div><div><span>Route completion</span><strong>{score.route_completion_score??'—'}</strong></div><div><span>Idle minutes</span><strong>{score.idle_minutes??'—'}</strong></div><div><span>Harsh braking</span><strong>{score.harsh_braking_count??'—'}</strong></div><div><span>Speeding events</span><strong>{score.speeding_events??'—'}</strong></div></div></section></>}</section></WorkspaceShell>;
}
