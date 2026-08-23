export const FLEET_WORKSPACE_SECTIONS = Object.freeze(['operations','routes','performance','opportunities','goals']);
const rows=value=>{if(Array.isArray(value))return value;if(!value||typeof value!=='object')return[];for(const key of ['rows','items','places','locations','signals','recommendations','data'])if(Array.isArray(value[key]))return value[key];return Object.values(value).filter(v=>v&&typeof v==='object'&&!Array.isArray(v));};
export function createFleetWorkspaceService({fleet,metrics,maps,live}={}){
 if(!fleet||!metrics||!maps||!live)throw new Error('Canonical Fleet workspace dependencies are required.');
 const loadNetwork=async({latitude,longitude,radiusKm=30,limit=60}={})=>{
  if(latitude==null||longitude==null)return{places:[],signals:[],live:[],recommendations:[]};
  const places=await maps.nearby({latitude,longitude,radiusKm,limit,category:'restroom'});
  const selected=places.filter(p=>p?.location_id||p?.id).slice(0,30);
  const enriched=await Promise.all(selected.map(async place=>{const locationId=place.location_id||place.id;try{const events=await live.list({locationId,limit:50});const recent=events.filter(e=>{const t=Date.parse(e?.created_at||'');return Number.isFinite(t)&&Date.now()-t<=7200000;});const count=types=>recent.filter(e=>types.includes(e.event_type)).length;const signals={demand_score:Math.min(100,Math.round(Number(place.intelligence_score||0)+recent.length*4)),activity_score:Math.min(100,Math.round(recent.length*5)),quality_score:Math.max(0,Math.min(100,Math.round(Number(place.intelligence_score||0)))),observation_count:Number(place.observation_count||0),recent_event_count:recent.length,recent_arrivals:count(['user.arrived']),recent_checkins:count(['user.qr_check_in']),operational_status:count(['location.stale'])?'stale':count(['location.conflict'])?'attention':count(['location.verified'])?'verified':'normal'};return{...place,signals,liveEvents:events};}catch{return{...place,signals:{demand_score:0,activity_score:0,quality_score:Number(place.intelligence_score||0),observation_count:0,recent_event_count:0,operational_status:'normal'},liveEvents:[]};}}));
  const signals=enriched.map(p=>({location_id:p.location_id||p.id,name:p.name,...p.signals}));
  const recommendations=await fleet.recommendationsFromSignals?.(signals)??[];
  return Object.freeze({places:enriched,signals,live:enriched.flatMap(p=>p.liveEvents||[]),recommendations});
 };
 const load=async businessId=>{if(!businessId)throw new Error('Business is required.');const [dashboard,opportunities,configuration,values]=await Promise.all([fleet.dashboard(businessId),fleet.opportunities(businessId),metrics.configuration(businessId),metrics.values(businessId)]);const recommendations=await fleet.recommendations(businessId);return Object.freeze({dashboard,opportunities:rows(opportunities),configuration,values,recommendations});};
 const subscribe=({locationId,onEvent,onRefresh}={})=>{if(!locationId)return()=>{};return live.subscribe({locationId,onEvent:event=>{onEvent?.(event);onRefresh?.(event);}});};
 return Object.freeze({sections:FLEET_WORKSPACE_SECTIONS,load,loadNetwork,loadGoals:businessId=>metrics.configuration(businessId),loadMetricValues:(businessId,asOf)=>metrics.values(businessId,asOf),subscribe});
}
