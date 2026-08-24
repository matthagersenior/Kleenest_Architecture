import { Navigate, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Database, Map, Megaphone, Navigation, ShieldCheck, Sparkles, Truck, Users, Wrench } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { isPlatformOwner } from '../domains/entitlements/access.js';
import { getNavigationForWorkspace, getAvailableWorkspaces, getWorkspace } from '../domain/workspaces.js';
import WorkspaceNavigation from './WorkspaceNavigation.jsx';

const WORKSPACE_ACTIONS = {
  consumer: [
    { label: 'Find nearby', path: '/map', icon: Map, primary: true },
    { label: 'Plan route', path: '/route', icon: Navigation },
    { label: 'Check in', path: '/check-in', icon: Sparkles },
    { label: 'Play & rewards', path: '/play', icon: BarChart3 },
  ],
  business: [
    { label: 'Manage locations', path: '/business/assets', icon: Map, primary: true },
    { label: 'QR check-in', path: '/business/qr', icon: Sparkles },
    { label: 'Campaigns', path: '/business/campaigns', icon: Megaphone },
    { label: 'Analytics', path: '/business/analytics', icon: BarChart3 },
  ],
  fleet: [
    { label: 'Fleet command', path: '/fleet', icon: Truck, primary: true },
    { label: 'Routes', path: '/fleet/routes', icon: Navigation },
    { label: 'Intelligence', path: '/fleet/intelligence', icon: BarChart3 },
    { label: 'Performance', path: '/fleet/performance', icon: BarChart3 },
  ],
  enterprise: [
    { label: 'Enterprise command', path: '/enterprise', icon: Users, primary: true },
    { label: 'Partner networks', path: '/enterprise/partners', icon: Users },
    { label: 'Campaigns', path: '/enterprise/campaigns', icon: Megaphone },
    { label: 'Performance', path: '/enterprise/performance', icon: BarChart3 },
  ],
  admin: [
    { label: 'Platform overview', path: '/owner', icon: ShieldCheck },
    { label: 'Platform CRUD', path: '/owner/data', icon: Database, primary: true },
    { label: 'Audit history', path: '/owner/audit', icon: ShieldCheck },
    { label: 'Security & maintenance', path: '/admin/maintenance', icon: Wrench },
  ],
};

export default function WorkspaceShell({ children, workspace = 'consumer' }) {
  const { capabilities = [], loading, profile, user, membershipTier, presentationTier, workspaceModel, isPlatformOwner: contextOwner } = useAppContext();
  const owner = Boolean(contextOwner || isPlatformOwner(profile));
  const effectiveWorkspace = workspace === 'owner' ? 'admin' : workspace;
  const effectiveCapabilities = owner ? Array.from(new Set([...capabilities, 'owner', 'business', 'fleet', 'enterprise'])) : capabilities;
  const previewing = owner && presentationTier !== membershipTier;
  const allowedByPreview = previewing && presentationTier === effectiveWorkspace;
  const allowed = effectiveWorkspace === 'admin' ? owner : allowedByPreview || getNavigationForWorkspace(effectiveWorkspace, effectiveCapabilities).length > 0;
  const navigate = useNavigate();

  if (loading) return <div className="app-loading" role="status"><div className="loading-mark">K</div><span>Loading Kleenest…</span></div>;
  if (!allowed) return <Navigate to="/" replace />;

  const displayedTier = workspace === 'owner' ? 'Owner Control' : (workspaceModel?.membershipLabel || presentationTier || membershipTier || 'Free');
  const availableWorkspaces = owner ? getAvailableWorkspaces(effectiveCapabilities) : ((workspaceModel?.availableWorkspaces?.length) ? workspaceModel.availableWorkspaces : ['consumer']);
  const handleWorkspaceChange = (nextWorkspace) => {
    if (nextWorkspace === 'admin' && !owner) return;
    if (nextWorkspace === 'consumer' && !user) { navigate('/auth'); return; }
    const links = getNavigationForWorkspace(nextWorkspace, effectiveCapabilities);
    if (nextWorkspace === 'admin') { navigate('/admin'); return; }
    if (links[0]?.path) navigate(links[0].path);
  };
  const meta = getWorkspace(effectiveWorkspace);
  const actions = WORKSPACE_ACTIONS[effectiveWorkspace] || [];

  return (
    <div className={`app workspace-${effectiveWorkspace} membership-${String(displayedTier).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
      <WorkspaceNavigation workspace={effectiveWorkspace} capabilities={effectiveCapabilities} membershipLabel={displayedTier} availableWorkspaces={availableWorkspaces} onWorkspaceChange={handleWorkspaceChange} isPlatformOwner={owner} authenticated={Boolean(user)} />
      {previewing && workspace !== 'owner' && <div className="preview-banner">Owner preview · {presentationTier} experience</div>}
      {owner && <div className="platform-access"><Link to="/owner">Platform controls</Link></div>}
      <section aria-label={`${meta.label} quick actions`} style={{ maxWidth: 1240, margin: '0 auto', padding: '12px 28px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7b879a' }}>{meta.label}</div>
            <div style={{ color: '#667085', fontSize: 13, lineHeight: 1.5 }}>{meta.description}</div>
          </div>
          <span style={{ padding: '6px 10px', borderRadius: 999, background: '#f4f7fb', border: '1px solid #dfe5ef', color: '#526078', fontSize: 11, fontWeight: 850, whiteSpace: 'nowrap' }}>{displayedTier}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 3 }}>
          {actions.map(({ label, path, icon: Icon, primary }) => (
            <Link key={path} to={path} className="button" style={{ flex: '0 0 auto', background: primary ? 'linear-gradient(135deg,#111a2e,#24345a)' : '#fff', color: primary ? '#fff' : '#344054', borderColor: primary ? '#111a2e' : '#dfe5ef', boxShadow: primary ? '0 8px 18px rgba(13,21,38,.15)' : '0 5px 14px rgba(13,21,38,.04)', padding: '9px 12px' }}><Icon size={15} />{label}<ArrowRight size={13} /></Link>
          ))}
        </div>
      </section>
      {effectiveWorkspace !== 'consumer' && <section className="workspace-command-strip" aria-label={`${meta.label} workspace overview`} style={{ maxWidth: 1240, margin: '0 auto', padding: '6px 28px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}><div><span className="eyebrow" style={{ marginBottom: 5 }}>{meta.label.toUpperCase()}</span><div style={{ color: '#667085', fontSize: 13, lineHeight: 1.5 }}>Use the quick actions above for the highest-value workflows. Full navigation remains available by workspace section.</div></div></section>}
      <main>{children}</main>
    </div>
  );
}
