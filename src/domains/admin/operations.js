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
    controlPlaneSnapshot:profile=>ownerRpc(profile,'admin_control_plane_snapshot'),
    controlPlaneHistory:(profile,limit=50)=>ownerRpc(profile,'admin_control_plane_history',{p_limit:Math.min(Math.max(Number(limit)||50,1),200)}),
    nationalIngestionStatus:profile=>ownerRpc(profile,'admin_national_ingestion_status'),
    overview:profile=>ownerRpc(profile,'admin_get_overview'),
    integrity:profile=>ownerRpc(profile,'admin_data_integrity_summary'),
    pendingBusinesses:profile=>ownerRpc(profile,'admin_list_pending_businesses'),
    reports:profile=>ownerRpc(profile,'admin_list_reports'),
    reviewReports:(profile,status='pending')=>ownerRpc(profile,'admin_list_review_reports',{p_status:status}),
    resolveReviewReport:(profile,reportId,resolution,reason,reviewStatus=null)=>ownerRpc(profile,'admin_resolve_review_report',{p_report_id:reportId,p_resolution:resolution,p_reason:reason,p_review_status:reviewStatus}),
    moderateReview:(profile,reviewId,status,reason)=>ownerRpc(profile,'moderate_review',{p_review_id:reviewId,p_new_status:status,p_reason:reason}),
    reviewModerationHistory:(profile,reviewId)=>ownerRpc(profile,'admin_review_moderation_history',{p_review_id:reviewId}),
    searchUsers:(profile,query)=>ownerRpc(profile,'admin_user_search',{p_query:query??''}),
    setAccountCapabilities:(profile,targetUserId,payload={})=>ownerRpc(profile,'admin_set_account_capabilities',{p_target_user_id:targetUserId,p_role:payload.role??null,p_subscription_tier:payload.subscriptionTier??null,p_is_business_user:payload.isBusinessUser??null,p_is_admin:payload.isAdmin??null,p_is_demo_test:payload.isDemoTest??null,p_reason:payload.reason??null}),
    setUserAccess:(profile,targetUserId,payload={})=>ownerRpc(profile,'admin_set_user_access',{p_target_user_id:targetUserId,p_is_admin:payload.isAdmin??false,p_role:payload.role??'customer',p_subscription_tier:payload.subscriptionTier??'free',p_is_business_user:payload.isBusinessUser??false,p_reason:payload.reason??'Admin access change'}),
    setBusinessTier:(profile,businessId,tier)=>ownerRpc(profile,'admin_set_business_tier',{p_business_id:businessId,p_tier:tier}),
    getBusinessAccess:(profile,businessId)=>ownerRpc(profile,'admin_get_business_access',{p_business_id:businessId}),
    setBusinessAccess:(profile,businessId,tier,payload={})=>ownerRpc(profile,'admin_set_business_access',{p_business_id:businessId,p_tier:tier,p_fleet_enabled:Boolean(payload.fleetEnabled),p_enterprise_enabled:Boolean(payload.enterpriseEnabled),p_reason:payload.reason??'Owner business membership change'}),
    setBusinessVerification:(profile,businessId,status)=>ownerRpc(profile,'admin_set_business_verification',{p_business_id:businessId,p_status:status}),
    crud:async(profile,resource,action,id=null,payload={})=>{const featureCode=`admin_crud:${resource}:${action}`;if(!/^[-_a-z0-9]+$/.test(String(resource??''))){await recordOutcome(featureCode,'blocked',{resource,action,reason:'invalid_resource'});throw new Error('Invalid admin resource.');}try{const value=await ownerRpc(profile,'admin_crud_gateway',{p_resource:resource,p_action:action,p_id:id,p_payload:payload});await recordOutcome(featureCode,'allowed',{resource,action});return value}catch(error){await recordOutcome(featureCode,'blocked',{resource,action,error:error?.message||String(error)});throw error;}},
    previewTiers:()=>Object.freeze(['free','premium','family','business','fleet','enterprise']),
    getControlCapabilities:profile=>{requireOwner(profile);return Object.freeze({readAll:true,crud:true,tierPreview:true,diagnostics:true,audit:true,accountCapabilities:true,businessTier:true,businessAccess:true,businessVerification:true,userAccess:true,operationalCapabilityCatalog:true,backendResourceCatalog:true,publicDataCatalog:true,nationalIngestionStatus:true,reviewModeration:true,reviewReports:true,controlPlaneSnapshot:true,controlPlaneHistory:true});},
    resourceCatalog:()=>Object.freeze(['profiles','families','family_members','businesses','fleets','locations','location_evidence','routes','campaigns','contests','subscriptions','support_requests','activity_events','notifications','partner_networks','partner_campaigns','partner_allocations','external_data_sources','external_data_datasets','external_location_records','external_observations','national_ingestion_markets','national_ingestion_source_policies','national_ingestion_runs']),
    operationalCapabilityCatalog:profile=>ownerRpc(profile,'admin_operational_capability_catalog'),
    backendResourceCatalog:profile=>ownerRpc(profile,'admin_backend_resource_catalog'),
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
