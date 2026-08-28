-- Prevent repeated identical restroom evidence from the same qualifying visit.
-- Different observations during the same visit remain valid; this only suppresses
-- exact duplicates that would otherwise create redundant evidence rows.

create unique index if not exists restroom_observations_user_location_checkin_payload_uidx
  on public.restroom_observations (
    user_id,
    location_id,
    check_in_id,
    observation_type,
    (coalesce(cleanliness_pct, -1)),
    (coalesce(note, ''))
  )
  where check_in_id is not null;
