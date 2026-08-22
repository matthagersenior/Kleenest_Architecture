export function createQuestService(client){
  if(!client) throw new Error('Supabase client is required.');
  async function rpc(name,args={}){const{data,error}=await client.rpc(name,args);if(error)throw error;return data;}
  return Object.freeze({
    start:(questId)=>rpc('quest_start',{p_quest_id:questId}),
    recordStep:(participationId,stepId,eventType,options={})=>rpc('quest_record_step',{p_participation_id:participationId,p_quest_step_id:stepId,p_event_type:eventType,p_source:options.source??null,p_metadata:options.metadata??{},p_location_id:options.locationId??null,p_geofence_event_id:options.geofenceEventId??null,p_qr_code_id:options.qrCodeId??null,p_checkin_id:options.checkinId??null}),
    leaderboard:(questId,limit=25)=>rpc('quest_leaderboard',{p_quest_id:questId,p_limit:limit})
  });
}
