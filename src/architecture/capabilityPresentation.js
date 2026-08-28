import { getCapabilityRegistry, getCapabilitiesForWorkspace } from './capabilityRegistry.js';

export const CAPABILITY_ROUTES = Object.freeze({
  identity: '/profile', locations: '/map', discovery: '/map', maps: '/map', checkins: '/activity',
  reviews: '/evidence', evidence: '/evidence', qr: '/engage', geofencing: '/engagement/orchestrate',
  progression: '/play', quests: '/play/quest', rewards: '/rewards', reputation: '/profile', leaderboards: '/leaderboards',
  business: '/business', businessLifecycle: '/business', access: '/access', monetization: '/pricing',
  fleet: '/fleet', enterprise: '/enterprise', social: '/community', family: '/family', notifications: '/notifications',
  analytics: '/intelligence', liveNetwork: '/intelligence', intelligence: '/intelligence', reporting: '/reporting',
  externalData: '/admin', offline: '/route', support: '/support', admin: '/admin',
});

export const CAPABILITY_LABELS = Object.freeze({
  businessLifecycle: 'Business lifecycle', liveNetwork: 'Live network', externalData: 'External data',
});

export function capabilityLabel(id, capability = {}) {
  return capability.label || CAPABILITY_LABELS[id] || String(id || '')
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, value => value.toUpperCase());
}

export function capabilityRoute(id) {
  return CAPABILITY_ROUTES[id] || '/integration';
}

export function capabilityCatalogState(catalog, id) {
  const item = (Array.isArray(catalog) ? catalog : []).find(row => row?.feature_code === id || row?.code === id || row?.key === id || row?.resource === id);
  if (!item) return { item: null, enabled: true, status: 'registry-defined' };
  const enabled = item.enabled !== false && item.active !== false && item.status !== 'disabled' && item.status !== 'inactive';
  return { item, enabled, status: enabled ? 'catalog-active' : 'disabled-in-catalog' };
}

export function capabilityServiceState(services, capability = {}) {
  const names = Array.isArray(capability.services) ? capability.services : [];
  const missing = names.filter(name => !services?.[name]);
  return { covered: missing.length === 0, missing };
}

export function buildCapabilityPresentation({ workspace = 'consumer', services = {}, visibleCapabilities = [], catalog = [], contracts = [] } = {}) {
  const registry = getCapabilityRegistry();
  const visible = new Set((Array.isArray(visibleCapabilities) ? visibleCapabilities : []).map(value => typeof value === 'string' ? value : value?.id || value?.key || value?.code || value?.feature_code).filter(Boolean));
  return getCapabilitiesForWorkspace(workspace).map(id => {
    const capability = registry[id] || {};
    const service = capabilityServiceState(services, capability);
    const catalogState = capabilityCatalogState(catalog, id);
    const exposed = visible.size === 0 || visible.has(id);
    const contract = (Array.isArray(contracts) ? contracts : []).find(row => row?.canonical_capability === id || row?.domain === id);
    const status = !service.covered ? 'missing-runtime-service' : !exposed ? 'hidden' : !catalogState.enabled ? 'disabled-in-catalog' : 'implemented';
    return {
      id,
      ...capability,
      label: capabilityLabel(id, capability),
      route: capabilityRoute(id),
      serviceCovered: service.covered,
      missingServices: service.missing,
      exposed,
      catalog: catalogState.item,
      catalogEnabled: catalogState.enabled,
      contract,
      status,
    };
  });
}
