import { BarChart3,Brain,ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import { fleetAccessState } from '../domains/fleet/access.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import FleetControllerIntelligenceSurface from './FleetControllerIntelligenceSurface.jsx';
import FleetUserDispatchPanel from './FleetUserDispatchPanel.jsx';

export default function FleetIntelligenceSurface(){
  const{isPlatformOwner,profile,loading:authLoading,selectedBusinessId,selectedBusiness}=useAppContext();
  const role=profile?.role||profile?.business_role||profile?.membership_role||'';
  const tier=profile?.business_tier||profile?.tier||'';
  const access=fleetAccessState({isPlatformOwner,role,businessTier:tier});
  const businessId=selectedBusinessId||selectedBusiness?.business_id||selectedBusiness?.id||null;
  if(authLoading)return <WorkspaceShell workspace="fleet"><section className="empty-state"><ShieldCheck size={32}/><h2>Loading Fleet intelligence</h2><p>Waiting for the authenticated session.</p></section></WorkspaceShell>;
  if(access.operate)return <FleetControllerIntelligenceSurface/>;
  if(access.observe)return <WorkspaceShell workspace="fleet"><section className="page business-page"><header className="page-header"><div><span className="eyebrow">FLEET · DRIVER INTELLIGENCE</span><h1>Your dispatch and performance.</h1><p>Driver accounts receive assigned operational context only. Fleet-wide intelligence controls and network benchmarks remain controller-only.</p></div><div className="hero-actions"><Link className="secondary" to="/fleet"><Brain size={16}/>My dispatch</Link><Link className="secondary" to="/fleet/performance"><BarChart3 size={16}/>My performance</Link></div></header><FleetUserDispatchPanel businessId={businessId}/></section></WorkspaceShell>;
  return <WorkspaceShell workspace="fleet"><section className="empty-state"><Brain size={32}/><h2>Fleet intelligence unavailable</h2><p>This account does not currently have Fleet access.</p></section></WorkspaceShell>;
}
