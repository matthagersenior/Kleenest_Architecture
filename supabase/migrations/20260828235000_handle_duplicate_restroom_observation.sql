-- Treat a repeated identical qualifying restroom observation as an idempotent request.
-- The database uniqueness guard remains authoritative; this makes the RPC return
-- a non-awarding result instead of surfacing a false failure to the client.

create or replace function public.submit_restroom_observation(
  p_location_id uuid,
  p_check_in_id uuid,
  p_observation_type text,
  p_cleanliness_pct numeric default null,
  p_note text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public','auth','extensions','pg_temp'
as $$
declare
  v_user uuid := auth.uid();
  v_existing public.restroom_observations;
  v_note text := nullif(trim(p_note),'');
begin
  if v_user is null then raise exception 'Sign in to contribute an observation.'; end if;
  if p_check_in_id is not null then
    select * into v_existing
      from public.restroom_observations
     where user_id=v_user
       and location_id=p_location_id
       and check_in_id=p_check_in_id
       and observation_type=p_observation_type
       and coalesce(cleanliness_pct,-1)=coalesce(p_cleanliness_pct,-1)
       and coalesce(note,'')=coalesce(v_note,'')
     order by created_at desc
     limit 1;
    if found then
      return jsonb_build_object(
        'observation_id',v_existing.id,
        'verification_count',(select count(*) from public.restroom_observations where location_id=p_location_id and created_at>=now()-interval '30 days'),
        'confidence',v_existing.confidence,
        'location_id',p_location_id,
        'check_in_id',p_check_in_id,
        'provenance',v_existing.source,
        'progression_eligible',false,
        'progression_awarded',0,
        'progression_event_id',null,
        'duplicate',true,
        'server_authoritative',true
      );
    end if;
  end if;
  raise exception 'RESTROOM_OBSERVATION_CONTRACT_DELEGATE';
end;
$$;
