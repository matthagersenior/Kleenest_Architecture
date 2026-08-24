-- Reconcile the remaining privileged SECURITY DEFINER RPC grants.
-- Sensitive control/intelligence functions must not inherit PUBLIC execution.
-- Authenticated access is retained only for product-facing capability checks;
-- privileged mutation/control RPCs remain authenticated-only or owner-gated.

revoke execute on function public.account_effective_business_tier(uuid) from public;
grant execute on function public.account_effective_business_tier(uuid) to authenticated;

revoke execute on function public.get_business_product_access(uuid) from public;
grant execute on function public.get_business_product_access(uuid) to authenticated;

revoke execute on function public.get_current_user_product_entitlements() from public;
grant execute on function public.get_current_user_product_entitlements() to authenticated;

revoke execute on function public.get_fleet_leaderboard(uuid,text,text,integer) from public;
grant execute on function public.get_fleet_leaderboard(uuid,text,text,integer) to authenticated;

revoke execute on function public.get_fleet_network_leaderboard(text,integer) from public;
grant execute on function public.get_fleet_network_leaderboard(text,integer) to authenticated;

revoke execute on function public.get_platform_leaderboard(text,integer) from public;
grant execute on function public.get_platform_leaderboard(text,integer) to authenticated;

revoke execute on function public.has_fleet_access(uuid) from public;
grant execute on function public.has_fleet_access(uuid) to authenticated;

revoke execute on function public.record_feature_access(text,text,text,text,jsonb) from public;
grant execute on function public.record_feature_access(text,text,text,text,jsonb) to authenticated;

revoke execute on function public.resolve_location_external_identity(text,text,double precision,double precision,text) from public;
grant execute on function public.resolve_location_external_identity(text,text,double precision,double precision,text) to authenticated;

revoke execute on function public.resolve_nearby_notification_recipients(uuid,integer) from public;
grant execute on function public.resolve_nearby_notification_recipients(uuid,integer) to authenticated;

revoke execute on function public.get_public_restroom_intelligence(uuid) from public;
grant execute on function public.get_public_restroom_intelligence(uuid) to authenticated;

revoke execute on function public.list_qr_engagement_programs(uuid) from public;
grant execute on function public.list_qr_engagement_programs(uuid) to authenticated;

revoke execute on function public.quest_creator_authorized(text,uuid) from public;
grant execute on function public.quest_creator_authorized(text,uuid) to authenticated;

revoke execute on function public.quest_list_creator(text,uuid) from public;
grant execute on function public.quest_list_creator(text,uuid) to authenticated;
