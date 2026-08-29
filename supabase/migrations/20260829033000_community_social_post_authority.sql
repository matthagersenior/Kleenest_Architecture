-- Community social-post authority
-- Client publication is authenticated and server-owned; the client never writes
-- social_posts directly.

create or replace function public.create_social_post(
  p_content text,
  p_kind text default 'post',
  p_location_id uuid default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public','auth','extensions','pg_temp'
as $function$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_content text := trim(coalesce(p_content,''));
  v_kind text := lower(trim(coalesce(p_kind,'post')));
begin
  if v_user is null then raise exception 'authentication required'; end if;
  if v_content='' then raise exception 'post content cannot be empty'; end if;
  if length(v_content)>1000 then raise exception 'post content must be 1000 characters or fewer'; end if;
  if v_kind not in ('post','tip','discovery','verification','update') then raise exception 'unsupported post kind'; end if;
  if p_location_id is not null and not exists(select 1 from public.locations where id=p_location_id and is_active=true) then
    raise exception 'location is not an active canonical location';
  end if;

  insert into public.social_posts(user_id,content,kind,location_id)
  values(v_user,v_content,v_kind,p_location_id)
  returning id into v_id;

  return jsonb_build_object('id',v_id,'user_id',v_user,'content',v_content,'kind',v_kind,'location_id',p_location_id,'created_at',now(),'published',true);
end $function$;

grant execute on function public.create_social_post(text,text,uuid) to authenticated;
revoke execute on function public.create_social_post(text,text,uuid) from anon;
