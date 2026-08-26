export function createQuestService(client){
  if(!client) throw new Error('Supabase client is required.');
  async function rpc(name,args={}){const{data,error}=await client.rpc(name,args);if(error)throw error;return data;}
  return Object.freeze({
    available:(limit=20)=>rpc('quest_list_available',{p_limit:Math.min(Math.max(Number(limit)||20,1),50)}),
    create:(ownerType,ownerId,payload)=>rpc('quest_create',{p_owner_type:ownerType,p_owner_id:ownerId,p_name:payload.name,p_description:payload.description??null,p_reward_config:payload.rewardConfig??{},p_targeting_config:payload.targetingConfig??{},p_route_config:payload.routeConfig??{},p_start_at:payload.startAt??null,p_end_at:payload.endAt??null}),
    listCreator:(ownerType,ownerId)=>rpc('quest_list_creator',{p_owner_type:ownerType,p_owner_id:ownerId}),
    addStep:(questId,step)=>rpc('quest_add_step',{p_quest_id:questId,p_step_order:step.order,p_step_type:step.type,p_title:step.title,p_description:step.description??null,p_location_id:step.locationId??null,p_geofence_id:step.geofenceId??null,p_qr_code_id:step.qrCodeId??null,p_required:step.required??true,p_xp_reward:step.xpReward??0,p_reward_config:step.rewardConfig??{},p_validation_config:step.validationConfig??{}}),
    setStatus:(questId,status)=>rpc('quest_set_status',{p_quest_id:questId,p_status:status}),
    start:(questId)=>rpc('quest_start',{p_quest_id:questId}),
    recordStep:(participationId,stepId,eventType,options={})=>rpc('quest_record_step',{p_participation_id:participationId,p_quest_step_id:stepId,p_event_type:eventType,p_source:options.source??null,p_metadata:options.metadata??{},p_location_id:options.locationId??null,p_geofence_event_id:options.geofenceEventId??null,p_qr_code_id:options.qrCodeId??null,p_checkin_id:options.checkinId??null}),
    dispatchEvent:(eventType,options={})=>rpc('quest_dispatch_event',{p_user_id:options.userId,p_event_type:eventType,p_location_id:options.locationId??null,p_checkin_id:options.checkinId??null,p_qr_code_id:options.qrCodeId??null,p_geofence_event_id:options.geofenceEventId??null,p_metadata:options.metadata??{}}),
    leaderboard:(questId,limit=25)=>rpc('quest_leaderboard',{p_quest_id:questId,p_limit:limit})
  });
}
