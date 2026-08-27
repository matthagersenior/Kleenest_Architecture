const safeArray=value=>Array.isArray(value)?value:[];
export function createEnterpriseCommerceConvergenceService({enterprise,partners,qrAttribution,commerce,analytics,intelligence,reporting}={}){
  if(!enterprise||!partners||!qrAttribution||!commerce)throw new Error('Enterprise commerce dependencies are required.');
  const snapshot=async({businessId,networkId,start,end}={})=>{
    const [network,campaigns,members,partnerBusinesses,benchmark,allocationRoi]=await Promise.all([
      networkId?enterprise.get(networkId,start,end):null,
      networkId?enterprise.listCampaigns(networkId):[],
      networkId?enterprise.listNetworkMembers(networkId):[],
      businessId?enterprise.listPartnerBusinesses(businessId):[],
      networkId?enterprise.benchmark(networkId,start,end):null,
      networkId?enterprise.allocationRoi(networkId,start,end):null
    ]);
    return Object.freeze({network,campaigns:safeArray(campaigns),members:safeArray(members),partnerBusinesses:safeArray(partnerBusinesses),benchmark,allocationRoi});
  };
  const campaignOutcome=async({campaignId,partnerBusinessId,metrics={}})=>partners.recordCampaignOutcome(campaignId,partnerBusinessId,metrics);
  const allocation=async({networkId,partnerBusinessId,campaignId,type='promotion',quantity=0,budgetCents=0,rationale=''})=>enterprise.createAllocation(networkId,partnerBusinessId,campaignId,type,quantity,budgetCents,rationale);
  const activateAllocation=async allocationId=>enterprise.activateAllocation(allocationId);
  const trackQrEngagement=async payload=>qrAttribution.recordEngagement(payload);
  const product=async code=>commerce.getProduct(code);
  const checkout=async(planCode,options={})=>commerce.createCheckout(planCode,options);
  const roi=async({networkId,campaignId,start,end}={})=>{
    const [network,campaign]=await Promise.all([
      networkId?enterprise.allocationRoi(networkId,start,end):null,
      campaignId?enterprise.campaignRoi(campaignId,start,end):null
    ]);
    return Object.freeze({network,campaign});
  };
  const report=async({businessId,networkId,start,end}={})=>{
    if(typeof reporting?.businessSummary==='function'&&businessId)return reporting.businessSummary(businessId,start,end);
    if(typeof reporting?.enterpriseSummary==='function'&&networkId)return reporting.enterpriseSummary(networkId,start,end);
    return snapshot({businessId,networkId,start,end});
  };
  return Object.freeze({snapshot,campaignOutcome,allocation,activateAllocation,trackQrEngagement,product,checkout,roi,report});
}
