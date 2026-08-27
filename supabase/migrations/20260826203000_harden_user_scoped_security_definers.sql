-- Harden user-scoped SECURITY DEFINER functions against cross-user access.
revoke execute on function public.recompute_contributor_reputation(uuid) from anon, authenticated;
revoke execute on function public.consumer_evidence_loop_health(uuid) from anon;

grant execute on function public.consumer_evidence_loop_health(uuid) to authenticated, service_role;
grant execute on function public.recompute_contributor_reputation(uuid) to service_role;
