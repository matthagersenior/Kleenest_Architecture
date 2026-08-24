create table if not exists public.fleet_operational_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists fleet_operational_events_business_created_idx on public.fleet_operational_events(business_id,created_at desc);
create index if not exists fleet_operational_events_type_created_idx on public.fleet_operational_events(event_type,created_at desc);
alter table public.fleet_operational_events enable row level security;
create or replace function public.record_fleet_operational_event(p_business_id uuid,p_event_type text,p_payload jsonb default '{}'::jsonb)
returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_id uuid;
begin
 if p_business_id is null or nullif(trim(p_event_type),'') is null then raise exception 'business_id and event_type are required'; end if;
 insert into public.fleet_operational_events(business_id,actor_id,event_type,payload) values(p_business_id,auth.uid(),trim(p_event_type),coalesce(p_payload,'{}'::jsonb)) returning id into v_id;
 return v_id;
end; $$;
grant execute on function public.record_fleet_operational_event(uuid,text,jsonb) to authenticated;
create policy fleet_operational_events_insert_access on public.fleet_operational_events for insert to authenticated with check (actor_id=auth.uid());
create policy fleet_operational_events_select_access on public.fleet_operational_events for select to authenticated using (actor_id=auth.uid() or exists (select 1 from public.business_memberships bm where bm.business_id=fleet_operational_events.business_id and bm.user_id=auth.uid()));
