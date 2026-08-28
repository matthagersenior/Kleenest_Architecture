const CONTROLLER_ROLES=new Set(['owner','admin','manager','fleet_owner','fleet_manager','enterprise_owner','enterprise_admin','enterprise_manager']);
const normalize=v=>String(v??'').trim().toLowerCase().replace(/[-\s]+/g,'_');
export function normalizeFleetRole(value){return normalize(value)}
export function fleetAccessState({isPlatformOwner=false,role='',businessTier='',canObserve=false}={}){
  if(isPlatformOwner)return Object.freeze({observe:true,operate:true,configure:true,reason:'platform_owner'});
  const normalizedRole=normalizeFleetRole(role);const tier=normalize(businessTier);
  const observe=Boolean(canObserve)||['fleet','business_fleet','business_enterprise','enterprise'].includes(tier)||normalizedRole.includes('fleet')||normalizedRole.includes('enterprise');
  const controller=CONTROLLER_ROLES.has(normalizedRole);
  return Object.freeze({observe,operate:observe&&controller,configure:observe&&controller,reason:controller?'controller_role':observe?'workspace_member':'no_fleet_access'});
}
export function fleetMutationAllowed(access){return Boolean(access?.operate)}
export function fleetConfigurationAllowed(access){return Boolean(access?.configure)}
export const FLEET_ACCESS_LEVELS=Object.freeze({observe:'observe',operate:'operate',configure:'configure'});
