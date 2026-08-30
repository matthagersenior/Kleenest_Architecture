import { ShieldCheck,Truck } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { fleetAccessState } from '../domains/fleet/access.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import FleetControllerOperationsPage from './FleetControllerOperationsPage.jsx';
import FleetUserDispatchPanel from './FleetUserDispatchPanel.jsx';

export default function FleetOperationsPage(){
  const{isPlatformOwner,profile,loading:authLoading,selectedBusinessId,selectedBusiness}=useAppContext();
  const role=profile?.role||profile?.business_role||profile?.membership_role||'';
  const tier=profile?.business_tier||profile?.tier||'';
  const access=fleetAccessState({isPlatformOwner,role,businessTier:tier});
  const businessId=selectedBusinessId||selectedBusiness?.business_id||selectedBusiness?.id||null;

  if(authLoading)return <WorkspaceShell workspace="fleet"><section className="empty-state"><ShieldCheck size={36}/><h2>Loading Fleet access</h2><p>Waiting for the authenticated session.</p></section></WorkspaceShell>;
  if(!profile)return <WorkspaceShell workspace="fleet"><section className="empty-state"><Truck size={36}/><h2>Fleet sign-in required</h2><p>Sign in with a Fleet account to view dispatch or controller operations.</p></section></WorkspaceShell>;
  if(access.operate)return <FleetControllerOperationsPage/>;
  if(access.observe)return <WorkspaceShell workspace="fleet"><section className="page business-page"><FleetUserDispatchPanel businessId={businessId}/></section></WorkspaceShell>;
  return <WorkspaceShell workspace="fleet"><section className="empty-state"><Truck size={36}/><h2>Fleet access unavailable</h2><p>This account does not currently have Fleet access.</p></section></WorkspaceShell>;
}
