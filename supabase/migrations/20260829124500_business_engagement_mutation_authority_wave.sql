-- Business engagement authority wave.
-- Contest management is an authenticated business mutation.
revoke execute on function public.business_manage_contest(uuid,uuid,text,jsonb) from anon;
grant execute on function public.business_manage_contest(uuid,uuid,text,jsonb) to authenticated;

-- Internal convergence/telemetry routines must never be client-callable.
revoke execute on function public.converge_fleet_operational_event_to_intelligence() from anon, authenticated;
revoke execute on function public.record_location_filter_event(jsonb,integer,jsonb,double precision,double precision,integer,text) from anon, authenticated;
