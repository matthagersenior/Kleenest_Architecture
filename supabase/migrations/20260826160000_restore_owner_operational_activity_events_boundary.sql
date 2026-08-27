-- Restore the owner-only activity-events execution boundary in repository history.
-- The gateway remains the canonical CRUD boundary; this migration only restores
-- its authenticated execution grant and documents the activity_events resource.
revoke execute on function public.admin_crud_gateway(text,text,uuid,jsonb) from anon;
grant execute on function public.admin_crud_gateway(text,text,uuid,jsonb) to authenticated;

-- Explicit owner read boundary used by the Owner audit surface.
revoke execute on function public.admin_list_activity_events(integer) from anon;
grant execute on function public.admin_list_activity_events(integer) to authenticated;
