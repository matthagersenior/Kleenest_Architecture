import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import { isPlatformOwner } from '../domains/entitlements/access.js';
import { getAvailableWorkspaces, getWorkspace } from '../domain/workspaces.js';
import { getNavigationForWorkspace } from '../domain/workspaceNavigation.js';
import { canAccessMembershipWorkspace, resolveMembershipUi } from '../domain/membershipUiContract.js';
import { getProductTier } from '../architecture/productModel.js';
import WorkspaceNavigation from './WorkspaceNavigation.jsx';
import OwnerNavigation from './OwnerNavigation.jsx';
import ConsumerMonetizationBanner from '../consumer/monetization/ConsumerMonetizationBanner.jsx';
import WorkspaceAccessGate from './workspace/WorkspaceAccessGate.jsx';
import WorkspacePreviewBanner from './workspace/WorkspacePreviewBanner.jsx';
import WorkspaceTierHero from './workspace/WorkspaceTierHero.jsx';
import './consumerEngagement.css';
import './membershipSlices.css';

const PREVIEW_TIERS=['free','premium','family','fleet','enterprise','business_standard','business_growth','business_fleet','business_enterprise'];
const PREVIEW_WORKSPACE={free:'consumer',premium:'consumer',family:'consumer',fleet:'fleet',enterprise:'enterprise',business_standard:'business',business_growth:'business',business_fleet:'fleet',business_enterprise:'enterprise'};
const PREVIEW_LABEL={free:'Free',premium:'Premium',family:'Family',fleet:'Fleet User',enterprise:'Enterprise User',business_standard:'Business Standard',business_growth:'Business Growth',business_fleet:'Business Fleet',business_enterprise:'Business Enterprise'};
const TIER_MESSAGE={free:'The complete Kleenest consumer experience, supported by tasteful advertising.',premium:'The complete Kleenest consumer experience, now without advertising for $5/month.',family:'The complete Kleenest consumer experience for the household, with family coordination and shared membership benefits.',fleet:'Turn restroom intelligence into an operational advantage across drivers, routes, and field activity.',enterprise:'Operate with network-level intelligence, partner coordination, and enterprise-grade visibility.',business_standard:'Own your presence, keep your restroom information current, and understand how visitors experience your location.',business_growth:'Turn location activity into growth with campaigns, promotions, richer analytics, and engagement tools.',business_fleet:'Connect business operations, field teams, locations, and intelligence in one coordinated workspace.',business_enterprise:'Unify locations, partnerships, engagement, fleet operations, and network intelligence at enterprise scale.'};
function readPreview(routePreview){if(typeof window==='undefined')return null;if(routePreview&&PREVIEW_TIERS.includes(routePreview)){try{window.sessionStorage.setItem('kleenest.ownerPreview',routePreview)}catch{}return routePreview}try{const saved=window.sessionStorage.getItem('kleenest.ownerPreview');return PREVIEW_TIERS.includes(saved)?saved:null}catch{return null}}
function clearPreview(){try{window.sessionStorage.removeItem('kleenest.ownerPreview')}catch{}}
export default function WorkspaceShell({children,workspace='consumer'}){
 const{capabilities=[],loading,profile,user,membershipTier,presentationTier,workspaceModel,isPlatformOwner:contextOwner}=useAppContext();
 const[searchParams]=useSearchParams();const navigate=useNavigate();const owner=Boolean(contextOwner||isPlatformOwner(profile));
 const previewTier=owner&&workspace!=='owner'?readPreview(searchParams.get('preview')):null;const previewProduct=previewTier?getProductTier(previewTier):null;
 const effectiveWorkspace=previewTier?(PREVIEW_WORKSPACE[previewTier]||'consumer'):(workspace==='owner'?'admin':workspace);
 const effectiveCapabilities=previewTier?Array.from(new Set(['consumer',...(previewProduct?.capabilities||[])])):(owner?Array.from(new Set([...capabilities,'owner','business','fleet','enterprise'])):capabilities);
 const previewing=Boolean(previewTier);const activeMembership=previewTier||membershipTier||'free';
 const membershipUi=resolveMembershipUi(activeMembership,effectiveCapabilities);
 const displayedTier=previewTier?(PREVIEW_LABEL[previewTier]||previewProduct?.label||previewTier):(owner?'Owner':(workspace==='owner'?'Owner Control':(workspaceModel?.membershipLabel||presentationTier||membershipUi.label||'Free')));
 const availableWorkspaces=previewing?[effectiveWorkspace]:(owner?getAvailableWorkspaces(effectiveCapabilities):((workspaceModel?.availableWorkspaces?.length)?workspaceModel.availableWorkspaces:['consumer']));
 const handleWorkspaceChange=nextWorkspace=>{if(previewing){if(nextWorkspace==='admin'){navigate('/owner/preview');return}const links=getNavigationForWorkspace(nextWorkspace);if(links[0]?.path)navigate(`${links[0].path}?preview=${encodeURIComponent(previewTier)}`);return}if(nextWorkspace==='admin'&&!owner)return;if(nextWorkspace==='consumer'&&!user){navigate('/auth');return}if(!canAccessMembershipWorkspace({membership:activeMembership,workspace:nextWorkspace,capabilities:effectiveCapabilities}))return;const links=getNavigationForWorkspace(nextWorkspace);if(nextWorkspace==='admin'){navigate('/owner');return}if(links[0]?.path)navigate(links[0].path)};
 const exitPreview=()=>{clearPreview();navigate('/owner/preview')};const meta=getWorkspace(effectiveWorkspace);const tierKey=previewTier||String(displayedTier).toLowerCase().replace(/\s+/g,'_');
 const tierMessage=owner&&!previewing?'Platform owner account. Consumer membership and advertising do not apply.':TIER_MESSAGE[tierKey]||`Your ${displayedTier} experience is tuned around what you need next.`;
 const consumerMembershipTier=previewTier||membershipTier||'free';
 return <WorkspaceAccessGate loading={loading} owner={owner} previewing={previewing} workspace={effectiveWorkspace} membership={activeMembership} capabilities={effectiveCapabilities}><div className={`app workspace-${effectiveWorkspace} membership-${String(displayedTier).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}><WorkspaceNavigation workspace={effectiveWorkspace} capabilities={effectiveCapabilities} membershipLabel={displayedTier} availableWorkspaces={availableWorkspaces} onWorkspaceChange={handleWorkspaceChange} isPlatformOwner={owner} authenticated={Boolean(user)} previewTier={previewTier}/>{owner&&!previewing&&<OwnerNavigation/>}{previewing&&<WorkspacePreviewBanner label={displayedTier} onExit={exitPreview}/>} {effectiveWorkspace==='consumer'&&!owner&&<ConsumerMonetizationBanner membershipTier={consumerMembershipTier} onUpgrade={()=>navigate('/pricing')}/>}<WorkspaceTierHero label={displayedTier} meta={meta} message={tierMessage}/><main>{children}</main></div></WorkspaceAccessGate>;
}
