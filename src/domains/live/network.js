export const LIVE_EVENT_TYPES=Object.freeze({USER_LOCATION_VIEWED:'user.location_viewed',USER_DIRECTIONS_REQUESTED:'user.directions_requested',USER_ROUTE_STARTED:'user.route_started',USER_APPROACHING_LOCATION:'user.approaching_location',USER_ARRIVED:'user.arrived',USER_DEPARTED:'user.departed',QR_CHECK_IN:'user.qr_check_in',QR_SCANNED:'user.qr_scanned',QR_REDEEMED:'user.qr_redeemed',LOCATION_FAVORITED:'user.location_favorited',LOCATION_UNFAVORITED:'user.location_unfavorited',LOCATION_VERIFIED:'location.verified',LOCATION_STALE:'location.stale',LOCATION_CONFLICT:'location.conflict',BUSINESS_OFFER_STARTED:'business.offer_started',BUSINESS_OFFER_REDEEMED:'business.offer_redeemed',CAMPAIGN_CONVERTED:'business.campaign_converted',VEHICLE_ENTERED_ZONE:'fleet.vehicle_entered_zone',VEHICLE_ARRIVED:'fleet.vehicle_arrived',VEHICLE_DEPARTED:'fleet.vehicle_departed',FLEET_ROUTE_STARTED:'fleet.route_started',ROUTE_CHANGED:'fleet.route_changed',TASK_COMPLETED:'fleet.task_completed'});
export function createLiveNetworkService(client){
 if(!client)throw new Error('Supabase client is required.');
 const requireUser=async()=>{const{data:{user},error}=await client.auth.getUser();if(error)throw error;if(!user)throw new Error('Sign in to continue.');return user;};
 const normalizePayload=payload=>payload?.new??payload?.record??payload??null;
 const publish=async({type,locationId=null,payload={},actorType='user',actorId=null,shareFleet=true}={})=>{
  const user=await requireUser();
  if(!Object.values(LIVE_EVENT_TYPES).includes(type))throw new Error(`Unsupported live event type: ${type}`);
  const {data,error}=await client.rpc('publish_live_network_event',{p_event_type:type,p_location_id:locationId,p_actor_type:actorType,p_actor_id:actorId||user.id,p_payload:{...payload,share_fleet:shareFleet}});
  if(error)throw error;
  const event=normalizePayload(data);
  window.dispatchEvent(new CustomEvent('kleenest:live-network-event',{detail:event}));
  return event;
 };
 return Object.freeze({publish,list:async({locationId=null,types=null,limit=100,before=null}={})=>{const safeLimit=Math.min(Math.max(Number(limit)||100,1),1000);let query=client.from('live_network_events').select('id,event_type,location_id,actor_type,actor_id,payload,created_at').order('created_at',{ascending:false}).limit(safeLimit);if(locationId)query=query.eq('location_id',locationId);if(types?.length)query=query.in('event_type',types);if(before)query=query.lt('created_at',before);const{data,error}=await query;if(error)throw error;return data??[];},subscribe:({locationId=null,onEvent}={})=>{if(typeof onEvent!=='function')throw new Error('onEvent callback is required.');const channel=client.channel(`live-network-${locationId||'global'}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'live_network_events',...(locationId?{filter:`location_id=eq.${locationId}`}:{})},payload=>{onEvent(normalizePayload(payload));window.dispatchEvent(new CustomEvent('kleenest:live-network-event',{detail:normalizePayload(payload)}));}).subscribe();return()=>client.removeChannel(channel);}});
}
