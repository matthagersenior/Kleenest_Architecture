-- Keep the public map path fast at current production scale.
-- The compatibility "places" view expands back into locations; joining it from the
-- strict nearby function made a bounded map query scan the location relation twice.
-- Read the tiny override table directly, preserve the same output contract, and only
-- aggregate amenities/fixtures for the ranked result set.
undefined;

-- v1 is an internal invoker/helper boundary. Anonymous/authenticated callers use the
-- SECURITY DEFINER v2 wrapper; retain the least-privilege final state.
revoke execute on function public.map_network_nearby_v1(double precision,double precision,integer,integer,text,text,text[]) from anon, authenticated;
notify pgrst, 'reload schema';
