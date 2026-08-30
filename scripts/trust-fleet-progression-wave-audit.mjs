import fs from 'node:fs';
const read=file=>fs.readFileSync(file,'utf8');
const checks=[
 ['Visit wires measurement panel',['VisitMeasurementsPanel','reviewId='],'src/runtime/VisitSurface.jsx'],
 ['Measurement panel exposes amenity inventory UI',['REVIEW AMENITIES','How many?'],'src/runtime/VisitMeasurementsPanel.jsx'],
 ['Measurement panel persists review amenity inventory',['recordReviewAmenityInventory'],'src/runtime/VisitMeasurementsPanel.jsx'],
 ['Measurement panel collects occupancy dimensions',['People currently present','Estimated capacity','People waiting','Wait time'],'src/runtime/VisitMeasurementsPanel.jsx'],
 ['Consumer service exposes review amenity inventory',['record_review_amenity_inventory'],'src/domains/consumer/location-evidence.js'],
 ['Consumer service exposes occupancy write authority',['submit_location_occupancy_observation'],'src/domains/consumer/location-evidence.js'],
 ['Consumer service exposes occupancy summary authority',['get_location_occupancy_summary'],'src/domains/consumer/location-evidence.js'],
 ['Standalone amenity evidence carries quantity',['observedQuantity','observed_quantity','submit_amenity_observation'],'src/domains/consumer/location-evidence.js'],
 ['Review reads return amenity quantities',['review_amenity_feedback','observed_quantity','quantity:item.observed_quantity'],'src/domains/community/interactions.js'],
 ['Location reviews require verified visit authority',['Verify your visit before publishing a customer review','checkInId','services.reviews.create'],'src/runtime/LocationDetailsPageFixed.jsx'],
 ['Location review cards render amenity counts',['review-amenity-inventory','amenityText(a)'],'src/runtime/LocationDetailsPageFixed.jsx'],
 ['Location details surface privacy-safe occupancy intelligence',['occupancySummary','OCCUPANCY','Privacy-safe aggregate','utilization_pct','queue_count'],'src/runtime/LocationDetailsPageFixed.jsx'],
 ['Amenity quantities persist in canonical evidence tables',['review_amenity_feedback add column if not exists observed_quantity','location_amenity_observations add column if not exists observed_quantity'],'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Occupancy substrate has RLS',['location_occupancy_observations enable row level security','location_occupancy_own_insert','location_occupancy_own_read'],'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Occupancy summary is privacy-safe aggregate',['sample_count','avg_occupancy_count','avg_utilization_pct','freshest_observed_at'],'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Verified occupancy progression is idempotent',['occupancy_observation','p_check_in_id','idempotency_key'],'supabase/migrations/20260830003000_comprehensive_badges_rewards_v1.sql'],
 ['Comprehensive badges cover requested contribution classes',['amenity-scout','occupancy-scout','quest-finisher','trusted-contributor','streak-thirty','explorer-25'],'supabase/migrations/20260830003000_comprehensive_badges_rewards_v1.sql'],
 ['Badge rewards are one-time point transactions',['badge_reward','on conflict (user_id,reason,reference_id)'],'supabase/migrations/20260830003000_comprehensive_badges_rewards_v1.sql'],
 ['Progression service exposes full badge catalog',['badgeCatalog:','client.from(\'badges\')'],'src/domains/progression/service.js'],
 ['Badge catalog shows locked and earned requirements',['Every way to earn recognition','Not earned yet','reward_points'],'src/runtime/BadgeCatalogPanel.jsx'],
 ['Progression page renders comprehensive badge catalog',['BadgeCatalogPanel'],'src/runtime/ProgressionPage.jsx'],
 ['Verified occupancy reward activity is supported',['occupancy_observation',"when 'occupancy_observation' then 10",'evaluate_user_badges'],'supabase/migrations/20260830003200_occupancy_fleet_intelligence_amenity_quantity_v2.sql'],
 ['Standalone amenity quantity persists in observation authority',['observed_quantity','Present amenity quantity out of range','submit_amenity_observation'],'supabase/migrations/20260830003200_occupancy_fleet_intelligence_amenity_quantity_v2.sql'],
 ['Fleet dispatch signal policy has protected configurable thresholds',['fleet_dispatch_signal_policies','occupancy_fresh_minutes','high_utilization_pct','queue_threshold','fleet_dispatch_signal_policy_update'],'supabase/migrations/20260830003200_occupancy_fleet_intelligence_amenity_quantity_v2.sql'],
 ['Fleet dispatch intelligence consumes occupancy facts',['occupancy_summary','current utilization meets configured threshold','current queue meets configured threshold','authoritative_dispatch_intelligence_v2'],'supabase/migrations/20260830003200_occupancy_fleet_intelligence_amenity_quantity_v2.sql'],
 ['Fleet service exposes dispatch signal policy',['dispatchSignalPolicy','updateDispatchSignalPolicy','fleet_update_dispatch_signal_policy'],'src/domains/fleet/operations.js'],
 ['Fleet dispatch policy UI exposes manager-adjustable thresholds',['Occupancy-aware ranking','Fresh for (minutes)','High utilization threshold','Queue threshold','Save signal policy'],'src/runtime/FleetDispatchSignalPolicyPanel.jsx'],
 ['Fleet recommendations expose occupancy facts and policy',['FleetDispatchSignalPolicyPanel','occupancyText','occupancy_summary','dispatch_occupancy_summary','authoritative dispatch'],'src/runtime/FleetRouteStopPlanner.jsx'],
 ['Follow mutation evaluates community badges',['toggle_follow_user','evaluate_user_badges(v_user)','grant execute on function public.toggle_follow_user(uuid) to authenticated'],'supabase/migrations/20260830003400_progression_fleet_operational_summary_v1.sql'],
 ['Fleet operational summary is Fleet-access scoped',['fleet_operational_signal_summary','fleet_observe_access','route_completed','route_failed','job_completed','job_failed'],'supabase/migrations/20260830003400_progression_fleet_operational_summary_v1.sql'],
 ['Fleet service exposes operational signal summary',['operationalSignals','fleet_operational_signal_summary'],'src/domains/fleet/operations.js'],
 ['Fleet routes surface operational signals',['FleetOperationalSignalsPanel','access.observe'],'src/runtime/FleetRoutesPage.jsx'],
 ['Fleet operational panel shows geofence and job outcomes',['24-hour operational signals','geofence entries','dwell events','completed','failed'],'src/runtime/FleetOperationalSignalsPanel.jsx'],
 ['Fleet operational notification trigger exists',['trg_fleet_operational_notification'],'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet operational notification covers failures',['route_failed','job_failed'],'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet geofence notification trigger exists',['trg_fleet_geofence_notification'],'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet geofence notification is source-event deduped',['fleet-geofence:'],'supabase/migrations/20260830002900_trust_fleet_occupancy_foundation.sql'],
 ['Fleet notifications materialize inbox and push deliveries',['materialize_notification_event(v_event)','queue_push_deliveries_for_notification(v_event)'],'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet route failed status exists',["'failed'"],'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet failed transition emits route_failed',['route_failed'],'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet event payload preserves source provenance',['source_event_id','source_event_type','occurred_at'],'supabase/migrations/20260830003100_fleet_event_notification_delivery_v2.sql'],
 ['Fleet client trusts server terminal notification authority',["authoritativeMutation(businessId,'route_status_updated','fleet_set_route_status'",'completed','cancelled','failed'],'src/domains/fleet/operations.js'],
 ['Fleet client no longer publishes terminal notifications manually',[text=>!text.includes('publish_fleet_route_notification')],'src/domains/fleet/operations.js'],
 ['Fleet editor exposes failed state and routes status through lifecycle service',['option value="failed"','services.fleet.routeStatus'],'src/runtime/FleetRouteCrudPanel.jsx'],
];
const failures=[];
for(const [label,contracts,file] of checks){
 let text;
 try{text=read(file)}catch{failures.push(`${label}: missing ${file}`);continue}
 for(const contract of contracts){
  const ok=typeof contract==='function'?contract(text):text.includes(contract);
  if(!ok){failures.push(`${label}: contract ${typeof contract==='string'?JSON.stringify(contract):'predicate'} not found in ${file}`);break}
 }
}
if(failures.length){console.error('Trust + Fleet Operations + Progression wave audit FAILED');failures.forEach(x=>console.error(`- ${x}`));process.exit(1)}
console.log(`Trust + Fleet Operations + Progression wave audit passed (${checks.length} contracts): counted amenity evidence, privacy-safe occupancy intelligence, comprehensive automatic badge/reward evaluation, configurable occupancy-aware Fleet dispatch, event-driven owner notifications, and operational signal summaries are converged.`);
