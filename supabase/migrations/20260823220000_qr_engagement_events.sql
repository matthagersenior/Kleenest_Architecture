create table if not exists public.qr_engagement_events(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete set null,event_type text not null,payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index if not exists qr_engagement_events_created_idx on public.qr_engagement_events(created_at desc);
create index if not exists qr_engagement_events_user_idx on public.qr_engagement_events(user_id,created_at desc);
alter table public.qr_engagement_events enable row level security;
create or replace function public.record_qr_engagement_event(p_event_type text,p_payload jsonb default '{}'::jsonb) returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$ declare v_id uuid; begin if nullif(trim(p_event_type),'') is null then raise exception 'event_type is required'; end if; insert into public.qr_engagement_events(user_id,event_type,payload) values(auth.uid(),trim(p_event_type),coalesce(p_payload,'{}'::jsonb)) returning id into v_id; return v_id; end; $$;
grant execute on function public.record_qr_engagement_event(text,jsonb) to authenticated;
create policy qr_engagement_events_insert_own on public.qr_engagement_events for insert to authenticated with check(user_id=auth.uid());
create policy qr_engagement_events_select_own on public.qr_engagement_events for select to authenticated using(user_id=auth.uid());
