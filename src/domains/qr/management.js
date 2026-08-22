export function createQrManagementService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    create:(locationId,label,purpose,actionType,singleUse=false,maxRedemptions=1)=>rpc('create_business_qr',{p_location_id:locationId,p_label:label,p_purpose:purpose,p_action_type:actionType,p_single_use:singleUse,p_max_redemptions:maxRedemptions}),
    createCustom:(businessId,locationId,input)=>rpc('business_create_custom_qr',{p_business_id:businessId,p_location_id:locationId,p_label:input.label,p_purpose:input.purpose,p_action_type:input.actionType,p_action_payload:input.actionPayload??{},p_customization:input.customization??{},p_single_use:input.singleUse??false,p_max_redemptions:input.maxRedemptions??1}),
    setActive:(qrId,active)=>rpc('set_qr_active',{p_qr_id:qrId,p_active:active}),
    customize:(locationId,label,customization)=>rpc('set_location_qr_customization',{p_location_id:locationId,p_label:label,p_customization:customization??{}}),
    engagementProgram:(qrCodeId,input)=>rpc('create_qr_engagement_program',{p_qr_code_id:qrCodeId,p_program_type:input.programType,p_name:input.name,p_description:input.description??null,p_reward_config:input.rewardConfig??{},p_trigger_count:input.triggerCount??1}),
    engagementPrograms:(qrCodeId)=>rpc('list_qr_engagement_programs',{p_qr_code_id:qrCodeId}),
    attribution:(code,actionType,source,metadata={})=>rpc('record_qr_attribution',{p_code:code,p_action_type:actionType,p_source:source,p_metadata:metadata}),
    consumeSingleUse:(code,userId)=>rpc('consume_single_use_qr',{p_code:code,p_user_id:userId}),
    redeem:(code)=>rpc('redeem_qr_code',{p_code:code}),
    resolveAction:(code)=>rpc('resolve_custom_qr_action',{p_qr_code:code}),
  });
}
