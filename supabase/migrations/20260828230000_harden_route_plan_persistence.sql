create or replace function public.create_route_plan(p_name text, p_start_lat double precision, p_start_lng double precision, p_end_lat double precision, p_end_lng double precision, p_distance_miles numeric, p_estimated_minutes integer) returns uuid language plpgsql security definer set search_path to 'public','auth','extensions','pg_temp' as $function$
declare rid uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if p_start_lat is null or p_start_lng is null or p_end_lat is null or p_end_lng is null then raise exception 'route coordinates are required'; end if;
  if p_start_lat not between -90 and 90 or p_end_lat not between -90 and 90 or p_start_lng not between -180 and 180 or p_end_lng not between -180 and 180 then raise exception 'route coordinates are invalid'; end if;
  if p_distance_miles is null or p_distance_miles < 0 or p_estimated_minutes is null or p_estimated_minutes < 0 then raise exception 'route metrics are invalid'; end if;
  insert into public.route_plans(user_id,name,start_lat,start_lng,end_lat,end_lng,distance_miles,estimated_minutes)
    values(auth.uid(),coalesce(nullif(trim(p_name),''),'My route'),p_start_lat,p_start_lng,p_end_lat,p_end_lng,p_distance_miles,p_estimated_minutes)
    returning id into rid;
  insert into public.route_events(route_id,user_id,event_type,points_awarded,metadata)
    values(rid,auth.uid(),'started',0,jsonb_build_object('source','create_route_plan'));
  return rid;
end $function$;

create or replace function public.complete_route(p_route_id uuid) returns jsonb language plpgsql security definer set search_path to 'public','auth','extensions','pg_temp' as $function$
declare r public.route_plans; pts integer;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select * into r from public.route_plans where id=p_route_id and user_id=auth.uid() for update;
  if not found then raise exception 'route not found'; end if;
  if r.status='completed' then return jsonb_build_object('route_id',r.id,'points',r.points_earned,'already_completed',true); end if;
  if r.status <> 'active' then raise exception 'route is not completable from its current state'; end if;
  pts:=greatest(10,least(250,round(coalesce(r.distance_miles,0)*10)::integer + coalesce(r.stops_count,0)*15));
  update public.route_plans set status='completed',points_earned=pts,completed_at=now(),updated_at=now() where id=r.id;
  insert into public.route_events(route_id,user_id,event_type,points_awarded,metadata) values(r.id,auth.uid(),'route_completed',pts,jsonb_build_object('distance_miles',r.distance_miles,'stops_count',r.stops_count));
  return jsonb_build_object('route_id',r.id,'points',pts,'already_completed',false);
end $function$;
