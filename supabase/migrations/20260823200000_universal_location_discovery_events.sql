create table if not exists public.location_discovery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  latitude double precision not null,
  longitude double precision not null,
  radius_km numeric not null default 8,
  sources text[] not null default '{}',
  discovered_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists location_discovery_events_created_idx on public.location_discovery_events(created_at desc);
create index if not exists location_discovery_events_user_idx on public.location_discovery_events(user_id,created_at desc);

alter table public.location_discovery_events enable row level security;

create or replace function public.record_location_discovery_event(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_km numeric default 8,
  p_sources text[] default '{}',
  p_discovered_count integer default 0
) returns uuid
language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_id uuid;
begin
  if p_latitude is null or p_longitude is null then raise exception 'latitude and longitude are required'; end if;
  insert into public.location_discovery_events(user_id,latitude,longitude,radius_km,sources,discovered_count)
  values(auth.uid(),p_latitude,p_longitude,least(greatest(coalesce(p_radius_km,8),1),50),coalesce(p_sources,'{}'),greatest(coalesce(p_discovered_count,0),0))
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.record_location_discovery_event(double precision,double precision,numeric,text[],integer) to authenticated;

create policy location_discovery_events_insert_own on public.location_discovery_events for insert to authenticated with check (user_id = auth.uid());
create policy location_discovery_events_select_own on public.location_discovery_events for select to authenticated using (user_id = auth.uid());
