import { evaluateProfileCapabilities } from '../entitlements/access.js';

export function createIdentitySnapshot({ user = null, profile = null, entitlements = [], loading = false, error = null } = {}) {
  const capabilities = evaluateProfileCapabilities(profile, entitlements);
  return Object.freeze({
    user,
    profile,
    entitlements: Object.freeze([...entitlements]),
    capabilities,
    loading: Boolean(loading),
    authenticated: Boolean(user),
    error
  });
}
