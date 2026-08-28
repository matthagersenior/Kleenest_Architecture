const CONTROLLER_ROLES=new Set(['owner','admin','manager','fleet_owner','fleet_manager','enterprise_owner','enterprise_admin','enterprise_manager']);
const OBSERVER_TIERS=new Set(['fleet','business_fleet','business_enterprise','enterprise']);
const TARGET_KINDS=Object.freeze(['fleet','driver','vehicle','route']);
const normalize=v=>String(v??'').trim().toLowerCase().replace(/[-\s]+/g,'_');
export function normalizeFleetRole(value){return normalize(value)}
export function isFleetControllerRole(value){return CONTROLLER_ROLES.has(normalize(value))}
export function fleetTargetKinds(){return TARGET_KINDS.slice()}
export function fleetAccessLabel(access={}){if(access.configure)return 'Fleet controller';if(access.observe)return 'Fleet viewer';return 'No Fleet access'}
export function fleetAccessState({isPlatformOwner=false,role='',businessTier='',canObserve=false,canOperate=false,canConfigure=false}={}){
  if(isPlatformOwner)return Object.freeze({observe:true,operate:true,configure:true,reason:'platform_owner'});
  const normalizedRole=normalizeFleetRole(role);const tier=normalize(businessTier);
  const observe=Boolean(canObserve)||OBSERVER_TIERS.has(tier)||normalizedRole.includes('fleet')||normalizedRole.includes('enterprise');
  const controller=isFleetControllerRole(normalizedRole);
  return Object.freeze({observe,operate:Boolean(canOperate)||Boolean(observe&&controller),configure:Boolean(canConfigure)||Boolean(observe&&controller),reason:canConfigure||canOperate||controller?'controller_role':observe?'workspace_member':'no_fleet_access'});
}
export function fleetMutationAllowed(access){return Boolean(access?.operate)}
export function fleetConfigurationAllowed(access){return Boolean(access?.configure)}
export const FLEET_ACCESS_LEVELS=Object.freeze({observe:'observe',operate:'operate',configure:'configure'});
