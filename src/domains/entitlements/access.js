export const CAPABILITIES = Object.freeze({
  CONSUMER: 'consumer',
  PREMIUM: 'premium',
  BUSINESS: 'business',
  FLEET: 'fleet',
  ENTERPRISE: 'enterprise',
  ADMIN: 'admin'
});

const LEGACY_ROLE_MAP = Object.freeze({
  user: CAPABILITIES.CONSUMER,
  owner: CAPABILITIES.BUSINESS,
  platform_admin: CAPABILITIES.ADMIN,
  super_admin: CAPABILITIES.ADMIN
});

export function normalizeCapability(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return LEGACY_ROLE_MAP[normalized] ?? normalized;
}

export function hasCapability(capabilities, capability) {
  return Array.isArray(capabilities) && capabilities.includes(normalizeCapability(capability));
}

export function hasAnyCapability(capabilities, required = []) {
  return required.length === 0 || required.some(value => hasCapability(capabilities, value));
}

export function hasAllCapabilities(capabilities, required = []) {
  return required.every(value => hasCapability(capabilities, value));
}

export function evaluateProfileCapabilities(profile, entitlements = []) {
  const role = String(profile?.role ?? '').trim().toLowerCase();
  const capabilities = new Set([CAPABILITIES.CONSUMER]);

  if (role === 'premium' || (profile?.subscription_tier && String(profile.subscription_tier).toLowerCase() !== 'free')) {
    capabilities.add(CAPABILITIES.PREMIUM);
  }
  if (['business', 'owner', 'enterprise', 'admin', 'platform_admin', 'super_admin'].includes(role) || profile?.is_business_user) {
    capabilities.add(CAPABILITIES.BUSINESS);
  }
  if (['fleet', 'admin', 'platform_admin', 'super_admin'].includes(role)) capabilities.add(CAPABILITIES.FLEET);
  if (['enterprise', 'admin', 'platform_admin', 'super_admin'].includes(role)) capabilities.add(CAPABILITIES.ENTERPRISE);
  if (['admin', 'platform_admin', 'super_admin'].includes(role) || profile?.is_admin) capabilities.add(CAPABILITIES.ADMIN);

  for (const entitlement of entitlements) {
    if (String(entitlement?.service_tier ?? '').toLowerCase() === 'enterprise') capabilities.add(CAPABILITIES.ENTERPRISE);
    if (entitlement?.fleet_enabled || entitlement?.enterprise_fleet_enabled) capabilities.add(CAPABILITIES.FLEET);
  }

  return Object.freeze([...capabilities]);
}

export function createEntitlementService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    getCurrentUserEntitlements: async () => {
      const { data, error } = await client.rpc('get_current_user_product_entitlements');
      if (error) throw error;
      return data ?? [];
    }
  });
}
