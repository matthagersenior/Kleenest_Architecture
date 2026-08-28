export const WORKSPACE_NAVIGATION = Object.freeze({
  consumer: Object.freeze([
    { id: 'home', label: 'Home', path: '/' }, { id: 'explore', label: 'Explore', path: '/map' }, { id: 'routes', label: 'Routes', path: '/route' }, { id: 'saved', label: 'Saved', path: '/saved' }, { id: 'activity', label: 'Activity', path: '/activity' }, { id: 'play', label: 'Rewards & Play', path: '/play' }, { id: 'community', label: 'Community', path: '/community' }, { id: 'notifications', label: 'Notifications', path: '/notifications' }, { id: 'profile', label: 'Profile', path: '/profile' },
  ]),
  business: Object.freeze([
    { id: 'overview', label: 'Overview', path: '/business', section: 'Manage' }, { id: 'locations', label: 'Locations', path: '/business/assets', section: 'Manage' }, { id: 'qr', label: 'QR Check-In', path: '/business/qr', section: 'Engage' }, { id: 'promotions', label: 'Promotions', path: '/business/promotions', section: 'Engage' }, { id: 'campaigns', label: 'Campaigns', path: '/business/campaigns', section: 'Engage' }, { id: 'events', label: 'Events', path: '/business/events', section: 'Engage' }, { id: 'contests', label: 'Contests', path: '/business/contests', section: 'Engage' }, { id: 'reviews', label: 'Reviews', path: '/business/reviews', section: 'Insights' }, { id: 'analytics', label: 'Analytics', path: '/business/analytics', section: 'Insights' }, { id: 'intelligence', label: 'Intelligence', path: '/business/intelligence', section: 'Insights' }, { id: 'plan', label: 'Plan & Access', path: '/business/entitlements', section: 'Account' },
  ]),
  fleet: Object.freeze([
    { id: 'command', label: 'Command', path: '/fleet', section: 'Operate' }, { id: 'routes', label: 'Routes', path: '/fleet/routes', section: 'Operate' }, { id: 'operations', label: 'Operations', path: '/fleet/opportunities', section: 'Operate' }, { id: 'intelligence', label: 'Intelligence', path: '/fleet/intelligence', section: 'Insights' }, { id: 'performance', label: 'Performance', path: '/fleet/performance', section: 'Insights' }, { id: 'notifications', label: 'Notifications', path: '/notifications', section: 'Account' },
  ]),
  enterprise: Object.freeze([
    { id: 'command', label: 'Command', path: '/enterprise', section: 'Operate' }, { id: 'partners', label: 'Partners & Networks', path: '/enterprise/partners', section: 'Manage' }, { id: 'campaigns', label: 'Campaigns', path: '/enterprise/campaigns', section: 'Manage' }, { id: 'fleet', label: 'Fleet', path: '/enterprise/fleet', section: 'Operate' }, { id: 'analytics', label: 'Performance & Analytics', path: '/enterprise/performance', section: 'Insights' },
  ]),
  admin: Object.freeze([
    { id: 'overview', label: 'Platform Overview', path: '/owner', section: 'Platform' }, { id: 'crud', label: 'Platform CRUD', path: '/owner/data', section: 'Platform', primary: true }, { id: 'capabilities', label: 'Capabilities', path: '/admin/capabilities', section: 'Governance' }, { id: 'security', label: 'Security & Maintenance', path: '/admin/maintenance', section: 'Governance' }, { id: 'audit', label: 'Audit History', path: '/owner/audit', section: 'Governance' }, { id: 'preview', label: 'Membership Preview', path: '/owner/preview', section: 'Governance' },
  ]),
});

export function getNavigationForWorkspace(workspace, canUse = true) {
  return canUse ? (WORKSPACE_NAVIGATION[workspace] || []) : [];
}
