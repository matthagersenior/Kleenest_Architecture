import { WORKSPACE_NAVIGATION } from '../../domain/workspaces.js';

export const ROUTE_WORKSPACES = Object.freeze({
  CONSUMER: 'consumer',
  BUSINESS: 'business',
  FLEET: 'fleet',
  ENTERPRISE: 'enterprise',
  OWNER: 'owner',
});

/**
 * Canonical runtime route metadata. Page components stay out of this module so
 * navigation, audits and runtime guards can share a stable declarative model.
 */
export function canonicalRoute({
  path,
  workspace,
  label,
  navigation = true,
  canonical = true,
  capability = null,
  requiresAuth = false,
  mobilePriority = 'secondary',
  section = 'Primary',
}) {
  return Object.freeze({ path, workspace, label, navigation, canonical, capability, requiresAuth, mobilePriority, section });
}

const navigationRoutes = Object.freeze(
  Object.entries(WORKSPACE_NAVIGATION).flatMap(([workspace, links]) =>
    links.map((link) => canonicalRoute({
      path: link.path,
      workspace: workspace === 'admin' ? ROUTE_WORKSPACES.OWNER : workspace,
      label: link.label,
      section: link.section,
      navigation: true,
      canonical: true,
      mobilePriority: link.primary ? 'primary' : 'secondary',
    })),
  ),
);

const sharedCanonicalRoutes = Object.freeze([
  canonicalRoute({ path: '/place/:id', workspace: ROUTE_WORKSPACES.CONSUMER, label: 'Place', navigation: false, requiresAuth: false }),
  canonicalRoute({ path: '/check-in', workspace: ROUTE_WORKSPACES.CONSUMER, label: 'Check In', navigation: false, requiresAuth: true }),
  canonicalRoute({ path: '/check-in/:locationId', workspace: ROUTE_WORKSPACES.CONSUMER, label: 'Check In', navigation: false, requiresAuth: true }),
  canonicalRoute({ path: '/profile', workspace: ROUTE_WORKSPACES.CONSUMER, label: 'Profile', navigation: false, requiresAuth: true }),
  canonicalRoute({ path: '/notifications', workspace: ROUTE_WORKSPACES.CONSUMER, label: 'Notifications', navigation: false, requiresAuth: true }),
  canonicalRoute({ path: '/pricing', workspace: ROUTE_WORKSPACES.CONSUMER, label: 'Pricing', navigation: false }),
  canonicalRoute({ path: '/support', workspace: ROUTE_WORKSPACES.CONSUMER, label: 'Support', navigation: false }),
  canonicalRoute({ path: '/intelligence/actions', workspace: ROUTE_WORKSPACES.OWNER, label: 'Intelligence Actions', navigation: false, requiresAuth: true }),
]);

const legacyRoutes = Object.freeze([
  ['/discover', '/map'],
  ['/consumer', '/'],
  ['/interactions', '/check-in'],
  ['/interaction', '/check-in'],
  ['/visit', '/check-in'],
  ['/location/:id', '/place/:id'],
  ['/play/quests', '/play/quest'],
  ['/quests', '/play/quest'],
  ['/rewards', '/play'],
  ['/leaderboard', '/play'],
  ['/leaderboards', '/play'],
  ['/business/manage', '/business'],
  ['/business/qr-studio', '/business/qr'],
]).map(([path, canonical]) => Object.freeze({ path, canonical, navigation: false }));

export const routeGroups = Object.freeze({
  consumer: Object.freeze(navigationRoutes.filter((route) => route.workspace === ROUTE_WORKSPACES.CONSUMER)),
  business: Object.freeze(navigationRoutes.filter((route) => route.workspace === ROUTE_WORKSPACES.BUSINESS)),
  fleet: Object.freeze(navigationRoutes.filter((route) => route.workspace === ROUTE_WORKSPACES.FLEET)),
  enterprise: Object.freeze(navigationRoutes.filter((route) => route.workspace === ROUTE_WORKSPACES.ENTERPRISE)),
  owner: Object.freeze(navigationRoutes.filter((route) => route.workspace === ROUTE_WORKSPACES.OWNER)),
  shared: sharedCanonicalRoutes,
  legacy: legacyRoutes,
});

export function getCanonicalRoutes() {
  return Object.values(routeGroups).flat().filter((route) => route.canonical);
}

export function getRouteByPath(path) {
  return Object.values(routeGroups).flat().find((route) => route.path === path) || null;
}
