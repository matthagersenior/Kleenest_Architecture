export function createIntelligenceActionService(client){
  if(!client)throw new Error('Supabase client is required.');
  const rpc=(name,args)=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    execute:actionId=>rpc('execute_intelligence_action',{p_action_id:actionId}),
    complete:(actionId,metadata={})=>rpc('complete_intelligence_action',{p_action_id:actionId,p_metadata:metadata}),
    createLink:(locationId,businessId,surface,signalType,actionType,metadata={})=>rpc('create_intelligence_action_link',{p_location_id:locationId,p_business_id:businessId,p_surface:surface,p_signal_type:signalType,p_action_type:actionType,p_metadata:metadata})
  });
}
