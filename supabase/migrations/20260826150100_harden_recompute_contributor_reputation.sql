create or replace function public.recompute_contributor_reputation(p_user_id uuid)
returns public.contributor_reputation
language plpgsql
security definer
set search_path=public,auth,extensions,pg_catalog
as $$
declare r public.contributor_reputation;
begin
  if auth.uid() is null and current_user <> 'service_role' then raise exception 'Authentication required'; end if;
  if current_user <> 'service_role' and p_user_id is distinct from auth.uid() then raise exception 'User identity mismatch'; end if;
  if p_user_id is null then return null; end if;
  insert into public.contributor_reputation(user_id) values(p_user_id) on conflict(user_id) do nothing;
  update public.contributor_reputation cr
  set observations_count=(select count(*) from public.restroom_observations ro where ro.user_id=p_user_id),
      verified_checkins_count=(select count(*) from public.check_ins ci where ci.user_id=p_user_id and coalesce(ci.verified,true)=true),
      positive_observations_count=(select count(*) from public.restroom_observations ro where ro.user_id=p_user_id and ro.observation_type in ('clean','supplies_stocked','open')),
      negative_observations_count=(select count(*) from public.restroom_observations ro where ro.user_id=p_user_id and ro.observation_type in ('needs_cleaning','supplies_low','closed_unavailable')),
      last_activity_at=greatest((select max(ro.created_at) from public.restroom_observations ro where ro.user_id=p_user_id),(select max(ci.created_at) from public.check_ins ci where ci.user_id=p_user_id)),
      updated_at=now()
  where cr.user_id=p_user_id;
  select * into r from public.contributor_reputation where user_id=p_user_id;
  return r;
end;
$$;
