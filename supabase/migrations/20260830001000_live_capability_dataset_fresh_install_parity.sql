-- Fresh-install parity for capability datasets that exist in production but were
-- historically created outside the repository migration chain. Production already
-- contains these tables; CREATE TABLE IF NOT EXISTS keeps this migration additive.

create table if not exists public.place_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.location_discovery_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_m double precision default 0,
  radius_m integer not null default 10000,
  membership_type text not null default 'consumer',
  discovered_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.location_observation_votes (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.location_quality_observations(id) on delete cascade,
  user_id uuid not null,
  vote text not null check (vote in ('helpful','not_helpful')),
  created_at timestamptz not null default now(),
  unique(observation_id,user_id)
);

create table if not exists public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete set null,
  points integer not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.network_leaderboard_sources (
  id uuid primary key default gen_random_uuid(),
  leaderboard_key text not null unique,
  display_name text not null,
  description text,
  scope text not null default 'platform' check (scope in ('platform','consumer','business','fleet','enterprise','contributor','location')),
  metric_key text not null,
  rewardable boolean not null default true,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.network_leaderboard_participation (
  id uuid primary key default gen_random_uuid(),
  leaderboard_key text not null references public.network_leaderboard_sources(leaderboard_key) on delete cascade,
  actor_id uuid,
  actor_type text not null default 'user' check (actor_type in ('user','business','fleet','enterprise','location','contributor')),
  metric_value numeric not null default 0,
  source_event text not null,
  source_id uuid,
  period_start date,
  period_end date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard_rewards (
  id uuid primary key default gen_random_uuid(),
  leaderboard_key text not null,
  rank_from integer not null default 1,
  rank_to integer not null default 1,
  reward_type text not null,
  reward_value jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (rank_from >= 1 and rank_to >= rank_from)
);

create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  monthly_price_cents integer not null default 0,
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  consumer_or_business text
);

create table if not exists public.family_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null default 'family',
  max_members integer not null default 5 check (max_members between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.family_groups(id) on delete cascade,
  invited_email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  intelligence boolean not null default true,
  rewards boolean not null default true,
  community boolean not null default true,
  push boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.reporting_schedules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('business','fleet','enterprise','admin')),
  scope_id uuid,
  name text not null,
  cadence text not null check (cadence in ('daily','weekly','monthly')),
  day_of_week smallint,
  day_of_month smallint,
  hour_local smallint not null default 8 check (hour_local between 0 and 23),
  timezone text not null default 'America/Chicago',
  metrics jsonb not null default '[]'::jsonb,
  recipients jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reporting_runs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.reporting_schedules(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','sent','failed')),
  period_start timestamptz,
  period_end timestamptz,
  report_payload jsonb not null default '{}'::jsonb,
  delivered_to jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.place_categories enable row level security;
alter table public.location_discovery_sessions enable row level security;
alter table public.location_observation_votes enable row level security;
alter table public.reward_transactions enable row level security;
alter table public.network_leaderboard_sources enable row level security;
alter table public.network_leaderboard_participation enable row level security;
alter table public.leaderboard_rewards enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.family_accounts enable row level security;
alter table public.family_invites enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.reporting_schedules enable row level security;
alter table public.reporting_runs enable row level security;

-- Reproduce the live read/ownership policy intent on fresh installs. Policy creation
-- is guarded so this migration can also be safely evaluated against an existing DB.
do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='place_categories' and policyname='public can read active place categories') then
    create policy "public can read active place categories" on public.place_categories for select to anon, authenticated using (true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='location_discovery_sessions' and policyname='discovery_sessions_own_read') then
    create policy discovery_sessions_own_read on public.location_discovery_sessions for select to authenticated using (user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='location_discovery_sessions' and policyname='discovery_sessions_own_insert') then
    create policy discovery_sessions_own_insert on public.location_discovery_sessions for insert to authenticated with check (user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='location_observation_votes' and policyname='location_observation_votes_own') then
    create policy location_observation_votes_own on public.location_observation_votes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='reward_transactions' and policyname='reward_transactions_select_own') then
    create policy reward_transactions_select_own on public.reward_transactions for select to authenticated using (user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='network_leaderboard_sources' and policyname='network_leaderboard_sources_public_read') then
    create policy network_leaderboard_sources_public_read on public.network_leaderboard_sources for select to anon, authenticated using (active=true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='network_leaderboard_participation' and policyname='network_leaderboard_participation_actor_or_admin_read') then
    create policy network_leaderboard_participation_actor_or_admin_read on public.network_leaderboard_participation for select to authenticated using (actor_id=auth.uid() or public.is_platform_owner(auth.uid()));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='leaderboard_rewards' and policyname='leaderboard_rewards_authenticated_read') then
    create policy leaderboard_rewards_authenticated_read on public.leaderboard_rewards for select to authenticated using (true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='pricing_plans' and policyname='kleenest_pricing_plans_public_read') then
    create policy kleenest_pricing_plans_public_read on public.pricing_plans for select to anon, authenticated using (active=true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='family_accounts' and policyname='kleenest_family_accounts_owner') then
    create policy kleenest_family_accounts_owner on public.family_accounts for select to authenticated using (owner_user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='family_invites' and policyname='kleenest_family_invites_sender') then
    create policy kleenest_family_invites_sender on public.family_invites for select to authenticated using (invited_by=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='notification_preferences' and policyname='notification_preferences_own_all') then
    create policy notification_preferences_own_all on public.notification_preferences for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='reporting_schedules' and policyname='reporting_schedules_scoped_select') then
    create policy reporting_schedules_scoped_select on public.reporting_schedules for select to authenticated using (
      owner_id=auth.uid() or public.is_platform_owner(auth.uid()) or (scope_type='business' and exists(select 1 from public.business_members bm where bm.business_id=scope_id and bm.user_id=auth.uid()))
    );
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='reporting_runs' and policyname='reporting_runs_scoped_select') then
    create policy reporting_runs_scoped_select on public.reporting_runs for select to authenticated using (
      exists(select 1 from public.reporting_schedules s where s.id=schedule_id and (s.owner_id=auth.uid() or public.is_platform_owner(auth.uid()) or exists(select 1 from public.business_members bm where bm.business_id=s.scope_id and bm.user_id=auth.uid())))
    );
  end if;
end $$;

grant select on public.place_categories to anon, authenticated;
grant select on public.network_leaderboard_sources to anon, authenticated;
grant select on public.pricing_plans to anon, authenticated;
grant select, insert on public.location_discovery_sessions to authenticated;
grant select, insert, update, delete on public.location_observation_votes to authenticated;
grant select on public.reward_transactions to authenticated;
grant select on public.network_leaderboard_participation to authenticated;
grant select on public.leaderboard_rewards to authenticated;
grant select on public.family_accounts to authenticated;
grant select on public.family_invites to authenticated;
grant select, insert, update, delete on public.notification_preferences to authenticated;
grant select on public.reporting_schedules to authenticated;
grant select on public.reporting_runs to authenticated;
