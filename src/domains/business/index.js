const TEXT_LIMIT = 2000;
const NAME_LIMIT = 240;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const requireId = (value, field) => {
  if (!ID_RE.test(String(value || ''))) throw new Error(`Invalid ${field}.`);
  return String(value);
};
const text = (value, field, max = TEXT_LIMIT, required = false) => {
  if (value == null || value === '') { if (required) throw new Error(`${field} is required.`); return null; }
  const v = String(value).trim();
  if (!v && required) throw new Error(`${field} is required.`);
  if (v.length > max) throw new Error(`${field} is too long.`);
  return v || null;
};
const bool = value => Boolean(value);
const rpc = (client, name, args) => client.rpc(name, args).then(({ data, error }) => { if (error) throw error; return data; });

export function createBusinessService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const businessId = value => requireId(value, 'business ID');
  const locationId = value => requireId(value, 'location ID');
  const campaignId = value => requireId(value, 'campaign ID');
  const promotionId = value => requireId(value, 'promotion ID');
  const contestId = value => requireId(value, 'contest ID');
  const eventId = value => requireId(value, 'event ID');
  const qrId = value => requireId(value, 'QR ID');
  const safePayload = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

  return Object.freeze({
    context: id => rpc(client, 'business_management_context', { p_business_id: businessId(id) }),
    canManage: id => rpc(client, 'business_can_manage', { p_business_id: businessId(id) }),
    listLocations: id => rpc(client, 'business_list_locations', { p_business_id: businessId(id) }),
    listCampaigns: id => rpc(client, 'business_list_campaigns', { p_business_id: businessId(id) }),
    listPromotions: id => rpc(client, 'business_list_promotions', { p_business_id: businessId(id) }).catch(error => { if (error?.code === '42883') return []; throw error; }),
    listEvents: id => rpc(client, 'business_list_events', { p_business_id: businessId(id) }),
    listContests: id => rpc(client, 'business_list_contests', { p_business_id: businessId(id) }),
    listQrs: id => rpc(client, 'business_list_qrs', { p_business_id: businessId(id) }).catch(error => { if (error?.code === '42883') return []; throw error; }),

    createLocation: (id, input = {}) => rpc(client, 'business_create_location', {
      p_business_id: businessId(id), p_name: text(input.name, 'Location name', NAME_LIMIT, true),
      p_address: text(input.address, 'Address'), p_city: text(input.city, 'City', 120), p_state: text(input.state, 'State', 80),
      p_postal_code: text(input.postal_code, 'Postal code', 30), p_latitude: input.latitude ?? input.lat ?? null, p_longitude: input.longitude ?? input.lng ?? null,
      p_phone: text(input.phone, 'Phone', 60), p_website: text(input.website, 'Website', 500)
    }),
    updateLocation: (bid, lid, input = {}) => rpc(client, 'business_update_location', {
      p_business_id: businessId(bid), p_location_id: locationId(lid), p_name: text(input.name, 'Location name', NAME_LIMIT, true),
      p_address: text(input.address, 'Address'), p_city: text(input.city, 'City', 120), p_state: text(input.state, 'State', 80), p_is_active: input.is_active == null ? true : bool(input.is_active)
    }),
    setLocationActive: (bid, lid, active) => rpc(client, 'business_set_location_active', { p_business_id: businessId(bid), p_location_id: locationId(lid), p_active: bool(active) }),

    createCampaign: (id, input = {}) => rpc(client, 'business_create_campaign', {
      p_business_id: businessId(id), p_name: text(input.name, 'Campaign name', NAME_LIMIT, true), p_campaign_type: text(input.type ?? input.campaign_type, 'Campaign type', 100, true),
      p_goal: text(input.goal, 'Campaign goal'), p_status: text(input.status ?? 'draft', 'Campaign status', 50, true)
    }),
    updateCampaign: (bid, cid, input = {}) => rpc(client, 'business_update_campaign', {
      p_business_id: businessId(bid), p_campaign_id: campaignId(cid), p_name: text(input.name, 'Campaign name', NAME_LIMIT, true),
      p_campaign_type: text(input.type ?? input.campaign_type, 'Campaign type', 100, true), p_goal: text(input.goal, 'Campaign goal'), p_status: text(input.status, 'Campaign status', 50, true)
    }),
    deleteCampaign: (bid, cid) => rpc(client, 'business_delete_campaign', { p_business_id: businessId(bid), p_campaign_id: campaignId(cid) }),

    createPromotion: (id, input = {}) => rpc(client, 'business_create_promotion', {
      p_business_id: businessId(id), p_title: text(input.title ?? input.name, 'Promotion title', NAME_LIMIT, true), p_description: text(input.description, 'Promotion description'),
      p_discount: input.discount == null ? null : Number(input.discount), p_location_id: input.locationId ?? input.location_id ? locationId(input.locationId ?? input.location_id) : null,
      p_starts_at: input.startsAt ?? input.starts_at ?? null, p_ends_at: input.endsAt ?? input.ends_at ?? null
    }),
    managePromotion: (bid, pid, action, payload = {}) => rpc(client, 'business_manage_promotion', { p_business_id: businessId(bid), p_promotion_id: promotionId(pid), p_action: text(action, 'Promotion action', 40, true), p_payload: safePayload(payload) }),
    deletePromotion: (bid, pid) => rpc(client, 'business_delete_promotion', { p_business_id: businessId(bid), p_id: promotionId(pid) }),
    setPromotionActive: (bid, pid, active) => rpc(client, 'business_set_promotion_active', { p_business_id: businessId(bid), p_promotion_id: promotionId(pid), p_active: bool(active) }),

    createEvent: (id, input = {}) => rpc(client, 'business_create_event', {
      p_business_id: businessId(id), p_location_id: input.locationId || input.location_id ? locationId(input.locationId ?? input.location_id) : null,
      p_title: text(input.title, 'Event title', NAME_LIMIT, true), p_description: text(input.description, 'Event description'), p_event_date: input.eventDate ?? input.event_date ?? null, p_event_time: input.eventTime ?? input.event_time ?? null
    }),
    updateEvent: (bid, eid, input = {}) => rpc(client, 'business_update_event', {
      p_business_id: businessId(bid), p_event_id: eventId(eid), p_location_id: input.locationId || input.location_id ? locationId(input.locationId ?? input.location_id) : null,
      p_title: text(input.title, 'Event title', NAME_LIMIT, true), p_description: text(input.description, 'Event description'), p_event_date: input.eventDate ?? input.event_date ?? null, p_event_time: input.eventTime ?? input.event_time ?? null
    }),
    deleteEvent: (bid, eid) => rpc(client, 'business_delete_event', { p_business_id: businessId(bid), p_event_id: eventId(eid) }),

    createContest: (id, input = {}) => rpc(client, 'business_create_contest', {
      p_business_id: businessId(id), p_name: text(input.name, 'Contest name', NAME_LIMIT, true), p_description: text(input.description, 'Contest description'),
      p_starts_at: input.startsAt ?? input.starts_at ?? null, p_ends_at: input.endsAt ?? input.ends_at ?? null, p_scoring_rules: safePayload(input.scoringRules ?? input.scoring_rules), p_rewards: safePayload(input.rewards)
    }),
    updateContest: (bid, cid, input = {}) => rpc(client, 'business_update_contest', {
      p_business_id: businessId(bid), p_contest_id: contestId(cid), p_name: text(input.name, 'Contest name', NAME_LIMIT, true), p_description: text(input.description, 'Contest description'),
      p_starts_at: input.startsAt ?? input.starts_at ?? null, p_ends_at: input.endsAt ?? input.ends_at ?? null, p_scoring_rules: safePayload(input.scoringRules ?? input.scoring_rules), p_rewards: safePayload(input.rewards), p_status: text(input.status, 'Contest status', 50, true)
    }),
    deleteContest: (bid, cid) => rpc(client, 'business_delete_contest', { p_business_id: businessId(bid), p_contest_id: contestId(cid) }),

    createQr: (bid, lid, label) => rpc(client, 'business_create_qr', { p_business_id: businessId(bid), p_location_id: locationId(lid), p_label: text(label, 'QR label', NAME_LIMIT, true) }),
    setQrActive: (bid, qid, active) => rpc(client, 'business_set_qr_active', { p_business_id: businessId(bid), p_qr_id: qrId(qid), p_active: bool(active) }),
    manageQr: (bid, lid, qid, action, payload = {}) => rpc(client, 'business_manage_qr', { p_business_id: businessId(bid), p_location_id: locationId(lid), p_qr_id: qid ? qrId(qid) : null, p_action: text(action, 'QR action', 40, true), p_payload: safePayload(payload) }),
    deleteQr: (bid, qid) => rpc(client, 'business_delete_qr', { p_business_id: businessId(bid), p_qr_id: qrId(qid) }),

    engagement: (id, start, end) => rpc(client, 'business_engagement_analytics', { p_business_id: businessId(id), p_start: start, p_end: end }),
    summaryAnalytics: (id, start, end) => rpc(client, 'business_summary_analytics', { p_business_id: businessId(id), p_start: start, p_end: end }),
    locationAnalytics: (id, start, end) => rpc(client, 'business_location_analytics', { p_business_id: businessId(id), p_start: start, p_end: end }),
    promotionAnalytics: (id, start, end) => rpc(client, 'business_promotion_analytics', { p_business_id: businessId(id), p_start: start, p_end: end }),
    campaignAnalytics: (id, start, end) => rpc(client, 'business_campaign_analytics', { p_business_id: businessId(id), p_start: start, p_end: end }),
    contestAnalytics: (id, start, end) => rpc(client, 'business_review_analytics', { p_business_id: businessId(id), p_start: start, p_end: end }),
    qrAnalytics: (id, start, end) => rpc(client, 'business_qr_analytics', { p_business_id: businessId(id), p_start: start, p_end: end })
  });
}
