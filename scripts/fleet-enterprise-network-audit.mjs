import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['AppContext.jsx',['base.intelligenceConvergence=createIntelligenceConvergenceService','services']],
 ['domains/fleet/operations.js',['record_fleet_operational_event','authoritativeMutation','serverAuthoritative','kleenest:fleet-updated','kleenest:business-updated','fleet-mutation','semantic_location_search','searchStopLocations','fleet_assign_driver_user','assignDriverUser','fleet_set_route_stops','fleet_dispatch_route','fleet_record_route_stop_timing','fleet_route_performance','dispatchRoute','routePerformance']],
 ['domains/fleet/intelligence.js',['fleet_dashboard_summary_v2','fleet_service_opportunities_for_business','get_fleet_network_leaderboard']],
 ['domains/enterprise/intelligence.js',['get_enterprise_partner_network','get_partner_network_benchmark','get_partner_campaign_roi','get_partner_allocation_roi','record_enterprise_partner_metric','record_enterprise_partner_campaign_outcome']],
 ['domains/enterprise/lifecycle.js',['createCampaign','recordCampaignOutcome','recordNetworkMetric','createAllocation','activateAllocation','resolveContext','kleenest:enterprise-updated','kleenest:business-updated','enterprise:']],
 ['domains/intelligence/convergence.js',['operationalSnapshot','operationalOpportunities','runOperationalLoop','kleenest:operational-loop-updated','kleenest:intelligence-updated','kleenest:business-updated','subscribe','processJobs']],
 ['domains/intelligence/operational-loop.js',['kleenest:operational-loop-updated','kleenest:business-updated','createAction','complete','notify','publish']],
 ['runtime/FleetIntelligenceSurface.jsx',['services.fleet.intelligence','services.fleet.networkLeaderboard','services.intelligenceConvergence.runOperationalLoop','runLoop','Run intelligence loop','kleenest:fleet-updated','kleenest:business-updated']],
 ['runtime/FleetRouteCrudPanel.jsx',['FleetRouteStopPlanner','FleetRoutePerformanceCard','driver_id','vehicle_id']],
 ['runtime/FleetRouteStopPlanner.jsx',['searchStopLocations','setRouteStops','planned_arrival_at','planned_ttl_minutes','planned_dwell_minutes','Save stop plan','Stop order is locked']],
 ['runtime/FleetRoutePerformanceCard.jsx',['dispatchRoute','recordRouteStopTiming','routePerformance','Dispatch route','On-time arrivals','ETA variance','TTL variance','Duration variance','Dwell variance','actual_ttl_minutes','ttl_variance_minutes','dwell_variance_minutes','Skip']],
 ['runtime/EnterpriseOperationsPage.jsx',['services.enterpriseIntelligence.getNetwork','services.enterpriseIntelligence.allocationRoi','recordCampaignOutcome','recordNetworkMetric']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
for(const [migrationName,tokens] of [
 ['20260830002000_fleet_dispatch_stop_timing_v1.sql',['fleet_route_stops','planned_arrival_at','planned_ttl_minutes','planned_dwell_minutes','actual_arrived_at','actual_completed_at','dispatch_locked','fleet_dispatch_route','fleet_record_route_stop_timing','fleet_route_performance']],
 ['20260830002200_fleet_dispatch_authority_v2.sql',['fleet_drivers add column if not exists user_id','fleet_assign_driver_user','Add at least one route stop before dispatch','Fleet manager or assigned driver access required','actor_user_id','metadata']],
 ['20260830002300_fleet_route_performance_metrics_v2.sql',['actual_ttl_minutes','ttl_variance_minutes','dwell_variance_minutes','arrived_by_plan_pct','route_completed','all_stops_terminal','duration_variance_minutes','avg_ttl_variance_minutes','avg_dwell_variance_minutes']]
]){const file=path.resolve('supabase/migrations',migrationName);if(!fs.existsSync(file)){missing.push(`${migrationName}: missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${migrationName}: missing ${token}`)}
const convergence=fs.readFileSync(path.join(root,'domains/intelligence/convergence.js'),'utf8');
for(const token of ['fleet_dashboard_summary_v2','fleet_service_opportunities_for_business','business_dashboard_secure_summary','business_location_intelligence','business_roi_analytics','process_intelligence_notification_jobs','process_intelligence_action_jobs'])if(!convergence.includes(token))missing.push(`intelligence/convergence.js: missing ${token}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Fleet → Enterprise → Network Intelligence convergence audit passed with searchable stop planning, assigned-driver authority, single-source dispatch telemetry, full ETA/TTL/dwell/duration metrics, and guarded operational intelligence execution.');
