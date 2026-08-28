import { CAPABILITIES, hasCapability } from '../domains/entitlements/access.js';
import { CAPABILITY_REGISTRY } from '../architecture/capabilityRegistry.js';
import { getWorkspace, WORKSPACE_ORDER, WORKSPACES } from './workspaceDefinitions.js';
import { getNavigationForWorkspace } from './workspaceNavigation.js';
import { getMembershipModel, normalizeMembership, resolveMembership, getWorkspaceForMembership, MEMBERSHIP_UI } from './membershipModel.js';

export { WORKSPACE_ORDER, WORKSPACES, getWorkspace, MEMBERSHIP_UI, normalizeMembership, resolveMembership, getWorkspaceForMembership };

const CAPABILITY_FOR_WORKSPACE = Object.freeze({ business: CAPABILITIES.BUSINESS, fleet: CAPABILITIES.FLEET, enterprise: CAPABILITIES.ENTERPRISE, admin: 'owner' });

export function canUseWorkspace(capabilities = [], workspace = 'consumer') {
  if (workspace === 'consumer') return true;
  if (workspace === 'admin') return hasCapability(capabilities, 'owner');
  const required = CAPABILITY_FOR_WORKSPACE[workspace];
  return Boolean(required && hasCapability(capabilities, required));
}

export function getAvailableWorkspaces(capabilities = []) { return WORKSPACE_ORDER.filter(workspace => canUseWorkspace(capabilities, workspace)); }

export function getWorkspaceModel({ membership = 'free', workspace, businessId = null, capabilities = [], isPlatformOwner = false } = {}) {
  const membershipModel = getMembershipModel({ membership, capabilities, isPlatformOwner });
  const requestedWorkspace = workspace || (isPlatformOwner ? 'admin' : getWorkspaceForMembership(membershipModel.membership));
  const resolvedWorkspace = isPlatformOwner ? 'admin' : (canUseWorkspace(capabilities, requestedWorkspace) ? requestedWorkspace : 'consumer');
  const effectiveCapabilities = isPlatformOwner ? Array.from(new Set([...capabilities, 'owner', 'business', 'fleet', 'enterprise'])) : Array.from(new Set([...(membershipModel.productTier.capabilities || []), ...capabilities]));
  return Object.freeze({ ...membershipModel, businessId, workspace: getWorkspace(resolvedWorkspace), availableWorkspaces: getAvailableWorkspaces(effectiveCapabilities) });
}

export function getCapabilityDomainsForWorkspace(workspace) {
  return Object.keys(CAPABILITY_REGISTRY).filter(domain => CAPABILITY_REGISTRY[domain]?.ui?.includes(workspace) || CAPABILITY_REGISTRY[domain]?.ui?.includes('all'));
}

export { getNavigationForWorkspace };
