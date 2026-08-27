import { isPlatformOwner } from '../entitlements/access.js';

export function createAdminOperationsService(client,{capabilityCoverage=null}={}){
  if(!client)throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const invoke=(name,body={})=>client.functions.invoke(name,{body}).then(({data,error})=>{if(error)throw error;if(data?.ok===false||data?.error)throw new Error(data.error||`${name} returned an error.`);return data;});
  const requireOwner=profile=>{if(!isPlatformOwner(profile))throw new Error('Platform owner access required.');};
  const ownerRpc=(profile,name,args={})=>{requireOwner(profile);return rpc(name,args);};
  const ownerFunction=(profile,name,body={})=>{requireOwner(profile);return invoke(name,body);};
  const recordOutcome=async(featureCode,outcome,metadata={})=>{try{await capabilityCoverage?.record({featureCode,outcome,destination:'/admin/crud',metadata})}catch{}};
  return Object.freeze({
    authorization:profile=>ownerRpc(profile,'admin_authorization_v1'),
    overview:profile=>ownerRpc(profile,'admin_get_overview'),
    integrity:profile=>ownerRpc(profile,'admin_data_integrity_summary'),
    pendingBusinesses:profile=>ownerRpc(profile,'admin_list_pending_businesses'),
    reports:profile=>ownerRpc(profile,'admin_list_reports'),
    searchUsers:(profile,query)=>ownerRpc(profile,'admin_user_search',{p_query:query??''}),
    setAccountCapabilities:(profile,targetUserId,payload={})=>ownerRpc(profile,'admin_set_account_capabilities',{p_target_user_id:targetUserId,p_role:payload.role??null,p_subscription_tier:payload.subscriptionTier??null,p_is_business_user:payload.isBusinessUser??null,p_is_admin:payload.isAdmin??null,p_is_demo_test:payload.isDemoTest??null,p_reason:payload.reason??null}),
    setUserAccess:(profile,targetUserId,payload={})=>ownerRpc(profile,'admin_set_user_access',{p_target_user_id:targetUserId,p_is_admin:payload.isAdmin??false,p_role:payload.role??'customer',p_subscription_tier:payload.subscriptionTier??'free',p_is_business_user:payload.isBusinessUser??false,p_reason:payload.reason??'Admin access change'}),
    setBusinessTier:(profile,businessId,tier)=>ownerRpc(profile,'admin_set_business_tier',{p_business_id:businessId,p_tier:tier}),
    getBusinessAccess:(profile,businessId)=>ownerRpc(profile,'admin_get_business_access',{p_business_id:businessId}),
    setBusinessAccess:(profile,businessId,tier,payload={})=>ownerRpc(profile,'admin_set_business_access',{p_business_id:businessId,p_tier:tier,p_fleet_enabled:Boolean(payload.fleetEnabled),p_enterprise_enabled:Boolean(payload.enterpriseEnabled),p_reason:payload.reason??'Owner business membership change'}),
    setBusinessVerification:(profile,businessId,status)=>ownerRpc(profile,'admin_set_business_verification',{p_business_id:businessId,p_status:status}),
    crud:async(profile,resource,action,id=null,payload={})=>{const featureCode=`admin_crud:${resource}:${action}`;if(!/^[-_a-z0-9]+$/.test(String(resource??''))){await recordOutcome(featureCode,'blocked',{resource,action,reason:'invalid_resource'});throw new Error('Invalid admin resource.');}try{const value=await ownerRpc(profile,'admin_crud_gateway',{p_resource:resource,p_action:action,p_id:id,p_payload:payload});await recordOutcome(featureCode,'allowed',{resource,action});return value}catch(error){await recordOutcome(featureCode,'blocked',{resource,action,error:error?.message||String(error)});throw error;}},
    previewTiers:()=>Object.freeze(['free','premium','family','business','fleet','enterprise']),
    getControlCapabilities:profile=>{requireOwner(profile);return Object.freeze({readAll:true,crud:true,tierPreview:true,diagnostics:true,audit:true,accountCapabilities:true,businessTier:true,businessAccess:true,businessVerification:true,userAccess:true,operationalCapabilityCatalog:true,publicDataCatalog:true});},
    resourceCatalog:()=>Object.freeze(['profiles','families','family_members','businesses','fleets','locations','location_evidence','routes','campaigns','contests','subscriptions','support_requests','activity_events','notifications','partner_networks','partner_campaigns','partner_allocations','external_data_sources','external_data_datasets','external_location_records','external_observations']),
    operationalCapabilityCatalog:profile=>ownerRpc(profile,'admin_operational_capability_catalog'),
    invoke:(profile,operation,args={})=>{if(typeof operation!=='string'||!operation.startsWith('admin_'))throw new Error('Owner operations must use an admin_ RPC.');return ownerRpc(profile,operation,args);},
    health:profile=>ownerFunction(profile,'admin-tools',{action:'health'}),
    refreshDerived:profile=>ownerFunction(profile,'admin-tools',{action:'refresh-all',limit:100}),
    locationQuality:profile=>ownerFunction(profile,'admin-tools',{action:'location-quality'}),
    backfillAddresses:(profile,limit=25)=>ownerFunction(profile,'backfill-location-addresses',{limit}),
    ingestMarket:(profile,source,market)=>{const city=String(market??'').toUpperCase();const normalized=String(source??'osm').toLowerCase();if(!city)throw new Error('Market is required.');return ownerFunction(profile,'market-bathroom-ingest-v5',{action:normalized==='datagov'?'datagov-city':'osm-city',city});},
    ingestTopMarkets:(profile,source='osm')=>ownerFunction(profile,'market-bathroom-ingest-v5',{action:String(source).toLowerCase()==='datagov'?'datagov-top-10':'osm-top-10'}),
    catalogPublicDatasets:(profile,limitPerTerm=50)=>ownerFunction(profile,'public-data-catalog',{action:'discover',limit_per_term:Math.min(Math.max(Number(limitPerTerm)||50,1),100)}),
  });
}
