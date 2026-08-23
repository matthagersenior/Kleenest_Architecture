import {Navigate,useNavigate} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import {isPlatformOwner} from '../domains/entitlements/access.js';
import {getNavigationForWorkspace} from '../domain/workspaces.js';
import WorkspaceNavigation from './WorkspaceNavigation.jsx';

export default function WorkspaceShell({children,workspace='consumer'}){
 const navigate=useNavigate();
 const {capabilities=[],loading,profile,membershipTier,presentationTier,workspaceModel}=useAppContext();
 const owner=isPlatformOwner(profile);
 const effectiveWorkspace=workspace==='owner'?'admin':workspace;
 const previewing=owner&&presentationTier!==membershipTier;
 const allowedByPreview=previewing&&presentationTier===effectiveWorkspace;
 const allowed=effectiveWorkspace==='admin'?owner:allowedByPreview||getNavigationForWorkspace(effectiveWorkspace,capabilities).length>0;
 if(loading)return <div>Loading Kleenest…</div>;
 if(!allowed)return <Navigate to="/" replace/>;
 const displayedTier=workspace==='owner'?membershipTier:presentationTier;
 const availableWorkspaces=workspaceModel?.availableWorkspaces||['consumer'];
 const handleWorkspaceChange=(nextWorkspace)=>{
  const links=getNavigationForWorkspace(nextWorkspace,capabilities);
  if(nextWorkspace==='admin'&&!owner)return;
  if(links[0]?.path)navigate(links[0].path);
 };
 return <div className={`app workspace-${workspace} membership-${displayedTier}`}>
  <WorkspaceNavigation workspace={effectiveWorkspace} capabilities={capabilities} membershipLabel={workspaceModel?.membershipLabel||displayedTier} availableWorkspaces={availableWorkspaces} onWorkspaceChange={handleWorkspaceChange}/>
  {previewing&&workspace!=='owner'&&<div className="preview-banner">Owner preview · {presentationTier} experience</div>}
  {owner&&<div className="platform-access"><a href="/owner">Platform controls</a></div>}
  <main>{children}</main>
 </div>;
}
