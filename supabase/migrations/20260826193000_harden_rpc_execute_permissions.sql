-- Harden API execution privileges without changing authenticated application contracts.
-- Internal audit/maintenance routines are service-role only; user-facing RPCs retain authenticated access.
revoke execute on function public.audit_contributor_reputation_consistency(boolean) from anon, authenticated;
revoke execute on function public.capability_classification_summary() from anon, authenticated;
revoke execute on function public.capability_retirement_audit() from anon, authenticated;
revoke execute on function public.check_single_capability_per_domain() from anon, authenticated;
revoke execute on function public.refresh_bathroom_intelligence(integer) from anon, authenticated;
revoke execute on function public.refresh_location_bathroom_intelligence_trigger() from anon, authenticated;
revoke execute on function public.refresh_reputation_for_evidence_user() from anon, authenticated;
revoke execute on function public.recompute_contributor_reputation(uuid) from anon, authenticated;
revoke execute on function public._collect_raw_schema_capability_audit() from anon, authenticated;
revoke execute on function public.admin_raw_schema_capability_audit() from anon, authenticated;
revoke execute on function public.admin_data_integrity_summary() from anon, authenticated;
revoke execute on function public.business_restroom_health_score(uuid, uuid) from anon;
revoke execute on function public.create_gps_geofence_notification(uuid, integer, text, text, text, jsonb) from anon;
revoke execute on function public.enterprise_list_network_campaigns(uuid) from anon;
revoke execute on function public.enterprise_list_network_members(uuid) from anon;
revoke execute on function public.enterprise_list_owned_networks(uuid) from anon;
revoke execute on function public.enterprise_list_partner_businesses(uuid) from anon;
revoke execute on function public.get_business_growth_action_summary(uuid) from anon;
revoke execute on function public.get_location_recommendation_summary(uuid) from anon;
revoke execute on function public.list_qr_engagement_programs(uuid) from anon;
revoke execute on function public.semantic_location_search(text, double precision, double precision, integer, integer) from anon;
revoke execute on function public.submit_location_photo_record(uuid, text, text, text, text, bigint, integer, integer) from anon;
revoke execute on function public.submit_location_photo_record(uuid, text, text, text, text, bigint, integer, integer, uuid) from anon;
