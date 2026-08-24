export const PRODUCT_TIERS = Object.freeze({
  user: Object.freeze({
    free: Object.freeze({ id: 'user_free', label: 'Free', ads: true, workspaces: ['consumer'], capabilities: ['consumer', 'premium'], lockedCapabilities: [] }),
    premium: Object.freeze({ id: 'user_premium', label: 'Premium', ads: false, workspaces: ['consumer'], capabilities: ['consumer', 'premium'], lockedCapabilities: [] }),
    fleet: Object.freeze({ id: 'user_fleet', label: 'Fleet User', ads: false, workspaces: ['consumer', 'fleet'], capabilities: ['consumer', 'premium', 'fleet'], lockedCapabilities: ['enterprise'] }),
    enterprise: Object.freeze({ id: 'user_enterprise', label: 'Enterprise User', ads: false, workspaces: ['consumer', 'fleet', 'enterprise'], capabilities: ['consumer', 'premium', 'fleet', 'enterprise'], lockedCapabilities: [] }),
  }),
  business: Object.freeze({
    standard: Object.freeze({ id: 'business_standard', label: 'Business Standard', ads: false, workspaces: ['business'], capabilities: ['business'], lockedCapabilities: ['businessGrowth', 'businessIntelligence', 'enterprise', 'fleet', 'businessEngagement', 'advancedCampaigns', 'advancedContests', 'advancedEvents'] }),
    growth: Object.freeze({ id: 'business_growth', label: 'Business Growth', ads: false, workspaces: ['business', 'enterprise'], capabilities: ['business', 'businessGrowth', 'businessIntelligence', 'enterprise', 'businessEngagement', 'advancedCampaigns', 'advancedContests', 'advancedEvents'], lockedCapabilities: ['fleet'] }),
    fleet: Object.freeze({ id: 'business_fleet', label: 'Business Fleet', ads: false, workspaces: ['business', 'fleet', 'enterprise'], capabilities: ['business', 'businessGrowth', 'businessIntelligence', 'businessEngagement', 'fleet', 'enterprise', 'advancedCampaigns', 'advancedContests', 'advancedEvents'], lockedCapabilities: [] }),
    enterprise: Object.freeze({ id: 'business_enterprise', label: 'Business Enterprise', ads: false, workspaces: ['business', 'fleet', 'enterprise'], capabilities: ['business', 'businessGrowth', 'businessIntelligence', 'businessEngagement', 'fleet', 'enterprise', 'advancedCampaigns', 'advancedContests', 'advancedEvents'], lockedCapabilities: [] }),
  }),
});

export const PRODUCT_TIER_IDS = Object.freeze(
  Object.values(PRODUCT_TIERS).flatMap((group) => Object.values(group).map((tier) => tier.id)),
);

export function normalizeProductTier(raw = 'free') {
  const value = String(raw ?? 'free').toLowerCase().replace(/[\s-]+/g, '_');
  if (value.includes('business') && value.includes('enterprise')) return 'business.enterprise';
  if (value.includes('business') && value.includes('fleet')) return 'business.fleet';
  if (value.includes('business') && value.includes('growth')) return 'business.growth';
  if (value.includes('business')) return 'business.standard';
  if (value.includes('enterprise')) return 'user.enterprise';
  if (value.includes('fleet')) return 'user.fleet';
  if (value.includes('premium') || value.includes('pro')) return 'user.premium';
  return 'user.free';
}

export function getProductTier(raw) {
  const key = normalizeProductTier(raw);
  const [family, tier] = key.split('.');
  return PRODUCT_TIERS[family]?.[tier] ?? PRODUCT_TIERS.user.free;
}

export function resolveProductModel({ membership = 'free', capabilities = [], businessTier = null } = {}) {
  const caps = new Set(capabilities || []);
  const raw = businessTier || membership;
  const tier = getProductTier(raw);
  if (String(raw).toLowerCase().includes('business') || businessTier) {
    const business = getProductTier(`business_${String(businessTier || membership).replace(/^business_/, '')}`);
    if (business?.id?.startsWith('business_')) return business;
  }
  if (caps.has('enterprise')) return PRODUCT_TIERS.user.enterprise;
  if (caps.has('fleet')) return PRODUCT_TIERS.user.fleet;
  return tier;
}

export function shouldSuppressAds({ productTier, entitlements = [] } = {}) {
  if (productTier?.ads === false) return true;
  return (entitlements || []).some((item) => String(item?.key ?? item?.feature ?? item?.code ?? '').toLowerCase().includes('ads') && String(item?.value ?? item?.status ?? '').toLowerCase() !== 'enabled');
}

export function capabilityAccess(productTier, capability) {
  return Boolean(productTier?.capabilities?.includes(capability) || productTier?.capabilities?.includes('enterprise'));
}

export function capabilityState(productTier, capability) {
  if (capabilityAccess(productTier, capability)) return 'enabled';
  if (productTier?.lockedCapabilities?.includes(capability)) return 'locked';
  return 'hidden';
}

export function getProductFamilies() {
  return Object.freeze(Object.keys(PRODUCT_TIERS));
}
