-- Repair: admin activity-event listing must never be callable by anon.
-- Revoke from PUBLIC because anon inherits PUBLIC execute privileges.
-- Keep authenticated access so the function's owner/admin authorization remains authoritative.
revoke execute on function public.admin_list_activity_events(integer) from public;
revoke execute on function public.admin_list_activity_events(integer) from anon;
grant execute on function public.admin_list_activity_events(integer) to authenticated;
