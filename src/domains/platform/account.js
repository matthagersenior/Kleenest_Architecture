export function createPlatformAccountService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    ensureProfile:()=>rpc('ensure_current_user_profile'),
    updateProfile:(changes={})=>rpc('update_my_profile',changes),
    signupProfile:(profile={})=>rpc('ensure_signup_profile',profile),
    subscriptionSummary:()=>rpc('user_subscription_summary'),
    notifications:(limit=50)=>rpc('user_notifications',{p_limit:Number(limit)}),
    markNotificationRead:(notificationId)=>rpc('mark_notification_read',{p_notification_id:notificationId}),
    registerPush:(endpoint,subscription)=>rpc('register_notification_push_subscription',{p_endpoint:endpoint,p_subscription:subscription}),
    removePush:(endpoint)=>rpc('remove_notification_push_subscription',{p_endpoint:endpoint}),
    resolveNearbyRecipients:(locationId,radius=10000)=>rpc('resolve_nearby_notification_recipients',{p_location_id:locationId,p_radius_m:Number(radius)}),
  });
}
