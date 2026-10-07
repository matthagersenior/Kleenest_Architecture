-- Record the transient privilege reconciliation that was applied before the
-- canonical public boundary was re-confirmed. The following migration immediately
-- restores the intended final state by revoking these v1 grants.
revoke execute on function public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[]) from public;
grant execute on function public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[]) to anon, authenticated;
notify pgrst, 'reload schema';
