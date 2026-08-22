export function createQuestService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    authorized:(ownerType,ownerId)=>rpc('quest_creator_authorized',{p_owner_type:ownerType,p_owner_id:ownerId}),
    create:(ownerType,ownerId,name,description=null,rewardConfig={},targetingConfig={},routeConfig={},startAt=null,endAt=null)=>rpc('quest_create',{p_owner_type:ownerType,p_owner_id:ownerId,p_name:name,p_description:description,p_reward_config:rewardConfig,p_targeting_config:targetingConfig,p_route_config:routeConfig,p_start_at:startAt,p_end_at:endAt}),
    addStep:(questId,stepOrder,stepType,title,options={})=>rpc('quest_add_step',{p_quest_id:questId,p_step_order:stepOrder,p_step_type:stepType,p_title:title,...options}),
    listCreator:(ownerType,ownerId)=>rpc('quest_list_creator',{p_owner_type:ownerType,p_owner_id:ownerId}),
    setStatus:(questId,status)=>rpc('quest_set_status',{p_quest_id:questId,p_status:status}),
    start:(questId)=>rpc('quest_start',{p_quest_id:questId}),
    recordStep:(participationId,stepId,eventType,source=null,metadata={},options={})=>rpc('quest_record_step',{p_participation_id:participationId,p_quest_step_id:stepId,p_event_type:eventType,p_source:source,p_metadata:metadata,...options}),
    triggerGeofence:(locationId,eventId,eventType,dwellSeconds=null,metadata={})=>rpc('quest_trigger_geofence',{p_location_id:locationId,p_geofence_event_id:eventId,p_event_type:eventType,p_dwell_seconds:dwellSeconds,p_metadata:metadata}),
    triggerQr:(qrCodeId,locationId=null,checkinId=null,metadata={})=>rpc('quest_trigger_qr',{p_qr_code_id:qrCodeId,p_location_id:locationId,p_checkin_id:checkinId,p_metadata:metadata}),
    leaderboard:(questId,limit=25)=>rpc('quest_leaderboard',{p_quest_id:questId,p_limit:Number(limit)}),
  });
}
