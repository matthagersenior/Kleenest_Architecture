// Migrated from the proven Kleenest_App platform capability contract catalog.
// This is a contract inventory, not a second service layer: runtime domains remain authoritative for execution.
export const PLATFORM_CAPABILITY_CONTRACTS=Object.freeze({
 maps:['map_network_nearby_v1','get_location_details','kleenest_location_confidence'],
 evidence:['record_location_observation','submit_amenity_observation','submit_restroom_observation','submit_location_quality_observation','submit_location_photo_record','record_location_verification','submit_location_verification','record_review_amenity_feedback','refresh_location_rating','refresh_contributor_reputation','refresh_contributor_milestones'],
 community:['submit_location_photo_record','submit_location_quality_observation','submit_amenity_observation','submit_restroom_observation','record_location_observation','record_location_verification','record_review_amenity_feedback','refresh_location_rating','refresh_contributor_reputation','refresh_contributor_milestones'],
 checkin:['record_gps_checkin','kleenest_map_check_in','create_check_in','verify_checkin','process_check_in'],
 engagement:['record_gps_checkin','kleenest_map_check_in','create_check_in','verify_checkin','process_check_in'],
 routing:['create_route_plan','prepare_route_discovery','complete_route','record_location_route_event','record_favorite_route_event'],
 notifications:['user_notifications','mark_notification_read','create_gps_geofence_notification','publish_location_notification','publish_fleet_route_notification','create_intelligence_notification','queue_intelligence_notification_jobs','process_intelligence_notification_jobs','queue_notification_delivery','queue_push_deliveries_for_notification','register_notification_push_subscription','remove_notification_push_subscription'],
 gamification:['gamification_dashboard','get_progression_summary','get_user_leaderboard','evaluate_user_badges','complete_progression_challenge'],
 business:['business_dashboard_secure_summary','business_engagement_analytics','business_roi_analytics','business_occupancy_analytics'],
 enterprise:['get_enterprise_partner_network','get_partner_network_benchmark','get_partner_campaign_roi','get_partner_allocation_roi'],
 fleet:['fleet_dashboard_summary_v2','fleet_service_opportunities_for_business','fleet_set_vehicle_status','fleet_set_driver_status','fleet_set_route_status','fleet_complete_maintenance','fleet_resolve_alert'],
 qr:['redeem_qr_code','verify_checkin','consume_single_use_qr','resolve_custom_qr_action'],
 admin:['admin_get_overview','admin_data_integrity_summary','admin_list_reports','admin_list_pending_businesses','admin_user_search'],
});
export const getPlatformCapabilityContract=code=>PLATFORM_CAPABILITY_CONTRACTS[code]||[];
export const getPlatformContractCodes=()=>Object.keys(PLATFORM_CAPABILITY_CONTRACTS);
export const getRpcContractIndex=()=>Object.freeze(Object.fromEntries(Object.entries(PLATFORM_CAPABILITY_CONTRACTS).flatMap(([domain,rpcs])=>rpcs.map(rpc=>[rpc,domain]))));
