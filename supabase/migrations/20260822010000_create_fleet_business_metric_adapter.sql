-- Fleet Business Metric Adapter
-- Architecture-only migration. Do not apply directly to Production until reviewed.
-- Purpose: add controller-authored configuration over existing Fleet measurements.
-- This is NOT a new metrics engine: it stores definitions/assignments and delegates
-- measurement/scoring inputs to existing Fleet datasets and shared primitives.

create table if not exists public.fleet_metric_definitions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  metric_key text not null,
  feature_code text not null,
  name text not null,
  description text,
  unit text,
  source_dataset text not null,
  source_metric text not null,
  aggregation text not null default 'avg',
  direction text not null default 'higher_is_better',
  scoring_method text not null default 'threshold',
  goal numeric,
  threshold numeric,
  max_score numeric not null default 100,
  scoring_config jsonb not null default '{}'::jsonb,
  period text not null default 'week',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fleet_metric_definitions_aggregation_ck check (aggregation in ('sum','avg','min','max','count','rate','latest')),
  constraint fleet_metric_definitions_direction_ck check (direction in ('higher_is_better','lower_is_better')),
  constraint fleet_metric_definitions_scoring_method_ck check (scoring_method in ('threshold','linear','binary','banded')),
  constraint fleet_metric_definitions_period_ck check (period in ('day','week','month','quarter','custom')),
  constraint fleet_metric_definitions_max_score_ck check (max_score >= 0),
  constraint fleet_metric_definitions_scoring_config_object_ck check (jsonb_typeof(scoring_config) = 'object'),
  constraint fleet_metric_definitions_name_ck check (length(trim(name)) > 0),
  constraint fleet_metric_definitions_source_ck check (length(trim(source_dataset)) > 0 and length(trim(source_metric)) > 0)
);

create index if not exists fleet_metric_definitions_business_idx
  on public.fleet_metric_definitions(business_id, active, updated_at desc);

create index if not exists fleet_metric_definitions_metric_idx
  on public.fleet_metric_definitions(business_id, metric_key);

create table if not exists public.fleet_metric_assignments (
  id uuid primary key default gen_random_uuid(),
  metric_definition_id uuid not null references public.fleet_metric_definitions(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  target_type text not null,
  target_id uuid,
  assigned_by uuid not null references auth.users(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fleet_metric_assignments_target_type_ck check (target_type in ('fleet','team','driver','vehicle','route')),
  constraint fleet_metric_assignments_target_ck check ((target_type = 'fleet' and target_id is null) or (target_type <> 'fleet' and target_id is not null))
);

create index if not exists fleet_metric_assignments_definition_idx
  on public.fleet_metric_assignments(metric_definition_id, active);

create index if not exists fleet_metric_assignments_target_idx
  on public.fleet_metric_assignments(business_id, target_type, target_id, active);

alter table public.fleet_metric_definitions enable row level security;
alter table public.fleet_metric_assignments enable row level security;

revoke all on public.fleet_metric_definitions from anon;
revoke all on public.fleet_metric_assignments from anon;
revoke all on public.fleet_metric_definitions from authenticated;
revoke all on public.fleet_metric_assignments from authenticated;

do $$
begin
  if not exists (select 1 from pg_proc where proname = 'fleet_metric_controller_authorized' and pg_get_function_identity_arguments(oid) = 'uuid') then
    execute $fn$
      create function public.fleet_metric_controller_authorized(p_business_id uuid)
      returns boolean
      language sql
      stable
      security definer
      set search_path = public, pg_catalog
      as $body$
        select exists (
          select 1
          from public.business_members bm
          where bm.business_id = p_business_id
            and bm.user_id = (select auth.uid())
            and lower(bm.role::text) in ('owner','admin','manager')
        ) and public.has_fleet_access(p_business_id);
      $body$;
    $fn$;
  end if;
end $$;

revoke all on function public.fleet_metric_controller_authorized(uuid) from public, anon;
grant execute on function public.fleet_metric_controller_authorized(uuid) to authenticated;

create or replace function public.create_fleet_metric_definition(
  p_business_id uuid,
  p_metric_key text,
  p_feature_code text,
  p_name text,
  p_description text default null,
  p_unit text default null,
  p_source_dataset text default null,
  p_source_metric text default null,
  p_aggregation text default 'avg',
  p_direction text default 'higher_is_better',
  p_scoring_method text default 'threshold',
  p_goal numeric default null,
  p_threshold numeric default null,
  p_max_score numeric default 100,
  p_scoring_config jsonb default '{}'::jsonb,
  p_period text default 'week'
)
returns public.fleet_metric_definitions
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.fleet_metric_definitions;
  v_feature public.feature_catalog;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if not public.fleet_metric_controller_authorized(p_business_id) then
    raise exception 'Fleet controller authorization required';
  end if;

  select * into v_feature
  from public.feature_catalog
  where feature_code = trim(p_feature_code)
    and enabled = true;

  if not found then
    raise exception 'Fleet feature is unavailable: %', p_feature_code;
  end if;

  if lower(coalesce(v_feature.category,'')) <> 'fleet' and trim(p_feature_code) not like 'fleet_%' then
    raise exception 'Feature is not a Fleet capability: %', p_feature_code;
  end if;

  insert into public.fleet_metric_definitions (
    business_id, created_by, metric_key, feature_code, name, description, unit,
    source_dataset, source_metric, aggregation, direction, scoring_method,
    goal, threshold, max_score, scoring_config, period
  ) values (
    p_business_id, (select auth.uid()), trim(p_metric_key), trim(p_feature_code), trim(p_name),
    p_description, p_unit, trim(p_source_dataset), trim(p_source_metric), lower(trim(p_aggregation)),
    lower(trim(p_direction)), lower(trim(p_scoring_method)), p_goal, p_threshold,
    p_max_score, coalesce(p_scoring_config, '{}'::jsonb), lower(trim(p_period))
  ) returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.update_fleet_metric_definition(
  p_metric_definition_id uuid,
  p_name text default null,
  p_description text default null,
  p_goal numeric default null,
  p_threshold numeric default null,
  p_max_score numeric default null,
  p_scoring_method text default null,
  p_scoring_config jsonb default null,
  p_period text default null,
  p_active boolean default null
)
returns public.fleet_metric_definitions
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.fleet_metric_definitions;
  v_business_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;

  select business_id into v_business_id
  from public.fleet_metric_definitions
  where id = p_metric_definition_id;

  if v_business_id is null then raise exception 'Fleet metric definition not found'; end if;
  if not public.fleet_metric_controller_authorized(v_business_id) then
    raise exception 'Fleet controller authorization required';
  end if;

  update public.fleet_metric_definitions
  set name = coalesce(nullif(trim(p_name),''), name),
      description = coalesce(p_description, description),
      goal = case when p_goal is null then goal else p_goal end,
      threshold = case when p_threshold is null then threshold else p_threshold end,
      max_score = coalesce(p_max_score, max_score),
      scoring_method = coalesce(lower(trim(p_scoring_method)), scoring_method),
      scoring_config = coalesce(p_scoring_config, scoring_config),
      period = coalesce(lower(trim(p_period)), period),
      active = coalesce(p_active, active),
      updated_at = now()
  where id = p_metric_definition_id
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.assign_fleet_metric(
  p_metric_definition_id uuid,
  p_target_type text,
  p_target_id uuid default null
)
returns public.fleet_metric_assignments
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_definition public.fleet_metric_definitions;
  v_row public.fleet_metric_assignments;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;

  select * into v_definition
  from public.fleet_metric_definitions
  where id = p_metric_definition_id;

  if not found then raise exception 'Fleet metric definition not found'; end if;
  if not public.fleet_metric_controller_authorized(v_definition.business_id) then
    raise exception 'Fleet controller authorization required';
  end if;

  if lower(trim(p_target_type)) not in ('fleet','team','driver','vehicle','route') then
    raise exception 'Invalid Fleet metric target type';
  end if;
  if lower(trim(p_target_type)) = 'fleet' and p_target_id is not null then
    raise exception 'Fleet target does not accept target_id';
  end if;
  if lower(trim(p_target_type)) <> 'fleet' and p_target_id is null then
    raise exception 'Target id required for %', p_target_type;
  end if;

  insert into public.fleet_metric_assignments (
    metric_definition_id, business_id, target_type, target_id, assigned_by
  ) values (
    p_metric_definition_id, v_definition.business_id, lower(trim(p_target_type)), p_target_id, (select auth.uid())
  ) returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.get_fleet_metric_configuration(p_business_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_defs jsonb;
  v_assignments jsonb;
begin
  if not public.has_fleet_access(p_business_id) then
    raise exception 'Fleet access required';
  end if;

  select coalesce(jsonb_agg(to_jsonb(d) order by d.created_at), '[]'::jsonb)
    into v_defs
  from public.fleet_metric_definitions d
  where d.business_id = p_business_id;

  select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at), '[]'::jsonb)
    into v_assignments
  from public.fleet_metric_assignments a
  where a.business_id = p_business_id;

  return jsonb_build_object(
    'business_id', p_business_id,
    'definitions', v_defs,
    'assignments', v_assignments
  );
end;
$$;

revoke all on function public.create_fleet_metric_definition(uuid,text,text,text,text,text,text,text,text,text,text,numeric,numeric,numeric,jsonb,text) from public, anon;
revoke all on function public.update_fleet_metric_definition(uuid,text,text,numeric,numeric,numeric,text,jsonb,text,boolean) from public, anon;
revoke all on function public.assign_fleet_metric(uuid,text,uuid) from public, anon;
revoke all on function public.get_fleet_metric_configuration(uuid) from public, anon;

grant execute on function public.create_fleet_metric_definition(uuid,text,text,text,text,text,text,text,text,text,text,numeric,numeric,numeric,jsonb,text) to authenticated;
grant execute on function public.update_fleet_metric_definition(uuid,text,text,numeric,numeric,numeric,text,jsonb,text,boolean) to authenticated;
grant execute on function public.assign_fleet_metric(uuid,text,uuid) to authenticated;
grant execute on function public.get_fleet_metric_configuration(uuid) to authenticated;

comment on table public.fleet_metric_definitions is 'Controller-authored Fleet metric configuration over existing measurement sources. Not a calculation engine.';
comment on table public.fleet_metric_assignments is 'Assignments of Fleet metric definitions to fleet/team/driver/vehicle/route scopes.';
