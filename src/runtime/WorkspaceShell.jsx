import { Navigate, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Database, Map, Megaphone, Navigation, ShieldCheck, Sparkles, Truck, Users, Wrench, X } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { isPlatformOwner } from '../domains/entitlements/access.js';
import { getNavigationForWorkspace, getAvailableWorkspaces, getWorkspace } from '../domain/workspaces.js';
import { getProductTier } from '../architecture/productModel.js';

const WORKSPACE_ACTIONS={consumer:[{label:'Find nearby',path:'/map',icon:Map,primary:true},{label:'Plan route',path:'/route',icon:Navigation},{label:'Check in',path:'/check-in',icon:Sparkles},{label:'Play games',path:'/games',icon:BarChart3}],business:[{label:'Manage locations',path:'/business/assets',icon:Map,primary:true},{label:'QR check-in',path:'/business/qr',icon:Sparkles},{label:'Campaigns',path:'/business/campaigns',icon:Megaphone},{label:'Analytics',path:'/business/analytics',icon:BarChart3}],fleet:[{label:'Fleet command',path:'/fleet',icon:Truck,primary:true},{label:'Routes',path:'/fleet/routes',icon:Navigation},{label:'Intelligence',path:'/fleet/intelligence',icon:BarChart3},{label:'Performance',path:'/fleet/performance',icon:BarChart3}],enterprise:[{label:'Enterprise command',path:'/enterprise',icon:Users,primary:true},{label:'Partner networks',path:'/enterprise/partners',icon:Users},{label:'Campaigns',path:'/enterprise/campaigns',icon:Megaphone},{label:'Performance',path:'/enterprise/performance',icon:BarChart3}],admin:[{label:'Platform overview',path:'/owner',icon:ShieldCheck},{label:'Platform CRUD',path:'/owner/data',icon:Database,primary:true},{label:'Audit history',path:'/owner/audit',icon:ShieldCheck},{label:'Security & maintenance',path:'/admin/maintenance',icon:Wrench}]};
const PREVIEW_TIERS=['free','premium','family','fleet','enterprise','business_standard','business_growth','business_fleet','business_enterprise'];
const PREVIEW_WORKSPACE={free:'consumer',premium:'consumer',family:'consumer',fleet:'fleet',enterprise:'enterprise',business_standard:'business',business_growth:'business',business_fleet:'fleet',business_enterprise:'enterprise'};
const PREVIEW_LABEL={free:'Free',premium:'Premium',family:'Family',fleet:'Fleet User',enterprise:'Enterprise User',business_standard:'Business Standard',business_growth:'Business Growth',business_fleet:'Business Fleet',business_enterprise:'Business Enterprise'};
function readPreview(){if(typeof window==='undefined')return null;const query=new URLSearchParams(window.location.search).get('preview');if(query&&PREVIEW_TIERS.includes(query)){try{window.sessionStorage.setItem('kleenest.ownerPreview',query)}catch{}return query}try{const saved=window.sessionStorage.getItem('kleenest.ownerPreview');return PREVIEW_TIERS.includes(saved)?saved:null}catch{return null}}
function clearPreview(){try{window.sessionStorage.removeItem('kleenest.ownerPreview')}catch{}}
function previewPath(path,preview){if(!preview)return path;const [base,hash]=String(path).split('#');const join=base.includes('?')?'&':'?';return `${base}${join}preview=${encodeURIComponent(preview)}${hash?`#${hash}`:''}`}
export default function WorkspaceShell({children,workspace='consumer'}){
  const{capabilities=[],loading,profile,user,membershipTier,presentationTier,workspaceModel,isPlatformOwner:contextOwner}=useAppContext();
  const owner=Boolean(contextOwner||isPlatformOwner(profile));
  const previewTier=owner&&workspace!=='owner'?readPreview():null;
  const previewProduct=previewTier?getProductTier(previewTier):null;
  const effectiveWorkspace=previewTier?(PREVIEW_WORKSPACE[previewTier]||'consumer'):(workspace==='owner'?'admin':workspace);
  const previewCapabilities=previewProduct?.capabilities||[];
  const effectiveCapabilities=previewTier?Array.from(new Set(['consumer',...previewCapabilities])):(owner?Array.from(new Set([...capabilities,'owner','business','fleet','enterprise'])):capabilities);
  const previewing=Boolean(previewTier);
  const allowed=effectiveWorkspace==='admin'?owner:(previewing?Boolean(PREVIEW_WORKSPACE[previewTier]):getNavigationForWorkspace(effectiveWorkspace,effectiveCapabilities).length>0);
  const navigate=useNavigate();
  if(loading)return <div className="app-loading" role="status"><div className="loading-mark">K</div><span>Loading Kleenest…</span></div>;
  if(!allowed)return <Navigate to={owner?'/owner/preview':'/'} replace/>;
  const displayedTier=previewTier?(PREVIEW_LABEL[previewTier]||previewProduct?.label||previewTier):(workspace==='owner'?'Owner Control':(workspaceModel?.membershipLabel||presentationTier||membershipTier||'Free'));
  const availableWorkspaces=previewing?[effectiveWorkspace]:(owner?getAvailableWorkspaces(effectiveCapabilities):((workspaceModel?.availableWorkspaces?.length)?workspaceModel.availableWorkspaces:['consumer']));
  const handleWorkspaceChange=nextWorkspace=>{if(previewing){if(nextWorkspace==='admin'){navigate('/owner/preview');return}const links=getNavigationForWorkspace(nextWorkspace,effectiveCapabilities);if(links[0]?.path)navigate(previewPath(links[0].path,previewTier));return}if(nextWorkspace==='admin'&&!owner)return;if(nextWorkspace==='consumer'&&!user){navigate('/auth');return}const links=getNavigationForWorkspace(nextWorkspace,effectiveCapabilities);if(nextWorkspace==='admin'){navigate('/admin');return}if(links[0]?.path)navigate(links[0].path)};
  const exitPreview=()=>{clearPreview();navigate('/owner/preview');};
  const meta=getWorkspace(effectiveWorkspace);const actions=WORKSPACE_ACTIONS[effectiveWorkspace]||[];
  return <div className={`app workspace-${effectiveWorkspace} membership-${String(displayedTier).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>
    <WorkspaceNavigation workspace={effectiveWorkspace} capabilities={effectiveCapabilities} membershipLabel={displayedTier} availableWorkspaces={availableWorkspaces} onWorkspaceChange={handleWorkspaceChange} isPlatformOwner={owner} authenticated={Boolean(user)}/>
    {previewing&&<div className="preview-banner" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>Owner preview · {displayedTier} experience · presentation only <button type="button" className="button secondary" onClick={exitPreview} style={{padding:'5px 9px'}}><X size={14}/>Exit preview</button></div>}
    {!previewing&&owner&&<div className="platform-access"><Link to="/owner">Platform controls</Link></div>}
    <section aria-label={`${meta.label} quick actions`} style={{maxWidth:1240,margin:'0 auto',padding:'12px 28px 8px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,marginBottom:10}}><div><div style={{fontSize:11,fontWeight:900,letterSpacing:'.14em',textTransform:'uppercase',color:'#7b879a'}}>{meta.label}</div><div style={{color:'#667085',fontSize:13,lineHeight:1.5}}>{meta.description}</div></div><span style={{padding:'6px 10px',borderRadius:999,background:'#f4f7fb',border:'1px solid #dfe5ef',color:'#526078',fontSize:11,fontWeight:850,whiteSpace:'nowrap'}}>{displayedTier}</span></div>
      <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:3}}>{actions.map(({label,path,icon:Icon,primary})=><Link key={path} to={previewPath(path,previewTier)} className="button" style={{flex:'0 0 auto',background:primary?'linear-gradient(135deg,#111a2e,#24345a)':'#fff',color:primary?'#fff':'#344054',borderColor:primary?'#111a2e':'#dfe5ef',boxShadow:primary?'0 8px 18px rgba(13,21,38,.15)':'0 5px 14px rgba(13,21,38,.04)',padding:'9px 12px'}}><Icon size={15}/>{label}<ArrowRight size={13}/></Link>)}</div>
    </section>
    {effectiveWorkspace!=='consumer'&&<section className="workspace-command-strip" aria-label={`${meta.label} workspace overview`} style={{maxWidth:1240,margin:'0 auto',padding:'6px 28px 10px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}><div><span className="eyebrow" style={{marginBottom:5}}>{meta.label.toUpperCase()}</span><div style={{color:'#667085',fontSize:13,lineHeight:1.5}}>Use the quick actions above for the highest-value workflows. Full navigation remains available by workspace section.</div></div></section>}
    <main>{children}</main>
  </div>
}