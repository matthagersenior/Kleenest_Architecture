import { CAPABILITY_REGISTRY } from './capabilityRegistry.js';

export const CAPABILITY_CONTRACT = Object.freeze(Object.fromEntries(
  Object.entries(CAPABILITY_REGISTRY).map(([key, value]) => [key, Object.freeze({
    id: key,
    label: value.label || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    authority: value.authority || 'supabase',
    services: Object.freeze(value.services || []),
    ui: Object.freeze(value.ui || []),
    facts: Object.freeze(value.facts || []),
    flow: value.flow || null,
    rule: value.rule || null,
  })]),
));

export function getCapabilityContract(id) {
  return CAPABILITY_CONTRACT[id] || null;
}

export function getCapabilityContractForWorkspace(workspace) {
  return Object.values(CAPABILITY_CONTRACT).filter(cap => cap.ui.includes(workspace) || cap.ui.includes('all'));
}

export function capabilityHasService(id, service) {
  return Boolean(CAPABILITY_CONTRACT[id]?.services.includes(service));
}

export function capabilityHasFact(id, fact) {
  return Boolean(CAPABILITY_CONTRACT[id]?.facts.includes(fact));
}

function capabilityId(value) {
  if (typeof value === 'string') return value;
  return value?.id || value?.key || value?.code || value?.feature_code || null;
}

function normalizeCatalog(catalog) {
  return new Map((Array.isArray(catalog) ? catalog : [])
    .map(item => [item?.feature_code || item?.code || item?.key, item])
    .filter(([key]) => Boolean(key)));
}

export function auditCapabilitySurface({ workspace = 'consumer', services = {}, visibleCapabilities = [], catalog = [] } = {}) {
  const catalogByCode = normalizeCatalog(catalog);
  const visibleIds = new Set((Array.isArray(visibleCapabilities) ? visibleCapabilities : [])
    .map(capabilityId)
    .filter(Boolean));
  const rows = getCapabilityContractForWorkspace(workspace).map(cap => {
    const serviceCoverage = cap.services.every(name => Boolean(services[name]));
    const visible = visibleIds.size === 0 || visibleIds.has(cap.id);
    const catalogItem = catalogByCode.get(cap.id) || catalogByCode.get(cap.label);
    const catalogEnabled = catalog.length === 0 || !catalogItem || catalogItem?.enabled !== false;
    const complete = serviceCoverage && visible && catalogEnabled;
    const status = !serviceCoverage
      ? 'missing-runtime-service'
      : !visible
        ? 'hidden'
        : !catalogEnabled
          ? 'disabled-in-catalog'
          : 'implemented';
    return {
      capability: cap.id,
      serviceCoverage,
      visible,
      catalogEnabled,
      complete,
      status,
      services: cap.services,
      facts: cap.facts,
    };
  });
  return {
    workspace,
    total: rows.length,
    complete: rows.filter(row => row.complete).length,
    missingServices: rows.filter(row => !row.serviceCoverage),
    hidden: rows.filter(row => !row.visible),
    disabled: rows.filter(row => !row.catalogEnabled),
    rows,
  };
}
