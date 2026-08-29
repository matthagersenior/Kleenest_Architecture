const arr=value=>Array.isArray(value)?value:[];
const idOf=value=>value?.business_id??value?.id??'';
const active=value=>String(value?.status??'active').toLowerCase()==='active';
const firstId=(value,...keys)=>{for(const key of keys){if(value?.[key])return String(value[key]);}return '';};
const emit=(name,detail={})=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}));};

export function createEnterpriseLifecycleService(services){
  if(!services?.enterpriseIntelligence||!services?.partners||!services?.enterprise)throw new Error('Enterprise services are required.');
  const resolveContext=({selectedBusinessId,memberships=[]}={})=>{const rows=arr(memberships).filter(active);const selected=rows.find(row=>String(idOf(row))===String(selectedBusinessId||''));const membership=selected||rows[0]||null;return Object.freeze({membership,partnerBusinessId:firstId(membership,'business_id','partner_business_id'),agreementId:firstId(membership,'agreement_id','partner_agreement_id'),programId:firstId(membership,'partner_program_id','program_id','partner_program_uuid')});};
  const campaignId=campaign=>firstId(campaign,'campaign_id','id');
  const after=async(type,fn,detail={})=>{const result=await fn();const event={type,...detail,result};emit('kleenest:enterprise-updated',event);emit('kleenest:business-updated',{...event,businessId:detail.businessId??detail.partnerBusinessId??null,reason:`enterprise:${type}`});return result;};
  return Object.freeze({
    resolveContext,campaignId,
    listNetworks:businessId=>services.enterprise.listOwnedNetworks(businessId),
    listCampaigns:networkId=>services.enterprise.listCampaigns(networkId),
    listPartners:businessId=>services.enterprise.listPartnerBusinesses(businessId),
    listMembers:networkId=>services.enterprise.listNetworkMembers(networkId),
    createNetwork:name=>after('network_created',()=>services.enterprise.createNetwork(name)),
    createCampaign:(networkId,name,type='engagement',goal=null)=>after('campaign_created',()=>services.enterpriseIntelligence.createCampaign(networkId,name,type,goal),{networkId}),
    activateCampaign:id=>after('campaign_activated',()=>services.enterpriseIntelligence.activateCampaign(id),{campaignId:id}),
    pauseCampaign:id=>after('campaign_paused',()=>services.enterpriseIntelligence.pauseCampaign(id),{campaignId:id}),
    recordCampaignOutcome:(id,businessId,metrics={})=>after('campaign_outcome_recorded',()=>services.enterpriseIntelligence.recordCampaignOutcome(id,businessId,metrics),{campaignId:id,partnerBusinessId:businessId,businessId}),
    recordNetworkMetric:(networkId,date,metrics={})=>after('network_metric_recorded',()=>services.enterpriseIntelligence.recordMetric(networkId,date,metrics),{networkId,date}),
    createAllocation:(networkId,partnerBusinessId,campaignId,type,quantity,budgetCents,rationale)=>after('allocation_created',()=>services.enterprise.createAllocation(networkId,partnerBusinessId,campaignId,type,quantity,budgetCents,rationale),{networkId,partnerBusinessId,businessId:partnerBusinessId,campaignId}),
    activateAllocation:id=>after('allocation_activated',()=>services.enterprise.activateAllocation(id),{allocationId:id}),
    requestAgreement:(programId,businessId)=>after('agreement_requested',()=>services.partners.requestAgreement(programId,businessId),{programId,businessId}),
    acceptAgreement:id=>after('agreement_accepted',()=>services.partners.acceptAgreement(id),{agreementId:id}),
    invitePartner:(networkId,businessId)=>after('partner_invited',()=>services.enterprise.invitePartner(networkId,businessId),{networkId,businessId}),
    setMembershipStatus:(membershipId,status)=>after('membership_status_updated',()=>services.enterprise.setMembershipStatus(membershipId,status),{membershipId,status})
  });
}
