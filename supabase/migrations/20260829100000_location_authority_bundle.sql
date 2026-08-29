-- Slice A: Location Authority Closure
-- One authorized read contract for map/search/details/business/fleet/enterprise consumers.
-- Raw external payloads are preserved; canonical projections do not replace source evidence.

create or replace function public.get_location_authority_bundle(p_location_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_location jsonb;
  v_place jsonb;
  v_intelligence jsonb;
  v_trust jsonb;
  v_reviews jsonb;
  v_external jsonb;
  v_interactions jsonb;
begin
  if p_location_id is null then
    raise exception 'Canonical location is required.' using errcode = '22023';
  end if;

  select to_jsonb(l) into v_location
  from public.locations l
  where l.id = p_location_id and l.is_active = true;

  if v_location is null then
    return jsonb_build_object('location', null, 'place', null, 'intelligence', null,
      'trust', null, 'reviews', '[]'::jsonb, 'external_records', '[]'::jsonb,
      'interaction', jsonb_build_object('favorited', false, 'checked_in', false, 'latest_check_in', null));
  end if;

  select to_jsonb(p) into v_place
  from public.places p
  where p.location_id = p_location_id and p.is_active = true
  order by p.updated_at desc nulls last
  limit 1;

  select to_jsonb(s) into v_intelligence
  from public.location_intelligence_snapshot s
  where s.location_id = p_location_id
  order by s.calculated_at desc nulls last
  limit 1;

  begin
    select to_jsonb(t) into v_trust
    from public.get_location_trust_state(p_location_id) t;
  exception when others then
    v_trust := null;
  end;

  select coalesce(jsonb_agg(to_jsonb(r) order by r.created_at desc), '[]'::jsonb)
    into v_reviews
  from public.reviews r
  where r.location_id = p_location_id;

  begin
    select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc), '[]'::jsonb)
      into v_external
    from public.external_location_records e
    where e.location_id = p_location_id;
  exception when undefined_column then
    select '[]'::jsonb into v_external;
  end;

  select jsonb_build_object(
    'favorited', exists(select 1 from public.favorites f where f.user_id = auth.uid() and f.location_id = p_location_id),
    'checked_in', exists(select 1 from public.check_ins c where c.user_id = auth.uid() and c.location_id = p_location_id),
    'latest_check_in', (
      select to_jsonb(c) from public.check_ins c
      where c.user_id = auth.uid() and c.location_id = p_location_id
      order by c.checked_in_at desc nulls last limit 1
    )
  ) into v_interactions;

  return jsonb_build_object(
    'location', v_location,
    'place', v_place,
    'intelligence', coalesce(v_intelligence, '{}'::jsonb),
    'trust', v_trust,
    'reviews', v_reviews,
    'external_records', v_external,
    'interaction', v_interactions,
    'schema_version', 1
  );
end;
$$;

grant execute on function public.get_location_authority_bundle(uuid) to authenticated;
revoke execute on function public.get_location_authority_bundle(uuid) from anon;
