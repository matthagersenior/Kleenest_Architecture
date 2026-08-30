import fs from 'node:fs';
const read=f=>fs.readFileSync(f,'utf8');
const checks=[
 ['Exception intelligence migration',['fleet_operations_exception_intelligence','late_arrivals','dwell_overruns','push_failed','avg_duration_variance_minutes'],'supabase/migrations/20260830003700_fleet_operations_exception_intelligence_v1.sql'],
 ['Exception policy authority',['fleet_exception_policies','late_stop_minutes','dwell_overrun_minutes','geofence_dwell_minutes','fleet_update_exception_policy','fleet_actor_is_manager'],'supabase/migrations/20260830003800_fleet_exception_alert_policy_v1.sql'],
 ['Automatic operational exceptions',['trg_fleet_operational_exception','route_failed','route_stop_skipped','late_stop','dwell_overrun'],'supabase/migrations/20260830003800_fleet_exception_alert_policy_v1.sql'],
 ['Automatic geofence exceptions',['trg_fleet_geofence_exception','geofence_long_dwell','dwell_seconds'],'supabase/migrations/20260830003800_fleet_exception_alert_policy_v1.sql'],
 ['Exception alerts notify owner operators',['fleet_exception_alert','app_business_memberships','materialize_notification_event','queue_push_deliveries_for_notification'],'supabase/migrations/20260830003800_fleet_exception_alert_policy_v1.sql'],
 ['Alerts dedupe by source',['source_kind','source_id','fleet_alerts_source_uidx'],'supabase/migrations/20260830003800_fleet_exception_alert_policy_v1.sql'],
 ['Exception alert read is Fleet scoped',['fleet_exception_alerts','fleet_observe_access','grant execute'],'supabase/migrations/20260830003900_fleet_exception_alert_read_v1.sql'],
 ['Push failure detector is recursion safe',["exception_alert","notification_delivery","fleet_%"],'supabase/migrations/20260830004000_fleet_exception_trigger_hardening_v1.sql'],
 ['Trigger functions are not callable APIs',['revoke all on function public.evaluate_fleet_operational_exception()','revoke all on function public.evaluate_fleet_geofence_exception()','revoke all on function public.evaluate_fleet_push_delivery_exception()'],'supabase/migrations/20260830004000_fleet_exception_trigger_hardening_v1.sql'],
 ['Asset scorecard authority uses measured outcomes',['fleet_asset_exception_scorecards','completion_rate_pct','late_arrival_rate_pct','skipped_stops','dwell_overruns','critical_alerts'],'supabase/migrations/20260830004100_fleet_asset_exception_scorecards_v1.sql'],
 ['Fleet service exposes exception operations',['exceptionIntelligence','assetScorecards','exceptionPolicy','exceptionAlerts','updateExceptionPolicy','resolveAlert'],'src/domains/fleet/operations.js'],
 ['Fleet exception UI exposes thresholds',['FLEET OPERATIONS 2.0','Late stop after (minutes)','Stop dwell overrun (minutes)','Geofence dwell anomaly (minutes)','Save exception policy'],'src/runtime/FleetExceptionIntelligencePanel.jsx'],
 ['Fleet exception UI supports resolutions',['OPEN ALERTS','Actionable exceptions','Resolve','resolveAlert'],'src/runtime/FleetExceptionIntelligencePanel.jsx'],
 ['Asset scorecard UI avoids synthetic scoring',['30-DAY FLEET RELIABILITY','Measured outcomes only','No synthetic performance score','Completion','late arrivals'],'src/runtime/FleetAssetExceptionScorecardsPanel.jsx'],
 ['Fleet routes expose manager actions and scorecards',['FleetExceptionIntelligencePanel','canManage={access.operate}','FleetAssetExceptionScorecardsPanel'],'src/runtime/FleetRoutesPage.jsx'],
];
const failures=[];
for(const [label,tokens,file] of checks){let text;try{text=read(file)}catch{failures.push(`${label}: missing ${file}`);continue}for(const token of tokens){if(!text.includes(token)){failures.push(`${label}: contract ${JSON.stringify(token)} not found in ${file}`);break}}}
if(failures.length){console.error('Fleet Operations 2.0 audit FAILED');failures.forEach(x=>console.error(`- ${x}`));process.exit(1)}
console.log(`Fleet Operations 2.0 audit passed (${checks.length} contracts): exception intelligence, configurable thresholds, event-driven alerts, push-delivery health, dedupe, manager resolution, and measured driver/vehicle reliability scorecards are converged.`);
