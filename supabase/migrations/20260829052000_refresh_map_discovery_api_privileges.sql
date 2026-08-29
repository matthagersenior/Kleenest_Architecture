-- Refresh the canonical public map-discovery execute boundary after privilege/schema-cache
-- reconciliation. The function is read-only discovery; mutations remain authenticated.
revoke execute on function public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[]) from public;
grant execute on function public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[]) to anon, authenticated;

-- Force PostgREST to observe the current function privilege contract immediately.
notify pgrst, 'reload schema';
