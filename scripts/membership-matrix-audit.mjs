import { PRODUCT_TIERS, getProductTier, normalizeProductTier, capabilityAccess, capabilityState } from '../src/architecture/productModel.js';
import { CAPABILITY_REGISTRY } from '../src/architecture/capabilityRegistry.js';

const WORKSPACE_DOMAINS = Object.freeze({
  consumer: ['identity','locations','discovery','maps','checkins','reviews','evidence','qr','geofencing','progression','rewards','reputation','leaderboards','access','monetization','notifications','analytics','liveNetwork','intelligence','offline','support'],
  business: ['identity','locations','discovery','checkins','reviews','evidence','qr','geofencing','progression','rewards','reputation','leaderboards','business','businessLifecycle','access','monetization','notifications','analytics','liveNetwork','intelligence','reporting','externalData','support'],
  fleet: ['identity','locations','discovery','maps','checkins','evidence','qr','geofencing','progression','rewards','leaderboards','fleet','notifications','analytics','liveNetwork','intelligence','reporting','offline','support'],
  enterprise: ['identity','locations','discovery','checkins','evidence','qr','geofencing','progression','rewards','leaderboards','access','monetization','enterprise','notifications','analytics','liveNetwork','intelligence','reporting','offline','support'],
  admin: ['identity','locations','discovery','evidence','qr','geofencing','reviews','reputation','leaderboards','monetization','fleet','enterprise','notifications','analytics','liveNetwork','intelligence','reporting','externalData','offline','support','admin'],
});

const CAPABILITY_TO_DOMAIN = Object.freeze({
  consumer: 'identity', premium: 'monetization', family: 'family', fleet: 'fleet', enterprise: 'enterprise',
  business: 'business', businessGrowth: 'business', businessIntelligence: 'intelligence', businessEngagement: 'business',
  advancedCampaigns: 'business', advancedContests: 'progression', advancedEvents: 'business',
});

const errors = [];
const checks = [];

for (const [groupName, tiers] of Object.entries(PRODUCT_TIERS)) {
  for (const [tierName, tier] of Object.entries(tiers)) {
    checks.push({ tier: tier.id, group: groupName, label: tier.label });
    if (getProductTier(tier.id)?.id !== tier.id) errors.push(`${tier.id}: normalize/getProductTier round-trip failed`);

    for (const workspace of tier.workspaces) {
      if (!WORKSPACE_DOMAINS[workspace]) {
        errors.push(`${tier.id}: unknown workspace '${workspace}'`);
        continue;
      }
      for (const domain of WORKSPACE_DOMAINS[workspace]) {
        if (!CAPABILITY_REGISTRY[domain]) errors.push(`${tier.id}: workspace '${workspace}' references missing capability domain '${domain}'`);
      }
    }

    for (const capability of [...tier.capabilities, ...tier.lockedCapabilities]) {
      const domain = CAPABILITY_TO_DOMAIN[capability];
      if (!domain || !CAPABILITY_REGISTRY[domain]) errors.push(`${tier.id}: capability '${capability}' has no canonical capability-domain mapping`);
    }

    const overlapping = tier.capabilities.filter((capability) => tier.lockedCapabilities.includes(capability));
    if (overlapping.length) errors.push(`${tier.id}: capability is both enabled and locked: ${overlapping.join(', ')}`);

    if (tier.ads && tier.capabilities.includes('premium')) errors.push(`${tier.id}: ad-supported tier cannot have premium capability`);
    if (!tier.ads && tier.id === 'user_free') errors.push(`${tier.id}: free tier must remain ad-supported`);
  }
}

const tierSamples = [
  ['free','user_free'], ['premium','user_premium'], ['family','user_family'], ['fleet','user_fleet'], ['enterprise','user_enterprise'],
  ['business','business_standard'], ['business_growth','business_growth'], ['business_fleet','business_fleet'], ['business_enterprise','business_enterprise'],
];
for (const [raw, expected] of tierSamples) {
  const normalized = normalizeProductTier(raw);
  if (getProductTier(normalized).id !== expected) errors.push(`normalization '${raw}' resolved to '${getProductTier(normalized).id}', expected '${expected}'`);
}

const report = {
  generatedAt: new Date().toISOString(),
  tierCount: checks.length,
  tiers: checks,
  workspaceCount: Object.keys(WORKSPACE_DOMAINS).length,
  capabilityDomainCount: Object.keys(CAPABILITY_REGISTRY).length,
  status: errors.length ? 'attention' : 'ok',
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
