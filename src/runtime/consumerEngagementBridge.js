// Consumer-side event bridge. Domain services remain authoritative; this module only
// translates successful user-facing actions into refresh signals for connected surfaces.
const EVENTS={
 checkin:['kleenest:checkin-completed','kleenest:location-activity','kleenest:rewards-updated','kleenest:progression-updated'],
 evidence:['kleenest:evidence-created','kleenest:location-activity','kleenest:progression-updated'],
 review:['kleenest:review-created','kleenest:location-activity','kleenest:rewards-updated','kleenest:progression-updated'],
 game:['kleenest:game-completed','kleenest:rewards-updated','kleenest:progression-updated','kleenest:activity-updated'],
 challenge:['kleenest:challenge-updated','kleenest:rewards-updated','kleenest:progression-updated','kleenest:activity-updated'],
 route:['kleenest:route-updated','kleenest:location-activity'],
 routeStopArrived:['kleenest:route-stop-arrived','kleenest:route-updated','kleenest:location-activity','kleenest:progression-updated'],
};
export function publishConsumerActivity(kind,detail={}){for(const name of EVENTS[kind]||[]){window.dispatchEvent(new CustomEvent(name,{detail:{...detail,source:kind}}))}}
export function withConsumerActivity(promise,kind,detail={}){return Promise.resolve(promise).then(result=>{publishConsumerActivity(kind,{...detail,result});return result})}
export const consumerActivityEvents=EVENTS;
