import { LIVE_EVENT_TYPES } from '../live/network.js';

export function createIntelligenceConvergenceService(client,{intelligence,notifications,actions,live}={}){
  if(!client)throw new Error('Supabase client is required.');
  const emit=(name,detail)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))};
  const requireUser=async()=>{const{data:{user},error}=await client.auth.getUser();if(error)throw error;if(!user)throw new Error('Sign in to continue.');return user;};
  const rpc=async(name,args={})=>{const{data,error}=await client.rpc(name,args);if(error)throw error;return data;};
  const rows=value=>Array.isArray(value)?value:[];
  const requireBusinessId=id=>{if(!id)throw new Error('Business is required.');return String(id);};
  const createIntelligenceActionLink=async args=>{const result=await actions?.createLink?.(args?.locationId,args?.businessId,args?.surface,args?.signalType,args?.actionType,args?.metadata||{});if(!result)throw new Error('Intelligence action service is unavailable.');return result;};
  const process_intelligence_notification_jobs=async(limit=25)=>{const{data,error}=await client.rpc('process_intelligence_notification_jobs',{p_limit:limit});if(error)throw error;return data??0;};
  const aiAssist=async({task,context={},instruction=''}={})=>{
    await requireUser();
    if(!task)throw new Error('AI task is required.');
    const{data,error}=await client.functions.invoke('ai-assist',{body:{task,context,instruction}});
    if(error)throw error;
    if(data?.error)throw new Error(data.error);
    const result={...data,task:data?.task||task,review_required:data?.review_required!==false};
    emit('kleenest:ai-assist-generated',{task:result.task,provider:result.provider,model:result.model,reviewRequired:result.review_required});
    return result;
  };
  const recordEvent=async({eventType,featureCode,subjectType='location',subjectId=null,locationId=null,businessId=null,fleetVehicleId=null,sourceTable='intelligence',sourceId=null,valueNumeric=null,valueText=null,metadata={}}={})=>{
    if(!eventType||!featureCode)throw new Error('Intelligence event type and feature code are required.');
    const result=await rpc('record_data_feature_event',{
      p_event_type:eventType,
      p_feature_code:featureCode,
      p_subject_type:subjectType,
      p_subject_id:subjectId,
      p_location_id:locationId,
      p_business_id:businessId,
      p_fleet_vehicle_id:fleetVehicleId,
      p_source_table:sourceTable,
      p_source_id:sourceId,
      p_value_numeric:valueNumeric,
      p_value_text:valueText,
      p_metadata:{...metadata,convergence:true,event_type:eventType},
    });
    emit('kleenest:intelligence-event',{eventType,featureCode,subjectId,locationId,businessId,result});
    return result;
  };
  const operationalSnapshot=async({businessId,surface='fleet',start=null,end=null}={})=>{
    const id=requireBusinessId(businessId);
    if(surface==='fleet'){
      const[dashboard,opportunities]=await Promise.all([
        rpc('fleet_dashboard_summary_v2',{p_business_id:id}),
        rpc('fleet_service_opportunities_for_business',{p_business_id:id})
      ]);
      return{surface,businessId:id,dashboard:dashboard??null,opportunities:rows(opportunities)};
    }
    const[dashboard,locationIntelligence,roi]=await Promise.all([
      rpc('business_dashboard_secure_summary',{p_business_id:id,p_start:start,p_end:end}),
      rpc('business_location_intelligence',{p_business_id:id,p_start:start,p_end:end}),
      rpc('business_roi_analytics',{p_business_id:id,p_start:start,p_end:end})
    ]);
    return{surface,businessId:id,dashboard:dashboard??null,locationIntelligence:rows(locationIntelligence),roi:roi??null};
  };
  const operationalOpportunities=async({businessId,surface='fleet'}={})=>{
    const id=requireBusinessId(businessId);
    return rows(await rpc(surface==='fleet'?'fleet_service_opportunities_for_business':'business_location_intelligence',{p_business_id:id}));
  };
  const processJobs=async(limit=25)=>{
    const[notificationsResult,actionsResult]=await Promise.all([
      client.rpc('process_intelligence_notification_jobs',{p_limit:limit}),
      client.rpc('process_intelligence_action_jobs',{p_limit:limit})
    ]);
    if(notificationsResult.error)throw notificationsResult.error;
    if(actionsResult.error)throw actionsResult.error;
    return{notifications:notificationsResult.data??0,actions:actionsResult.data??0};
  };
  const runOperationalLoop=async({businessId,surface='fleet',limit=25,start=null,end=null}={})=>{
    const id=requireBusinessId(businessId);
    const snapshot=await operationalSnapshot({businessId:id,surface,start,end});
    const signals=surface==='fleet'?rows(snapshot.opportunities):rows(snapshot.locationIntelligence);
    const processed=await processJobs(limit);
    const result=Object.freeze({businessId:id,surface,snapshot,signals,processed});
    emit('kleenest:operational-loop-updated',result);
    emit('kleenest:intelligence-updated',{businessId:id,surface,reason:'operational-loop'});
    emit('kleenest:business-updated',{businessId:id,reason:'operational-loop'});
    return result;
  };
  return Object.freeze({
    async notifyFromSignal({locationId,surface='network',type,dedupeKey,title,body,reasons=[],signals={},cooldownMinutes=120}={}){const user=await requireUser();if(notifications?.createCandidate)return notifications.createCandidate({locationId,surface,type,dedupeKey,title,body,reasons,signals,cooldownMinutes});return rpc('create_intelligence_notification',{p_user_id:user.id,p_location_id:locationId,p_surface:surface,p_type:type,p_dedupe_key:dedupeKey,p_title:title,p_body:body,p_data:{reasons,signals,generated_at:new Date().toISOString()},p_cooldown_minutes:cooldownMinutes});},
    async createAction(args={}){return createIntelligenceActionLink(args);},
    async executeAction(actionId){if(!actions?.execute)throw new Error('Intelligence action service is unavailable.');return actions.execute(actionId);},
    async completeAction(actionId,metadata={}){if(!actions?.complete)throw new Error('Intelligence action service is unavailable.');return actions.complete(actionId,metadata);},
    async publishLocationSignal({locationId,eventType,title,body,payload={},radiusM=500,dedupeKey=null}={}){return rpc('publish_intelligence_location_event',{p_location_id:locationId,p_event_type:eventType,p_title:title,p_body:body,p_payload:payload,p_radius_m:radiusM,p_dedupe_key:dedupeKey});},
    aiAssist,
    operationalSnapshot,
    operationalOpportunities,
    runOperationalLoop,
    subscribe({locationId=null,onEvent}={}){if(typeof onEvent!=='function')throw new Error('onEvent callback is required.');return live?.subscribe?live.subscribe({locationId,types:[LIVE_EVENT_TYPES.LOCATION_VERIFIED,LIVE_EVENT_TYPES.LOCATION_STALE,LIVE_EVENT_TYPES.LOCATION_CONFLICT,LIVE_EVENT_TYPES.BUSINESS_OFFER_STARTED,LIVE_EVENT_TYPES.BUSINESS_OFFER_REDEEMED,LIVE_EVENT_TYPES.CAMPAIGN_CONVERTED],onEvent}):()=>{};},
    processJobs,
    recordEvent,
    createIntelligenceActionLink,
    process_intelligence_notification_jobs
  });
}
