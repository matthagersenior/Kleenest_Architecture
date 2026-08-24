begin;

revoke execute on function public.create_offline_pack(text,text,uuid,uuid,double precision,double precision,double precision,double precision,integer) from anon;
revoke execute on function public.queue_offline_pack_event(uuid,text,jsonb,text) from anon;

create or replace function public.create_offline_pack(
  p_pack_type text,
  p_name text default null,
  p_business_id uuid default null,
  p_route_discovery_session_id uuid default null,
  p_west double precision default null,
  p_south double precision default null,
  p_east double precision default null,
  p_north double precision default null,
  p_expires_hours integer default 24
)
returns public.offline_packs
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_pack public.offline_packs;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_business_id is not null and not exists (
    select 1 from public.app_business_memberships m
    where m.business_id = p_business_id and m.user_id = v_user
  ) then raise exception 'Business offline pack access denied'; end if;
  if p_route_discovery_session_id is not null and not exists (
    select 1 from public.route_discovery_sessions r
    where r.id = p_route_discovery_session_id and r.user_id = v_user
  ) then raise exception 'Route offline pack access denied'; end if;
  insert into public.offline_packs(user_id,pack_type,name,business_id,route_discovery_session_id,west,south,east,north,status,expires_at)
  values(v_user,p_pack_type,p_name,p_business_id,p_route_discovery_session_id,p_west,p_south,p_east,p_north,'preparing',now()+make_interval(hours=>greatest(1,p_expires_hours)))
  returning * into v_pack;
  insert into public.offline_pack_locations(pack_id,location_id,snapshot)
  select v_pack.id,l.id,jsonb_build_object('id',l.id,'name',l.name,'latitude',l.latitude,'longitude',l.longitude,'category',l.category,'address',l.address,'amenities',l.amenities,'is_verified',l.is_verified,'bathroom_verification_status',l.bathroom_verification_status)
  from public.locations l
  where (p_route_discovery_session_id is not null and exists(select 1 from public.route_discovery_locations r where r.session_id=p_route_discovery_session_id and r.location_id=l.id))
     or (p_west is not null and l.longitude between p_west and p_east and l.latitude between p_south and p_north);
  if p_business_id is not null then
    insert into public.offline_pack_businesses(pack_id,business_id,snapshot)
    select v_pack.id,b.id,to_jsonb(b) from public.businesses b where b.id=p_business_id on conflict do nothing;
  end if;
  update public.offline_packs set status='ready',updated_at=now() where id=v_pack.id returning * into v_pack;
  return v_pack;
end;
$$;

grant execute on function public.create_offline_pack(text,text,uuid,uuid,double precision,double precision,double precision,double precision,integer) to authenticated;
grant execute on function public.queue_offline_pack_event(uuid,text,jsonb,text) to authenticated;

commit;
