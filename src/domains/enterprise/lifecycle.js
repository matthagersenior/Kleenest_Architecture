const arr=value=>Array.isArray(value)?value:[];
const idOf=value=>value?.business_id??value?.id??'';
const active=value=>String(value?.status??'active').toLowerCase()==='active';
const firstId=(value,...keys)=>{for(const key of keys){if(value?.[key])return String(value[key]);}return '';};

export function createEnterpriseLifecycleService(services){
  if(!services?.enterpriseIntelligence||!services?.partners)throw new Error('Enterprise services are required.');

  const resolveContext=({selectedBusinessId,memberships=[]}={})=>{
    const rows=arr(memberships).filter(active);
    const selected=rows.find(row=>String(idOf(row))===String(selectedBusinessId||''));
    const membership=selected||rows[0]||null;
    return Object.freeze({
      membership,
      partnerBusinessId:firstId(membership,'business_id','partner_business_id'),
      agreementId:firstId(membership,'agreement_id','partner_agreement_id'),
      programId:firstId(membership,'partner_program_id','program_id','partner_program_uuid')
    });
  };

  const campaignId=campaign=>firstId(campaign,'campaign_id','id');

  return Object.freeze({
    resolveContext,
    campaignId,
    createCampaign:(networkId,name,type='engagement',goal=null)=>services.enterpriseIntelligence.createCampaign(networkId,name,type,goal),
    activateCampaign:id=>services.enterpriseIntelligence.activateCampaign(id),
    pauseCampaign:id=>services.enterpriseIntelligence.pauseCampaign(id),
    recordCampaignOutcome:(id,businessId,metrics={})=>services.enterpriseIntelligence.recordCampaignOutcome(id,businessId,metrics),
    recordNetworkMetric:(networkId,date,metrics={})=>services.enterpriseIntelligence.recordMetric(networkId,date,metrics),
    requestAgreement:(programId,businessId)=>services.partners.requestAgreement(programId,businessId),
    acceptAgreement:id=>services.partners.acceptAgreement(id),
    invitePartner:(networkId,businessId)=>services.enterprise.invitePartner(networkId,businessId),
    setMembershipStatus:(membershipId,status)=>services.enterprise.setMembershipStatus(membershipId,status)
  });
}
