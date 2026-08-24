begin;

alter table if exists public.offline_pack_events
  add column if not exists actor_id uuid,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists sync_error text;

create unique index if not exists offline_pack_events_client_event_id_uidx
  on public.offline_pack_events(client_event_id)
  where client_event_id is not null;

create index if not exists offline_pack_events_actor_id_idx
  on public.offline_pack_events(actor_id);

create index if not exists offline_pack_events_pack_pending_idx
  on public.offline_pack_events(pack_id, synced_at)
  where synced_at is null;

update public.offline_pack_events
set actor_id = coalesce(actor_id, u.id)
from public.offline_packs p
join auth.users u on u.id = p.created_by
where offline_pack_events.pack_id = p.id
  and offline_pack_events.actor_id is null;

create or replace function public.queue_offline_pack_event(
  p_pack_id uuid,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb,
  p_client_event_id uuid default gen_random_uuid()
)
returns public.offline_pack_events
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare v_row public.offline_pack_events;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists (
    select 1 from public.offline_packs p
    where p.id = p_pack_id
      and p.created_by = auth.uid()
      and coalesce(p.expires_at, now()) > now()
  ) then raise exception 'offline pack access denied'; end if;

  insert into public.offline_pack_events(id,pack_id,event_type,payload,client_event_id,created_at,actor_id)
  values(gen_random_uuid(),p_pack_id,p_event_type,coalesce(p_payload,'{}'::jsonb),p_client_event_id,now(),auth.uid())
  on conflict (client_event_id) do update
    set payload = excluded.payload
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.queue_offline_pack_event(uuid,text,jsonb,uuid) to authenticated;

commit;
