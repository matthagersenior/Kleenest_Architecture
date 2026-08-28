export const WORKSPACE_ORDER = Object.freeze(['consumer', 'business', 'fleet', 'enterprise', 'admin']);

export const WORKSPACES = Object.freeze({
  consumer: Object.freeze({ id: 'consumer', label: 'Kleenest', shortLabel: 'You', description: 'Find cleaner places, record visits, and earn rewards.' }),
  business: Object.freeze({ id: 'business', label: 'Business', shortLabel: 'Business', description: 'Manage locations, customer engagement, and growth.' }),
  fleet: Object.freeze({ id: 'fleet', label: 'Fleet', shortLabel: 'Fleet', description: 'Run vehicles, routes, service, maintenance, and metrics.' }),
  enterprise: Object.freeze({ id: 'enterprise', label: 'Enterprise', shortLabel: 'Enterprise', description: 'Manage networks, partners, allocations, and outcomes.' }),
  admin: Object.freeze({ id: 'admin', label: 'Owner Control', shortLabel: 'Owner', description: 'Control the Kleenest platform, data, access, and governance.' }),
});

export function getWorkspace(id = 'consumer') {
  return WORKSPACES[id] || WORKSPACES.consumer;
}
