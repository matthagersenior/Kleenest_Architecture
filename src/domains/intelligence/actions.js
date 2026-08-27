export function createIntelligenceActionService(client){
  if(!client)throw new Error('Supabase client is required.');
  const rpc=(name,args)=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const notify=(event,detail)=>{try{window.dispatchEvent(new CustomEvent(event,{detail}))}catch{}}
  const outcome=(phase,actionId,result,metadata={})=>{const detail={phase,actionId,result,metadata,at:new Date().toISOString()};notify('kleenest:intelligence-updated',detail);notify(`kleenest:intelligence-action-${phase}`,detail);return result};
  return Object.freeze({
    execute:async actionId=>{const result=await rpc('execute_intelligence_action',{p_action_id:actionId});return outcome('executed',actionId,result)},
    complete:async(actionId,metadata={})=>{const result=await rpc('complete_intelligence_action',{p_action_id:actionId,p_metadata:metadata});return outcome('completed',actionId,result,metadata)},
    createLink:async(locationId,businessId,surface,signalType,actionType,metadata={})=>{const result=await rpc('create_intelligence_action_link',{p_location_id:locationId,p_business_id:businessId,p_surface:surface,p_signal_type:signalType,p_action_type:actionType,p_metadata:metadata});return outcome('link-created',result?.id||result?.action_id,result,{locationId,businessId,surface,signalType,actionType,...metadata})}
  });
}
