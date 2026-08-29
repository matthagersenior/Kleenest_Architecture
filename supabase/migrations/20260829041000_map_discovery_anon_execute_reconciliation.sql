-- Canonical map/location discovery is intentionally public-read through the
-- PostgREST anon role. Both RPCs return discovery metadata only; mutations remain
-- protected by their own authorization boundaries.
grant execute on function public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[]) to anon;
grant execute on function public.prepare_universal_location_discovery(double precision,double precision,integer,uuid,text,text,integer) to anon;
