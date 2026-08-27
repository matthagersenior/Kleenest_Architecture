import { LIVE_EVENT_TYPES } from '../live/network.js';

export function createIntelligenceConvergenceService(client,{intelligence,notifications,actions,live}={}){
  if(!client)throw new Error('Supabase client is required.');
  const emit=(name,detail)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))};
  const requireUser=async()=>{const{data:{user},error}=await client.auth.getUser();if(error)throw error;if(!user)throw new Error('Sign in to continue.');return user;};
  return Object.freeze({
    async notifyFromSignal({locationId,surface='network',type,dedupeKey,title,body,reasons=[],signals={},cooldownMinutes=120}={}){
      const user=await requireUser();
      if(notifications?.createCandidate)return notifications.createCandidate({locationId,surface,type,dedupeKey,title,body,reasons,signals,cooldownMinutes});
      const{data,error}=await client.rpc('create_intelligence_notification',{p_user_id:user.id,p_location_id:locationId,p_surface:surface,p_type:type,p_dedupe_key:dedupeKey,p_title:title,p_body:body,p_data:{reasons,signals,generated_at:new Date().toISOString()},p_cooldown_minutes:cooldownMinutes});
      if(error)throw error;emit('kleenest:intelligence-updated',{locationId,type,notification:data});return data;
    },
    async createAction({locationId,businessId,surface,signalType,actionType,metadata={}}={}){
      if(!actions?.createLink)throw new Error('Intelligence action service is unavailable.');
      const result=await actions.createLink(locationId,businessId,surface,signalType,actionType,metadata);emit('kleenest:intelligence-updated',{locationId,businessId,signalType,actionType,result});return result;
    },
    async executeAction(actionId){if(!actions?.execute)throw new Error('Intelligence action service is unavailable.');const result=await actions.execute(actionId);emit('kleenest:intelligence-updated',{actionId,result});return result;},
    async completeAction(actionId,metadata={}){if(!actions?.complete)throw new Error('Intelligence action service is unavailable.');const result=await actions.complete(actionId,metadata);emit('kleenest:intelligence-updated',{actionId,result});return result;},
    async publishLocationSignal({locationId,eventType,title,body,payload={},radiusM=500,dedupeKey=null}={}){
      const{data,error}=await client.rpc('publish_intelligence_location_event',{p_location_id:locationId,p_event_type:eventType,p_title:title,p_body:body,p_payload:payload,p_radius_m:radiusM,p_dedupe_key:dedupeKey});if(error)throw error;emit('kleenest:intelligence-updated',{locationId,eventType,result:data});return data;
    },
    subscribe({locationId=null,onEvent}={}){if(typeof onEvent!=='function')throw new Error('onEvent callback is required.');if(live?.subscribe)return live.subscribe({locationId,types:[LIVE_EVENT_TYPES.LOCATION_VERIFIED,LIVE_EVENT_TYPES.LOCATION_STALE,LIVE_EVENT_TYPES.LOCATION_CONFLICT,LIVE_EVENT_TYPES.BUSINESS_OFFER_STARTED,LIVE_EVENT_TYPES.BUSINESS_OFFER_REDEEMED,LIVE_EVENT_TYPES.CAMPAIGN_CONVERTED],onEvent});return()=>{};},
    async processJobs(limit=25){const[n,a]=await Promise.all([client.rpc('process_intelligence_notification_jobs',{p_limit:limit}),client.rpc('process_intelligence_action_jobs',{p_limit:limit})]);if(n.error)throw n.error;if(a.error)throw a.error;const result={notifications:n.data??0,actions:a.data??0};emit('kleenest:intelligence-updated',result);return result;}
  });
}
