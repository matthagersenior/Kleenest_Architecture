export const ROUTE_WORKSPACES = Object.freeze({
  CONSUMER: 'consumer',
  BUSINESS: 'business',
  FLEET: 'fleet',
  ENTERPRISE: 'enterprise',
  OWNER: 'owner',
});

/**
 * Canonical runtime routing metadata.
 * Keep this file declarative: route registration, navigation and audits can
 * consume the same metadata without importing page implementations.
 */
export const canonicalRoute = ({
  path,
  workspace,
  label,
  navigation = true,
  canonical = true,
  capability = null,
  requiresAuth = false,
  mobilePriority = 'secondary',
}) => Object.freeze({
  path,
  workspace,
  label,
  navigation,
  canonical,
  capability,
  requiresAuth,
  mobilePriority,
});

export const routeGroups = Object.freeze({
  consumer: [],
  business: [],
  fleet: [],
  enterprise: [],
  owner: [],
  shared: [],
  legacy: [],
});

export function getCanonicalRoutes() {
  return Object.values(routeGroups).flat().filter((route) => route.canonical);
}

export function getRouteByPath(path) {
  return Object.values(routeGroups).flat().find((route) => route.path === path) || null;
}
