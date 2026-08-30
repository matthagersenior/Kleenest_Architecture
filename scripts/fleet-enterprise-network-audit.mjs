import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['AppContext.jsx',['base.intelligenceConvergence=createIntelligenceConvergenceService','services']],
 ['domains/fleet/access.js',['isFleetControllerRole','fleetAccessState']],
 ['domains/fleet/operations.js',['record_fleet_operational_event','authoritativeMutation','serverAuthoritative','kleenest:fleet-updated','kleenest:business-updated','semantic_location_search','searchStopLocations','subscribeDispatch','fleet_routes','fleet_route_stops','fleet_dispatch_intelligence','dispatchIntelligence','fleet_driver_assignment_candidates','driverAssignmentCandidates','fleet_assign_driver_user','assignDriverUser','fleet_set_route_stops','fleet_dispatch_route','fleet_record_route_stop_timing','fleet_route_performance','dispatchRoute','routePerformance','fleet_current_user_dispatch','currentUserDispatch']],
 ['domains/fleet/intelligence.js',['fleet_dashboard_summary_v2','fleet_service_opportunities_for_business','get_fleet_network_leaderboard']],
 ['domains/enterprise/intelligence.js',['get_enterprise_partner_network','get_partner_network_benchmark','get_partner_campaign_roi','get_partner_allocation_roi','record_enterprise_partner_metric','record_enterprise_partner_campaign_outcome']],
 ['domains/enterprise/lifecycle.js',['createCampaign','recordCampaignOutcome','recordNetworkMetric','createAllocation','activateAllocation','resolveContext','kleenest:enterprise-updated','kleenest:business-updated','enterprise:']],
 ['domains/intelligence/convergence.js',['operationalSnapshot','operationalOpportunities','runOperationalLoop','kleenest:operational-loop-updated','kleenest:intelligence-updated','kleenest:business-updated','subscribe','processJobs','server_scheduled']],
 ['domains/intelligence/operational-loop.js',['kleenest:operational-loop-updated','kleenest:business-updated','createAction','complete','notify','publish']],
 ['runtime/FleetIntelligenceSurface.jsx',['fleetAccessState','FleetControllerIntelligenceSurface','FleetUserDispatchPanel']],
 ['runtime/FleetControllerIntelligenceSurface.jsx',['services.fleet.intelligence','services.fleet.networkLeaderboard','services.intelligenceConvergence.runOperationalLoop','runLoop','Run intelligence loop','kleenest:fleet-updated','kleenest:business-updated']],
 ['runtime/FleetUserDispatchPanel.jsx',['currentUserDispatch','My dispatch','Assigned vehicle','Assigned routes']],
 ['runtime/FleetOperationsPage.jsx',['FleetControllerOperationsPage','FleetUserDispatchPanel','fleetAccessState']],
 ['runtime/FleetRoutesPage.jsx',['currentUserDispatch','FleetRouteCrudPanel','access.operate']],
 ['runtime/FleetPerformancePage.jsx',['currentUserDispatch','FleetControllerPerformancePage','access.configure']],
 ['runtime/FleetRouteCrudPanel.jsx',['FleetRouteStopPlanner','FleetRoutePerformanceCard','driver_id','vehicle_id','subscribeDispatch','realtime-dispatch','Driver account links','driverAssignmentCandidates','assignDriverUser','assigned-driver timing authority and dispatch notifications']],
 ['runtime/FleetRouteStopPlanner.jsx',['searchStopLocations','dispatchIntelligence','Map discovery','fleetBusinessId','fleetRouteId','Recommended service stops','priority_score','reasons','setRouteStops','planned_arrival_at','planned_ttl_minutes','planned_dwell_minutes','Save stop plan','Stop order is locked']],
 ['runtime/MapSurface.jsx',['fleetBusinessId','fleetRouteId','Add to Fleet route','services.fleet.setRouteStops']],
 ['runtime/FleetRoutePerformanceCard.jsx',['dispatchRoute','recordRouteStopTiming','routePerformance','Dispatch route','On-time arrivals','ETA variance','TTL variance','Duration variance','Dwell variance','actual_ttl_minutes','ttl_variance_minutes','dwell_variance_minutes','Skip']],
 ['runtime/EnterpriseOperationsPage.jsx',['services.enterpriseIntelligence.getNetwork','services.enterpriseIntelligence.allocationRoi','recordCampaignOutcome','recordNetworkMetric']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
for(const [migrationName,tokens] of [
 ['20260830002000_fleet_dispatch_stop_timing_v1.sql',['fleet_route_stops','planned_arrival_at','planned_ttl_minutes','planned_dwell_minutes','actual_arrived_at','actual_completed_at','dispatch_locked','fleet_dispatch_route','fleet_record_route_stop_timing','fleet_route_performance']],
 ['20260830002200_fleet_dispatch_authority_v2.sql',['fleet_drivers add column if not exists user_id','fleet_assign_driver_user','Add at least one route stop before dispatch','Fleet manager or assigned driver access required','actor_user_id','metadata']],
 ['20260830002300_fleet_route_performance_metrics_v2.sql',['actual_ttl_minutes','ttl_variance_minutes','dwell_variance_minutes','arrived_by_plan_pct','route_completed','all_stops_terminal','duration_variance_minutes','avg_ttl_variance_minutes','avg_dwell_variance_minutes']],
 ['20260830002400_fleet_dispatch_intelligence_v1.sql',['fleet_dispatch_intelligence','priority_score','needs fresh observation','bathroom not verified','candidate_stops','drivers','vehicles','authoritative_dispatch_intelligence_v1','revoke execute','grant execute']],
 ['20260830002500_fleet_realtime_dispatch_v1.sql',['grant select on table public.fleet_route_stops to authenticated','supabase_realtime','public.fleet_routes','public.fleet_route_stops']],
 ['20260830002600_fleet_driver_identity_dispatch_notification_v1.sql',['fleet_driver_assignment_candidates','Fleet manager access required','fleet_drivers d on d.business_id=bm.business_id and d.user_id=bm.user_id','publish_fleet_route_notification','select d.user_id from public.fleet_drivers','route_dispatched','Route dispatched','fleet_dispatch_route']],
 ['20260830172000_fleet_current_user_dispatch.sql',['fleet_current_user_dispatch','auth.uid()','fleet_drivers','fleet_routes','fleet_route_stops']]
]){const file=path.resolve('supabase/migrations',migrationName);if(!fs.existsSync(file)){missing.push(`${migrationName}: missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${migrationName}: missing ${token}`)}
const convergence=fs.readFileSync(path.join(root,'domains/intelligence/convergence.js'),'utf8');
for(const token of ['fleet_dashboard_summary_v2','fleet_service_opportunities_for_business','business_dashboard_secure_summary','business_location_intelligence','business_roi_analytics',"notifications:'server_scheduled'","actions:'server_scheduled'"])if(!convergence.includes(token))missing.push(`intelligence/convergence.js: missing ${token}`);
if(convergence.includes("client.rpc('process_intelligence_action_jobs'")||convergence.includes("client.rpc('process_intelligence_notification_jobs'"))missing.push('intelligence/convergence.js: global job workers must remain server-managed');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Fleet → Enterprise → Network Intelligence convergence audit passed with controller/driver role separation, self-scoped dispatch, canonical map stop planning, realtime route telemetry, full ETA/TTL/dwell/duration metrics, and server-managed global intelligence workers.');
