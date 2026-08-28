import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { isPlatformOwner } from '../domains/entitlements/access.js';
import { getNavigationForWorkspace } from '../domain/workspaces.js';
import { canAccessMembershipWorkspace } from '../domain/membershipUiContract.js';
import WorkspaceNavigation from './WorkspaceNavigation.jsx';
import OwnerNavigation from './OwnerNavigation.jsx';
import ConsumerMonetizationBanner from '../consumer/monetization/ConsumerMonetizationBanner.jsx';
import { useWorkspacePreview, previewPath, PREVIEW_LABEL } from './workspace/useWorkspacePreview.js';
import { useWorkspaceAccess } from './workspace/useWorkspaceAccess.js';
import { getWorkspacePresentation } from './workspace/workspacePresentation.js';
import './consumerEngagement.css';
import './membershipSlices.css';

export default function WorkspaceShell({ children, workspace = 'consumer' }) {
  const { capabilities = [], loading, profile, user, membershipTier, presentationTier, workspaceModel, isPlatformOwner: contextOwner } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const owner = Boolean(contextOwner || isPlatformOwner(profile));
  const { previewTier, previewProduct, effectiveWorkspace, previewing, exitPreview } = useWorkspacePreview({ owner, workspace, routePreview: searchParams.get('preview') });
  const { effectiveCapabilities, activeMembership, allowed, availableWorkspaces, displayedTier, authenticated } = useWorkspaceAccess({ capabilities, membershipTier, presentationTier, workspaceModel, owner, previewTier, previewProduct, user, effectiveWorkspace });

  if (loading) return <div className="app-loading" role="status"><div className="loading-mark">K</div><span>Loading Kleenest…</span></div>;
  if (!allowed) return <Navigate to={owner ? '/owner/preview' : '/'} replace />;

  const handleWorkspaceChange = (nextWorkspace) => {
    if (previewing) {
      if (nextWorkspace === 'admin') { navigate('/owner/preview'); return; }
      const links = getNavigationForWorkspace(nextWorkspace, effectiveCapabilities);
      if (links[0]?.path) navigate(previewPath(links[0].path, previewTier));
      return;
    }
    if (nextWorkspace === 'admin' && !owner) return;
    if (nextWorkspace === 'consumer' && !user) { navigate('/auth'); return; }
    if (!canAccessMembershipWorkspace({ membership: activeMembership, workspace: nextWorkspace, capabilities: effectiveCapabilities })) return;
    const links = getNavigationForWorkspace(nextWorkspace, effectiveCapabilities);
    if (nextWorkspace === 'admin') { navigate('/owner'); return; }
    if (links[0]?.path) navigate(links[0].path);
  };

  const presentation = getWorkspacePresentation(effectiveWorkspace);
  const tierLabel = previewing ? (PREVIEW_LABEL[previewTier] || displayedTier) : displayedTier;
  const tierMessage = owner && !previewing
    ? 'Platform owner account. Consumer membership and advertising do not apply.'
    : presentation.description;
  const consumerMembershipTier = previewTier || activeMembership || 'free';

  return (
    <div className={`app workspace-${effectiveWorkspace} membership-${String(tierLabel).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
      <WorkspaceNavigation workspace={effectiveWorkspace} capabilities={effectiveCapabilities} membershipLabel={tierLabel} availableWorkspaces={availableWorkspaces} onWorkspaceChange={handleWorkspaceChange} isPlatformOwner={owner} authenticated={authenticated} previewTier={previewTier} />
      {owner && !previewing && <OwnerNavigation />}
      {previewing && <div className="preview-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><span>Owner preview · {tierLabel} experience · presentation only</span><button type="button" className="button secondary" onClick={exitPreview} style={{ padding: '5px 9px' }}><X size={14} />Exit preview</button></div>}
      {effectiveWorkspace === 'consumer' && !owner && <ConsumerMonetizationBanner membershipTier={consumerMembershipTier} onUpgrade={() => navigate('/pricing')} />}
      <section className="tier-hero" aria-label={`${tierLabel} experience`}><div className="tier-hero-card"><div className="tier-hero-kicker">{tierLabel} experience</div><h2 className="tier-hero-title">{presentation.title} · built around what you need next</h2><p className="tier-hero-copy">{tierMessage}</p></div></section>
      <main>{children}</main>
    </div>
  );
}
