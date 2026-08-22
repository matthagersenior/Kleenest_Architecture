export { createIdentityService } from './auth.js';
export { createProfileService, PROFILE_FIELDS } from './profile.js';
export { createIdentitySnapshot } from './identity-snapshot.js';
export {
  CAPABILITIES,
  normalizeCapability,
  hasCapability,
  hasAnyCapability,
  hasAllCapabilities,
  evaluateProfileCapabilities,
  createEntitlementService
} from '../entitlements/access.js';
