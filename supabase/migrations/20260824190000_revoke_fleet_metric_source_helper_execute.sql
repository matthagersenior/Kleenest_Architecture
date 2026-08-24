-- The allowlist helper is an internal implementation detail used by
-- authoritative Fleet metric contracts. It is not a client capability.
revoke execute on function public.fleet_metric_source_allowed(text,text) from authenticated;
