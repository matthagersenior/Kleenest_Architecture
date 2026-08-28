import { CAPABILITIES, hasCapability } from '../domains/entitlements/access.js';
import { getProductTier, PRODUCT_TIERS } from '../architecture/productModel.js';

export const MEMBERSHIP_UI = Object.freeze({
  free: Object.freeze({ label: 'Free', ads: true, workspace: 'consumer' }), premium: Object.freeze({ label: 'Premium', ads: false, workspace: 'consumer' }), family: Object.freeze({ label: 'Family', ads: false, workspace: 'consumer' }),
  business_standard: Object.freeze({ label: 'Business Standard', ads: false, workspace: 'business' }), business_growth: Object.freeze({ label: 'Business Growth', ads: false, workspace: 'business' }), business_fleet: Object.freeze({ label: 'Business Fleet', ads: false, workspace: 'fleet' }), business_enterprise: Object.freeze({ label: 'Business Enterprise', ads: false, workspace: 'enterprise' }), enterprise: Object.freeze({ label: 'Enterprise User', ads: false, workspace: 'enterprise' }), fleet: Object.freeze({ label: 'Fleet User', ads: false, workspace: 'fleet' }), admin: Object.freeze({ label: 'Owner Control', ads: false, workspace: 'admin' }),
});

export function normalizeMembership(raw = {}) {
  const source = raw?.data || raw?.entitlement || raw?.entitlements || raw;
  const tier = String(source?.membership_tier || source?.product_tier || source?.tier || source?.service_tier || source?.plan || 'free').toLowerCase().replace(/[-\s]/g, '_');
  if (tier.includes('business') && tier.includes('enterprise')) return 'business_enterprise';
  if (tier.includes('business') && tier.includes('fleet')) return 'business_fleet';
  if (tier.includes('business') && tier.includes('growth')) return 'business_growth';
  if (tier.includes('business')) return 'business_standard';
  if (tier.includes('admin')) return 'admin'; if (tier.includes('fleet')) return 'fleet'; if (tier.includes('enterprise')) return 'enterprise'; if (tier.includes('family')) return 'family'; if (tier.includes('premium') || tier.includes('pro')) return 'premium'; return 'free';
}

export function resolveMembership(rawMembership, capabilities = []) {
  const parsed = normalizeMembership({ tier: rawMembership });
  if (parsed !== 'free') return parsed;
  if (hasCapability(capabilities, 'owner')) return 'admin';
  if (hasCapability(capabilities, CAPABILITIES.ENTERPRISE)) return 'enterprise';
  if (hasCapability(capabilities, CAPABILITIES.FLEET)) return 'fleet';
  if (hasCapability(capabilities, CAPABILITIES.BUSINESS)) return 'business_standard';
  return parsed;
}

export function getWorkspaceForMembership(membership) { return MEMBERSHIP_UI[membership]?.workspace || 'consumer'; }

export function getMembershipModel({ membership = 'free', capabilities = [], isPlatformOwner = false } = {}) {
  const resolvedMembership = isPlatformOwner ? 'admin' : resolveMembership(membership, capabilities);
  const productTier = isPlatformOwner ? { ...PRODUCT_TIERS.business.enterprise, id: 'owner', label: 'Owner Control' } : getProductTier(resolvedMembership);
  return Object.freeze({ membership: resolvedMembership, membershipLabel: productTier.label || MEMBERSHIP_UI[resolvedMembership]?.label || 'Free', productTier, adsEnabled: productTier.ads !== false });
}
