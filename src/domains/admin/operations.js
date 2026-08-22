import { isPlatformOwner } from '../entitlements/access.js';
export function createAdminOperationsService(client){
  if(!client)throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const requireOwner=profile=>{if(!isPlatformOwner(profile))throw new Error('Platform owner access required.');};
  const ownerRpc=(profile,name,args={})=>{requireOwner(profile);return rpc(name,args);};
  return Object.freeze({
    overview:profile=>ownerRpc(profile,'admin_get_overview'),
    integrity:profile=>ownerRpc(profile,'admin_data_integrity_summary'),
    pendingBusinesses:profile=>ownerRpc(profile,'admin_list_pending_businesses'),
    reports:profile=>ownerRpc(profile,'admin_list_reports'),
    searchUsers:(profile,query)=>ownerRpc(profile,'admin_user_search',{p_query:query??''}),
    setAccountCapabilities:(profile,targetUserId,payload={})=>ownerRpc(profile,'admin_set_account_capabilities',{p_target_user_id:targetUserId,p_role:payload.role??null,p_subscription_tier:payload.subscriptionTier??null,p_is_business_user:payload.isBusinessUser??null,p_is_admin:payload.isAdmin??null,p_is_demo_test:payload.isDemoTest??null,p_reason:payload.reason??null}),
    setUserAccess:(profile,targetUserId,payload={})=>ownerRpc(profile,'admin_set_user_access',{p_target_user_id:targetUserId,p_is_admin:payload.isAdmin??false,p_role:payload.role??'customer',p_subscription_tier:payload.subscriptionTier??'free',p_is_business_user:payload.isBusinessUser??false,p_reason:payload.reason??'Admin access change'}),
    setBusinessTier:(profile,businessId,tier)=>ownerRpc(profile,'admin_set_business_tier',{p_business_id:businessId,p_tier:tier}),
    setBusinessVerification:(profile,businessId,status)=>ownerRpc(profile,'admin_set_business_verification',{p_business_id:businessId,p_status:status}),
    crud:(profile,resource,action,id=null,payload={})=>{if(!/^[-_a-z0-9]+$/.test(String(resource??'')))throw new Error('Invalid admin resource.');return ownerRpc(profile,'admin_crud_gateway',{p_resource:resource,p_action:action,p_id:id,p_payload:payload});},
    previewTiers:()=>Object.freeze(['free','premium','family','business','fleet','enterprise']),
    getControlCapabilities:profile=>{requireOwner(profile);return Object.freeze({readAll:true,crud:true,tierPreview:true,diagnostics:true,audit:true,accountCapabilities:true,businessTier:true,businessVerification:true,userAccess:true});},
    resourceCatalog:()=>Object.freeze(['profiles','families','family_members','businesses','fleets','locations','location_evidence','routes','campaigns','contests','subscriptions','support_requests','activity_events','notifications','partner_networks','partner_campaigns','partner_allocations']),
    invoke:(profile,operation,args={})=>{if(typeof operation!=='string'||!operation.startsWith('admin_'))throw new Error('Owner operations must use an admin_ RPC.');return ownerRpc(profile,operation,args);}
  });
}
