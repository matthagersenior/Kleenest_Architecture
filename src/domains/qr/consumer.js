export function createConsumerQrService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function requireUser(){const{data:{user},error}=await client.auth.getUser();if(error)throw error;if(!user)throw new Error('Sign in to continue.');return user;}
  async function emit(eventType,payload){try{await client.rpc('record_qr_engagement_event',{p_event_type:eventType,p_payload:payload??{}});}catch{}}
  return Object.freeze({
    consumeSingleUse:async code=>{const user=await requireUser();if(!code)throw new Error('QR code is required.');const{data,error}=await client.rpc('consume_single_use_qr',{p_code:code,p_user_id:user.id});if(error)throw error;await emit('single_use_consumed',{code,qr:data});window.dispatchEvent(new CustomEvent('kleenest:qr-engagement',{detail:{type:'single_use_consumed',result:data}}));return data;},
    redeem:async code=>{await requireUser();if(!code)throw new Error('QR code is required.');const{data,error}=await client.rpc('redeem_qr_code',{p_code:code});if(error)throw error;await emit('redeemed',{code,qr:data});window.dispatchEvent(new CustomEvent('kleenest:qr-engagement',{detail:{type:'redeemed',result:data}}));return data;},
    recordScan:async(payload={})=>{await requireUser();const{data,error}=await client.rpc('record_qr_engagement_event',{p_event_type:'scan',p_payload:payload});if(error)throw error;window.dispatchEvent(new CustomEvent('kleenest:qr-engagement',{detail:{type:'scan',result:data}}));return data;}
  });
}