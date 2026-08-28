import { Navigate } from 'react-router-dom';
import { canAccessMembershipWorkspace } from '../../domain/membershipUiContract.js';
import { getNavigationForWorkspace } from '../../domain/workspaceNavigation.js';

export default function WorkspaceAccessGate({ loading, owner, previewing, workspace, membership, capabilities, children }) {
 if (loading) return <div className="app-loading" role="status"><div className="loading-mark">K</div><span>Loading Kleenest…</span></div>;
 const membershipAllowed=canAccessMembershipWorkspace({membership,workspace,capabilities});
 const navigationAllowed=getNavigationForWorkspace(workspace).length>0;
 const allowed=workspace==='admin'?owner:(previewing?membershipAllowed:(membershipAllowed&&navigationAllowed));
 if(!allowed)return <Navigate to={owner?'/owner/preview':'/'} replace/>;
 return children;
}
