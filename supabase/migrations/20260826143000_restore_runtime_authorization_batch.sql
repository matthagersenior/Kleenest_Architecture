-- Restore the authenticated runtime grants reconciled in production.
-- Owner/business/Fleet authorization remains inside SECURITY DEFINER functions.

grant execute on function public.fleet_actor_is_manager(uuid) to authenticated;
grant execute on function public.fleet_metric_source_allowed(text,text) to authenticated;
grant execute on function public.business_can_manage(uuid) to authenticated;
grant execute on function public.business_admin_guard(uuid) to authenticated;
grant execute on function public.business_admin_allowed(uuid) to authenticated;
grant execute on function public.business_advanced_allowed(uuid) to authenticated;
grant execute on function public.business_management_context(uuid) to authenticated;
grant execute on function public.business_campaign_detail(uuid,timestamptz,timestamptz) to authenticated;
grant execute on function public.business_event_detail(uuid,timestamptz,timestamptz) to authenticated;
grant execute on function public.business_location_detail(uuid,timestamptz,timestamptz) to authenticated;
grant execute on function public.business_media_detail(uuid,timestamptz,timestamptz) to authenticated;
grant execute on function public.business_partner_detail(uuid,timestamptz,timestamptz) to authenticated;
grant execute on function public.is_platform_owner_session() to authenticated;

revoke execute on function public.fleet_actor_is_manager(uuid) from anon;
revoke execute on function public.fleet_metric_source_allowed(text,text) from anon;
revoke execute on function public.business_can_manage(uuid) from anon;
revoke execute on function public.business_admin_guard(uuid) from anon;
revoke execute on function public.business_admin_allowed(uuid) from anon;
revoke execute on function public.business_advanced_allowed(uuid) from anon;
revoke execute on function public.business_management_context(uuid) from anon;
revoke execute on function public.business_campaign_detail(uuid,timestamptz,timestamptz) from anon;
revoke execute on function public.business_event_detail(uuid,timestamptz,timestamptz) from anon;
revoke execute on function public.business_location_detail(uuid,timestamptz,timestamptz) from anon;
revoke execute on function public.business_media_detail(uuid,timestamptz,timestamptz) from anon;
revoke execute on function public.business_partner_detail(uuid,timestamptz,timestamptz) from anon;
revoke execute on function public.is_platform_owner_session() from anon;
