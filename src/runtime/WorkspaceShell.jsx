import {Link,Navigate,useLocation} from 'react-router-dom';
import {useState} from 'react';
import {Menu,X} from 'lucide-react';
import {useAppContext} from '../AppContext.jsx';
import {isPlatformOwner} from '../domains/entitlements/access.js';
import {getNavigationForWorkspace} from '../domain/workspaces.js';

export default function WorkspaceShell({children,workspace='consumer'}){
 const l=useLocation();
 const {capabilities=[],loading,profile,membershipTier,presentationTier}=useAppContext();
 const [open,setOpen]=useState(false);
 const owner=isPlatformOwner(profile);
 const effectiveWorkspace=workspace==='owner'?'admin':workspace;
 const previewing=owner&&presentationTier!==membershipTier;
 const allowedByPreview=previewing&&presentationTier===effectiveWorkspace;
 const allowed=effectiveWorkspace==='admin'?owner:allowedByPreview||getNavigationForWorkspace(effectiveWorkspace,capabilities).length>0;
 if(loading)return <div>Loading Kleenest…</div>;
 if(!allowed)return <Navigate to="/" replace/>;
 const displayedTier=workspace==='owner'?membershipTier:presentationTier;
 const links=getNavigationForWorkspace(effectiveWorkspace,capabilities);
 return <div className={`app workspace-${workspace} membership-${displayedTier}`}>
  <header className="topbar">
   <Link className="brand" to="/" onClick={()=>setOpen(false)}>Kleenest</Link>
   <nav className={`nav${open?' open':''}`} aria-label={`${workspace} navigation`}>
    {links.map(({id,label,path})=><Link key={`${id}:${path}`} className={l.pathname===path||l.pathname.startsWith(`${path}/`)?'active':''} to={path} onClick={()=>setOpen(false)}>{label}</Link>)}
   </nav>
   <div className="top-actions">
    <span className="membership">{displayedTier}</span>
    {owner&&<Link className="owner-link" to="/owner" onClick={()=>setOpen(false)}>Platform</Link>}
    <button className="mobile-menu" type="button" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
   </div>
  </header>
  {previewing&&workspace!=='owner'&&<div className="preview-banner">Owner preview · {presentationTier} experience</div>}
  <main>{children}</main>
 </div>;
}
