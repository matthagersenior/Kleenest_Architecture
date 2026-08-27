import { PRODUCT_TIERS, getProductTier, normalizeProductTier } from '../src/architecture/productModel.js';
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
const assert = (condition, message) => { if (!condition) errors.push(message); };

for (const [groupName, tiers] of Object.entries(PRODUCT_TIERS)) {
  for (const [tierName, tier] of Object.entries(tiers)) {
    checks.push({ tier: tier.id, group: groupName, label: tier.label });
    assert(getProductTier(tier.id)?.id === tier.id, `${tier.id}: normalize/getProductTier round-trip failed`);

    for (const workspace of tier.workspaces) {
      const domains = WORKSPACE_DOMAINS[workspace];
      assert(Boolean(domains), `${tier.id}: unknown workspace '${workspace}'`);
      if (!domains) continue;
      for (const domain of domains) assert(Boolean(CAPABILITY_REGISTRY[domain]), `${tier.id}: workspace '${workspace}' references missing capability domain '${domain}'`);
    }

    for (const capability of [...tier.capabilities, ...tier.lockedCapabilities]) {
      const domain = CAPABILITY_TO_DOMAIN[capability];
      assert(Boolean(domain && CAPABILITY_REGISTRY[domain]), `${tier.id}: capability '${capability}' has no canonical capability-domain mapping`);
      if (!domain || !CAPABILITY_REGISTRY[domain]) continue;
      for (const workspace of tier.workspaces) {
        const ui = CAPABILITY_REGISTRY[domain]?.ui || [];
        assert(ui.includes('all') || ui.includes(workspace), `${tier.id}: capability '${capability}' maps to '${domain}', but '${workspace}' is not an exposed UI workspace`);
      }
    }

    const overlapping = tier.capabilities.filter((capability) => tier.lockedCapabilities.includes(capability));
    assert(!overlapping.length, `${tier.id}: capability is both enabled and locked: ${overlapping.join(', ')}`);
    assert(!(tier.ads && tier.capabilities.includes('premium')), `${tier.id}: ad-supported tier cannot have premium capability`);
    assert(!(tier.id === 'user_free' && !tier.ads), `${tier.id}: free tier must remain ad-supported`);
  }
}

const tierSamples = [
  ['free','user_free'], ['premium','user_premium'], ['family','user_family'], ['fleet','user_fleet'], ['enterprise','user_enterprise'],
  ['business','business_standard'], ['business_growth','business_growth'], ['business_fleet','business_fleet'], ['business_enterprise','business_enterprise'],
];
for (const [raw, expected] of tierSamples) {
  const normalized = normalizeProductTier(raw);
  assert(getProductTier(normalized)?.id === expected, `normalization '${raw}' resolved to '${getProductTier(normalized)?.id}', expected '${expected}'`);
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
