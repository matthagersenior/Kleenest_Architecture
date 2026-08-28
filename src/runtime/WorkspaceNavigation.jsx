import { Bell, ChevronDown, Shield, Sparkles, Users, Truck, Building2, UserCircle, LogIn, Lock, Database, Route, BarChart3, BriefcaseBusiness, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getWorkspace } from '../domain/workspaces.js';
import { getWorkspaceNavigationModel, withPreview } from './workspace/workspaceNavigationModel.js';

const icons = { consumer: Sparkles, business: Building2, fleet: Truck, enterprise: Users, admin: Shield };
const sectionIcons = { Manage: BriefcaseBusiness, Engage: Sparkles, Insights: BarChart3, Account: UserCircle, Operate: Route, Governance: Shield, Platform: Database };

export default function WorkspaceNavigation({ workspace = 'consumer', capabilities = [], membershipLabel = 'Free', availableWorkspaces = [], onWorkspaceChange, isPlatformOwner = false, authenticated = false, previewTier = null }) {
  const location = useLocation();
  const model = getWorkspaceNavigationModel({ workspace, capabilities, membershipLabel, isPlatformOwner, pathname: location.pathname });
  const Icon = icons[model.current.id] || Sparkles;

  return (
    <header className={`workspace-shell workspace-shell-${model.current.id}`} data-workspace={model.current.id} data-membership={model.displayMembership}>
      <div className="workspace-brand">
        <Link to={withPreview('/', previewTier)} className="brand-mark" aria-label="Kleenest home">K</Link>
        <div className="workspace-identity">
          <span className="brand-name">Kleenest</span>
          <span className="membership-badge"><Icon size={13} />{model.displayMembership}</span>
          <span className="workspace-description">{model.current.description}</span>
        </div>
      </div>
      {model.current.id !== 'admin' && (
        <nav className="workspace-nav" aria-label={`${model.current.label} navigation`}>
          {model.items.map(({ section, links }) => {
            const SectionIcon = sectionIcons[section] || BriefcaseBusiness;
            return (
              <div className={`workspace-nav-group workspace-nav-group-${section.toLowerCase()}`} key={section}>
                <span className="workspace-nav-group-label"><SectionIcon size={12} />{section}</span>
                {links.map(({ id, label, path, primary, locked, active }) => {
                  const className = `workspace-nav-link${active ? ' active' : ''}${primary ? ' workspace-nav-link-primary' : ''}${locked ? ' workspace-nav-link-locked' : ''}`;
                  if (locked) return <span key={`${id}:${path}`} className={className} aria-disabled="true" title={`${label} is available with Business Growth`}><Lock size={13} />{label}<span className="workspace-nav-lock-label">Growth</span></span>;
                  return <Link key={`${id}:${path}`} to={withPreview(path, previewTier)} className={className}>{id === 'crud' && <Database size={13} />}{label}</Link>;
                })}
              </div>
            );
          })}
          {model.current.id === 'business' && <Link to={withPreview('/business/map-identity', previewTier)} className={`workspace-nav-link workspace-nav-link-map${model.currentPath === '/business/map-identity' ? ' active' : ''}`}><MapPin size={13} />Map identity</Link>}
        </nav>
      )}
      <div className="workspace-actions">
        {availableWorkspaces.length > 1 && <label className="workspace-switcher"><span className="sr-only">Switch workspace</span><select value={model.current.id} onChange={event => onWorkspaceChange?.(event.target.value)}>{availableWorkspaces.map(id => <option key={id} value={id}>{getWorkspace(id).label}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></label>}
        {authenticated ? <Link to={withPreview('/profile', previewTier)} className="workspace-icon-action" aria-label="Account" title="Account"><UserCircle size={18} /></Link> : <Link to="/auth" className="workspace-signin" aria-label="Sign in"><LogIn size={16} />Sign in</Link>}
        <Link to={withPreview('/notifications', previewTier)} className="workspace-icon-action" aria-label="Notifications" title="Notifications"><Bell size={18} /></Link>
      </div>
    </header>
  );
}
