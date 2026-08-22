export const CAPABILITY_REGISTRY = Object.freeze({
  identity: {
    authority: 'supabase',
    services: ['identity', 'profile', 'entitlements', 'platformAccount', 'platformEntitlements'],
    ui: ['consumer', 'profile', 'business', 'fleet', 'enterprise', 'admin'],
    facts: ['profiles', 'subscriptions', 'account_service_entitlements', 'user_feature_entitlements'],
  },
  locations: {
    authority: 'supabase',
    services: ['maps', 'locationEvidence'],
    ui: ['consumer', 'business', 'fleet', 'enterprise', 'admin'],
    facts: ['locations', 'places', 'location_confidence', 'location_feature_summary', 'location_observations', 'location_data_conflicts'],
  },
  maps: {
    authority: 'supabase',
    services: ['maps', 'routing', 'offline', 'live'],
    ui: ['consumer', 'fleet'],
    facts: ['route_plans', 'route_stops', 'route_events', 'location_visits', 'user_location_sessions', 'offline_packs'],
  },
  checkins: {
    authority: 'supabase',
    services: ['checkins', 'engagement', 'analytics'],
    ui: ['consumer', 'profile', 'business', 'fleet', 'enterprise'],
    facts: ['check_ins', 'location_visits', 'analytics_events'],
    flow: 'location -> check-in -> rating/evidence -> progression -> intelligence',
  },
  reviews: {
    authority: 'supabase',
    services: ['reviews', 'locationEvidence', 'community'],
    ui: ['consumer', 'community', 'business', 'admin'],
    facts: ['reviews', 'review_photos', 'review_likes', 'review_amenity_feedback'],
  },
  evidence: {
    authority: 'supabase',
    services: ['locationEvidence', 'community'],
    ui: ['consumer', 'community', 'business', 'fleet', 'enterprise', 'admin'],
    facts: ['location_observations', 'location_quality_observations', 'location_observation_votes', 'location_bathroom_verifications'],
    flow: 'observation -> verification -> quality signal -> contributor reputation -> intelligence',
  },
  qr: {
    authority: 'supabase',
    services: ['qr'],
    ui: ['consumer', 'business', 'fleet', 'enterprise', 'play', 'admin'],
    facts: ['qr_codes', 'qr_attribution_events', 'qr_redemptions', 'qr_intelligence_events'],
    flow: 'scan -> authoritative action -> attribution -> progression/reward -> intelligence',
  },
  geofencing: {
    authority: 'supabase',
    services: ['geofencing', 'notifications', 'live'],
    ui: ['consumer', 'business', 'fleet', 'enterprise', 'play', 'admin'],
    facts: ['geofence_events', 'business_geofences', 'live_network_events'],
    flow: 'enter/dwell/exit -> contextual action -> event -> intelligence',
  },
  progression: {
    authority: 'supabase',
    services: ['progression', 'quests', 'engagement'],
    ui: ['profile', 'play', 'consumer', 'business', 'fleet', 'enterprise'],
    facts: ['progression_actions', 'progression_games', 'progression_challenges', 'progression_metric_events', 'point_transactions', 'user_streaks', 'user_badges'],
    flow: 'verified behavior -> XP/points -> progression -> reward eligibility',
  },
  quests: {
    authority: 'supabase',
    services: ['quests', 'progression', 'qr', 'geofencing'],
    ui: ['play', 'business', 'fleet', 'enterprise', 'admin'],
    facts: ['quests', 'quest_steps', 'quest_participation', 'quest_step_events'],
    flow: 'quest -> route -> QR/geofence/task -> validation -> XP/reward -> leaderboard',
  },
  rewards: {
    authority: 'supabase',
    services: ['progression', 'engagement', 'business'],
    ui: ['profile', 'consumer', 'business', 'fleet', 'enterprise', 'play'],
    facts: ['reward_transactions', 'business_earned_perks', 'promotions', 'promotion_redemptions'],
  },
  leaderboards: {
    authority: 'supabase',
    services: ['intelligence', 'businessIntelligence', 'fleetIntelligence'],
    ui: ['consumer', 'profile', 'business', 'fleet', 'enterprise', 'community', 'admin'],
    facts: ['business_metric_leaderboards', 'network_leaderboard_sources', 'network_leaderboard_participation', 'leaderboard_rewards'],
    flow: 'canonical metric -> scoped leaderboard -> participation -> reward/recognition -> network intelligence',
  },
  business: {
    authority: 'supabase',
    services: ['business', 'businessIntelligence', 'qr', 'geofencing', 'engagement'],
    ui: ['business', 'consumer'],
    facts: ['business_campaigns', 'business_events', 'promotions', 'promotion_redemptions', 'business_engagement_attributions', 'business_growth_signals'],
    flow: 'location -> campaign -> QR/geofence -> engagement -> redemption -> ROI/intelligence',
  },
  fleet: {
    authority: 'supabase',
    services: ['fleet', 'fleetMetrics', 'fleetIntelligence', 'routing', 'geofencing'],
    ui: ['fleet', 'admin'],
    facts: ['fleet_routes', 'fleet_operational_events', 'fleet_performance_events', 'fleet_metric_snapshots', 'fleet_driver_scorecards', 'fleet_vehicle_daily_metrics'],
    flow: 'route -> stop -> service event -> metric -> scorecard -> Fleet leaderboard -> network intelligence',
  },
  enterprise: {
    authority: 'supabase',
    services: ['partners', 'intelligence', 'businessIntelligence'],
    ui: ['enterprise', 'admin'],
    facts: ['enterprise_partner_networks', 'enterprise_partner_campaigns', 'enterprise_partner_campaign_outcomes', 'enterprise_partner_allocations', 'enterprise_engagement_events', 'enterprise_intelligence_events'],
    flow: 'partner network -> campaign -> allocation -> outcome -> shared intelligence',
  },
  social: {
    authority: 'supabase',
    services: ['community', 'communityMedia'],
    ui: ['community', 'consumer', 'profile'],
    facts: ['social_posts', 'social_activity', 'social_challenge_entries', 'follows', 'messages'],
  },
  notifications: {
    authority: 'supabase',
    services: ['notifications', 'notificationPreferences', 'intelligence', 'geofencing'],
    ui: ['consumer', 'profile', 'business', 'fleet', 'enterprise', 'admin'],
    facts: ['notification_events', 'notification_deliveries', 'notifications', 'intelligence_notification_jobs', 'intelligence_notification_deliveries'],
    flow: 'fact/intelligence -> contextual notification -> CTA -> authoritative mutation',
  },
  analytics: {
    authority: 'supabase',
    services: ['analytics', 'intelligence'],
    ui: ['all'],
    facts: ['analytics_events', 'data_feature_events', 'user_engagement_daily'],
    rule: 'analytics consumes canonical facts; analytics does not create shadow business facts',
  },
  admin: {
    authority: 'supabase',
    services: ['admin', 'intelligence', 'platformAccount', 'platformEntitlements'],
    ui: ['admin'],
    facts: ['admin_capability_audit', 'support_requests', 'user_feedback'],
    rule: 'privileged operations remain owner/admin gated and never leak into public workspace contracts',
  },
});

export const CAPABILITY_DOMAINS = Object.freeze(Object.keys(CAPABILITY_REGISTRY));

export function getCapabilityRegistry() {
  return CAPABILITY_REGISTRY;
}

export function getCapabilitiesForWorkspace(workspace) {
  return CAPABILITY_DOMAINS.filter((domain) => {
    const ui = CAPABILITY_REGISTRY[domain]?.ui || [];
    return ui.includes('all') || ui.includes(workspace);
  });
}
