import { LIVE_EVENT_TYPES } from '../live/network.js';

export function createIntelligenceOutcomeChainService(client,{convergence,actions,notifications,analytics}={}){
  if(!client)throw new Error('Supabase client is required.');
  const emit=(name,detail)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))};
  const rpc=async(name,args={})=>{const{data,error}=await client.rpc(name,args);if(error)throw error;return data;};
  const recordOutcome=async({actionId,locationId,businessId,outcomeType,status='completed',metadata={}}={})=>{
    if(!actionId)throw new Error('Intelligence action is required.');
    const result=await rpc('record_intelligence_action_outcome',{p_action_id:actionId,p_location_id:locationId||null,p_business_id:businessId||null,p_outcome_type:outcomeType||'completed',p_status:status,p_metadata:metadata});
    emit('kleenest:intelligence-outcome',{actionId,locationId,businessId,outcomeType,status,result});
    return result;
  };
  const execute=async({actionId,locationId,businessId,metadata={}}={})=>{
    const result=await (actions?.execute?actions.execute(actionId):rpc('execute_intelligence_action',{p_action_id:actionId}));
    emit('kleenest:intelligence-action-executed',{actionId,locationId,businessId,result});
    return result;
  };
  const complete=async({actionId,locationId,businessId,outcomeType='completed',metadata={}}={})=>{
    const result=await (actions?.complete?actions.complete(actionId,metadata):rpc('complete_intelligence_action',{p_action_id:actionId,p_metadata:metadata}));
    const outcome=await recordOutcome({actionId,locationId,businessId,outcomeType,metadata,result});
    return {result,outcome};
  };
  const signal=async({locationId,eventType,title,body,payload={},dedupeKey=null}={})=>{
    const result=convergence?.publishLocationSignal?await convergence.publishLocationSignal({locationId,eventType,title,body,payload,dedupeKey}):await rpc('publish_intelligence_location_event',{p_location_id:locationId,p_event_type:eventType,p_title:title,p_body:body,p_payload:payload,p_radius_m:500,p_dedupe_key:dedupeKey});
    emit('kleenest:intelligence-signal',{locationId,eventType,result});
    return result;
  };
  return Object.freeze({execute,complete,recordOutcome,signal,process:async(limit=25)=>convergence?.processJobs?convergence.processJobs(limit):{notifications:0,actions:0}});
}
