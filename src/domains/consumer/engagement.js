export function createConsumerEngagementService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params = {}) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  return Object.freeze({
    preferred: {
      canActivate: locationId => rpc('can_activate_preferred_location', { p_location_id: locationId }),
      eligibility: locationId => rpc('check_preferred_eligibility', { p_location_id: locationId }),
      activate: locationId => rpc('activate_preferred_location', { p_location_id: locationId }),
      deactivate: locationId => rpc('deactivate_preferred_location', { p_location_id: locationId }),
      use: locationId => rpc('record_preferred_location_use', { p_location_id: locationId })
    },
    access: {
      offers: () => rpc('get_single_use_access_offers'),
      purchase: offerId => rpc('purchase_single_use_access', { p_offer_id: offerId }),
      redeem: purchaseId => rpc('redeem_single_use_access', { p_purchase_id: purchaseId })
    },
    progression: {
      completeChallenge: challengeId => rpc('complete_progression_challenge', { p_challenge_id: challengeId }),
      recordGameResult: (gameCode, score = 0, durationMs = null, metadata = {}) => rpc('record_game_result', { p_game_code: gameCode, p_score: score, p_duration_ms: durationMs, p_metadata: metadata }),
      refreshContributorReputation: userId => rpc('refresh_contributor_reputation', { p_user_id: userId }),
      quest: {
        start: questId => rpc('quest_start', { p_quest_id: questId }),
        leaderboard: (questId, limit = 25) => rpc('quest_leaderboard', { p_quest_id: questId, p_limit: limit }),
        recordStep: (participationId, questStepId, eventType, options = {}) => rpc('quest_record_step', { p_participation_id: participationId, p_quest_step_id: questStepId, p_event_type: eventType, p_source: options.source ?? null, p_metadata: options.metadata ?? {}, p_location_id: options.locationId ?? null, p_geofence_event_id: options.geofenceEventId ?? null, p_qr_code_id: options.qrCodeId ?? null, p_checkin_id: options.checkinId ?? null }),
        triggerGeofence: (locationId, geofenceEventId, eventType, options = {}) => rpc('quest_trigger_geofence', { p_location_id: locationId, p_geofence_event_id: geofenceEventId, p_event_type: eventType, p_dwell_seconds: options.dwellSeconds ?? null, p_metadata: options.metadata ?? {} }),
        triggerQr: (qrCodeId, options = {}) => rpc('quest_trigger_qr', { p_qr_code_id: qrCodeId, p_location_id: options.locationId ?? null, p_checkin_id: options.checkinId ?? null, p_metadata: options.metadata ?? {} })
      }
    },
    promotions: {
      redeem: (promotionId, locationId) => rpc('redeem_promotion', { p_promotion_id: promotionId, p_location_id: locationId }),
      redemptionSummary: promotionId => rpc('promotion_redemption_summary', { p_promotion_id: promotionId })
    },
    contests: {
      active: limit => rpc('home_active_contests', { p_limit: limit ?? 10 }),
      join: contestId => rpc('join_contest', { p_contest_id: contestId }),
      submitEntry: (contestId, entry) => rpc('submit_contest_entry', { p_contest_id: contestId, p_entry: entry || {} }),
      score: (contestId, userId) => rpc('contest_score', { p_contest_id: contestId, p_user_id: userId })
    },
    events: { active: limit => rpc('home_active_events', { p_limit: limit ?? 10 }) }
  });
}
