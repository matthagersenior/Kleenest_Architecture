-- Store-readiness security baseline.
-- Canonical public consumer data is exposed through controlled RPC/view surfaces;
-- governance, audit and raw intelligence tables are not direct client APIs.

alter table public.capability_domain_contracts enable row level security;
alter table public.capability_function_classifications enable row level security;
alter table public.capability_retirement_log enable row level security;
alter table public.contributor_reputation_consistency_audit enable row level security;
alter table public.location_bathroom_intelligence enable row level security;

revoke all on public.capability_domain_contracts from anon, authenticated;
revoke all on public.capability_function_classifications from anon, authenticated;
revoke all on public.capability_retirement_log from anon, authenticated;
revoke all on public.contributor_reputation_consistency_audit from anon, authenticated;
revoke all on public.location_bathroom_intelligence from anon, authenticated;

-- Keep the retirement trigger on a catalog-only search path.
-- This function is invoked by database triggers, not directly by clients.
create or replace function public.capability_retirement_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.capability_retirement_log(capability_key, retired_at, reason)
  values (coalesce(new.capability_key, old.capability_key), now(), 'capability retirement audit');
  return coalesce(new, old);
end;
$$;
