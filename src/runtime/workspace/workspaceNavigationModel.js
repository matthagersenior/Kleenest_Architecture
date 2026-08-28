import { getWorkspace } from '../../domain/workspaces.js';
import { getNavigationForWorkspace } from '../../domain/workspaceNavigation.js';

const BUSINESS_GROWTH_NAV = new Set(['customers', 'promotions', 'campaigns', 'events', 'contests', 'reviews', 'analytics', 'intelligence']);

export const WORKSPACE_NAV_ICONS = Object.freeze({ consumer: 'sparkles', business: 'building', fleet: 'truck', enterprise: 'users', admin: 'shield' });
export const NAV_SECTION_ICONS = Object.freeze({ Manage: 'briefcase', Engage: 'sparkles', Insights: 'chart', Account: 'user', Operate: 'route', Governance: 'shield', Platform: 'database', Primary: 'sparkles' });

export function displayMembership(value) {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object') return String(value.label || value.name || value.membershipLabel || value.tier || 'Free');
  return 'Free';
}
export function normalizePath(path) { const value = String(path || '/'); return value.length > 1 ? value.replace(/\/+$/, '') : value; }
export function withPreview(path, previewTier) { if (!previewTier) return path; const [base, hash] = String(path).split('#'); const join = base.includes('?') ? '&' : '?'; return `${base}${join}preview=${encodeURIComponent(previewTier)}${hash ? `#${hash}` : ''}`; }
export function isBusinessGrowthLocked(workspace, id, membershipLabel, isPlatformOwner) { if (isPlatformOwner || workspace !== 'business') return false; const tier = String(displayMembership(membershipLabel)).toLowerCase().replace(/[-\s]/g, '_'); return tier.includes('business_standard') && BUSINESS_GROWTH_NAV.has(id); }

export function getWorkspaceNavigationModel({ workspace = 'consumer', capabilities = [], membershipLabel = 'Free', isPlatformOwner = false, pathname = '/' }) {
  const current = getWorkspace(workspace);
  const effectiveCapabilities = isPlatformOwner ? Array.from(new Set([...capabilities, 'owner'])) : capabilities;
  const links = getNavigationForWorkspace(current.id, effectiveCapabilities);
  const currentPath = normalizePath(pathname);
  const grouped = links.reduce((acc, link) => { const key = link.section || 'Primary'; (acc[key] ||= []).push(link); return acc; }, {});
  const items = Object.entries(grouped).map(([section, sectionLinks]) => ({ section, links: sectionLinks.map(link => ({ ...link, locked: isBusinessGrowthLocked(current.id, link.id, membershipLabel, isPlatformOwner), active: currentPath === normalizePath(link.path.split('?')[0]) || currentPath.startsWith(`${normalizePath(link.path.split('?')[0])}/`) })) }));
  return Object.freeze({ current, effectiveCapabilities, items, currentPath, displayMembership: displayMembership(membershipLabel) });
}
