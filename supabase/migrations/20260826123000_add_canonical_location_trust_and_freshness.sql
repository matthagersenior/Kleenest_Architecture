create index if not exists location_observations_location_observed_idx on public.location_observations(location_id, observed_at desc);
create index if not exists reviews_location_created_idx on public.reviews(location_id, created_at desc);
create index if not exists location_amenity_observations_location_observed_idx on public.location_amenity_observations(location_id, observed_at desc);

create or replace function public.get_location_trust_summary(p_location_id uuid)
returns jsonb language sql security definer
set search_path = public, auth, extensions, pg_catalog
as $$
with loc as (
 select l.id,l.verification_confidence,l.review_count,l.rating,l.updated_at
 from locations l where l.id=p_location_id and l.is_active=true
), obs as (
 select avg(confidence) filter (where observed_at>=now()-interval '30 days') recent_confidence,
        count(*) filter (where observed_at>=now()-interval '30 days') recent_observations,
        max(observed_at) latest_observation
 from location_observations where location_id=p_location_id
), rv as (
 select avg(cleanliness_pct) filter (where created_at>=now()-interval '90 days') recent_cleanliness
 from reviews where location_id=p_location_id and status::text not in ('hidden','rejected')
), bi as (
 select confidence,evidence_count,updated_at from location_bathroom_intelligence where location_id=p_location_id limit 1
), scored as (
 select loc.*,coalesce(obs.recent_confidence,0) recent_confidence,coalesce(obs.recent_observations,0) recent_observations,
 coalesce(rv.recent_cleanliness,0) recent_cleanliness,bi.confidence bathroom_confidence,bi.evidence_count,
 greatest(coalesce(bi.updated_at,loc.updated_at),coalesce(obs.latest_observation,loc.updated_at)) latest_fact
 from loc cross join obs cross join rv left join bi on true
)
select jsonb_build_object(
 'location_id',id,
 'trust_score',round(least(100,greatest(0,coalesce(verification_confidence,0)*.35+least(100,recent_confidence)*.20+least(100,coalesce(bathroom_confidence,0))*.20+least(100,coalesce(rating,0)*20)*.10+least(100,recent_cleanliness)*.10+least(100,(least(recent_observations,20)/20.0)*100)*.05))::numeric,1),
 'freshness',case when latest_fact>=now()-interval '7 days' then 'fresh' when latest_fact>=now()-interval '30 days' then 'recent' when latest_fact>=now()-interval '90 days' then 'aging' else 'stale' end,
 'verification_confidence',coalesce(verification_confidence,0),
 'bathroom_confidence',coalesce(bathroom_confidence,0),
 'evidence_count',coalesce(evidence_count,0),
 'recent_observations',recent_observations,
 'generated_at',now()
) from scored;
$$;

revoke execute on function public.get_location_trust_summary(uuid) from public,anon;
grant execute on function public.get_location_trust_summary(uuid) to authenticated;
