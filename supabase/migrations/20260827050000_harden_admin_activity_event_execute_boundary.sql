-- Repair: admin activity-event listing must never be callable by anon.
-- The authenticated grant remains intact for owner/admin authorization inside the function.
revoke execute on function public.admin_list_activity_events(integer) from anon;
grant execute on function public.admin_list_activity_events(integer) to authenticated;
