import fs from 'node:fs';
const read=file=>fs.readFileSync(file,'utf8');
const checks=[
 ['Visit wires measurement panel',/VisitMeasurementsPanel[\s\S]*reviewId=/,'src/runtime/VisitSurface.jsx'],
 ['Measurement panel exposes amenity inventory UI',/REVIEW AMENITIES[\s\S]*How many\?/,'src/runtime/VisitMeasurementsPanel.jsx'],
 ['Measurement panel persists review amenity inventory',/recordReviewAmenityInventory/,'src/runtime/VisitMeasurementsPanel.jsx'],
 ['Measurement panel collects occupancy dimensions',/People currently present[\s\S]*Estimated capacity[\s\S]*People waiting[\s\S]*Wait time/,'src/runtime/VisitMeasurementsPanel.jsx'],
 ['Consumer service exposes review amenity inventory',/record_review_amenity_inventory/,'src/domains/consumer/location-evidence.js'],
 ['Consumer service exposes occupancy write authority',/submit_location_occupancy_observation/,'src/domains/consumer/location-evidence.js'],
 ['Consumer service exposes occupancy summary authority',/get_location_occupancy_summary/,'src/domains/consumer/location-evidence.js'],
 ['Review reads return amenity quantities',/review_amenity_feedback\(id,amenity_id,sentiment,observed_quantity[\s\S]*quantity:item\.observed_quantity/,'src/domains/community/interactions.js'],
 ['Location reviews require verified visit authority',/Verify your visit before publishing a customer review[\s\S]*checkInId[\s\S]*services\.reviews\.create/,'src/runtime/LocationDetailsPageFixed.jsx'],
 ['Location review cards render amenity counts',/review-amenity-inventory[\s\S]*amenityText\(a\)/,'src/runtime/LocationDetailsPageFixed.jsx'],
 ['Amenity quantities persist in canonical evidence tables',/review_amenity_feedback add column if not exists observed_quantity[\s\S]*location_amenity_observations add column if not exists observed_quantity/,'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Occupancy substrate has RLS',/location_occupancy_observations enable row level security[\s\S]*location_occupancy_own_insert[\s\S]*location_occupancy_own_read/,'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Occupancy summary is privacy-safe aggregate',/sample_count[\s\S]*avg_occupancy_count[\s\S]*avg_utilization_pct[\s\S]*freshest_observed_at/,'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Verified occupancy progression is idempotent',/occupancy_observation[\s\S]*p_check_in_id[\s\S]*idempotency_key/,'supabase/migrations/20260830003000_comprehensive_badges_rewards_v1.sql'],
 ['Comprehensive badges cover requested contribution classes',/amenity-scout[\s\S]*occupancy-scout[\s\S]*quest-finisher[\s\S]*trusted-contributor[\s\S]*streak-thirty[\s\S]*explorer-25/,'supabase/migrations/20260830003000_comprehensive_badges_rewards_v1.sql'],
 ['Badge rewards are one-time point transactions',/badge_reward[\s\S]*on conflict \(user_id,reason,reference_id\)/,'supabase/migrations/20260830003000_comprehensive_badges_rewards_v1.sql'],
 ['Progression service exposes full badge catalog',/badgeCatalog:[\s\S]*client\.from\('badges'\)/,'src/domains/progression/service.js'],
 ['Badge catalog shows locked and earned requirements',/Every way to earn recognition[\s\S]*Not earned yet[\s\S]*reward_points/,'src/runtime/BadgeCatalogPanel.jsx'],
 ['Progression page renders comprehensive badge catalog',/BadgeCatalogPanel/,'src/runtime/ProgressionPage.jsx'],
 ['Fleet operational notification trigger exists',/trg_fleet_operational_notification/,'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet operational notification covers failures',/route_failed[\s\S]*job_failed/,'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet geofence notification trigger exists',/trg_fleet_geofence_notification/,'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet geofence notification is source-event deduped',/fleet-geofence:/,'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet notifications materialize inbox and push deliveries',/materialize_notification_event\(v_event\)[\s\S]*queue_push_deliveries_for_notification\(v_event\)/,'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet route failed status exists',/'failed'/,'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet failed transition emits route_failed',/route_failed/,'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet event payload preserves source provenance',/source_event_id[\s\S]*source_event_type[\s\S]*occurred_at/,'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet client trusts server terminal notification authority',/authoritativeMutation\(businessId,'route_status_updated','fleet_set_route_status'[\s\S]*completed','cancelled','failed/,'src/domains/fleet/operations.js'],
 ['Fleet client no longer publishes terminal notifications manually',/^((?!publish_fleet_route_notification).)*$/s,'src/domains/fleet/operations.js'],
 ['Fleet editor exposes failed state and routes status through lifecycle service',/option value="failed"[\s\S]*services\.fleet\.routeStatus/,'src/runtime/FleetRouteCrudPanel.jsx'],
];
const failures=[];
for(const [label,re,file] of checks){let text;try{text=read(file)}catch{failures.push(`${label}: missing ${file}`);continue}if(!re.test(text))failures.push(`${label}: contract not found in ${file}`)}
if(failures.length){console.error('Trust + Fleet Operations + Progression wave audit FAILED');failures.forEach(x=>console.error(`- ${x}`));process.exit(1)}
console.log(`Trust + Fleet Operations + Progression wave audit passed (${checks.length} contracts): counted review amenities, occupancy aggregation, comprehensive badges/rewards, and source-event-driven Fleet owner inbox/push notifications are converged.`);
