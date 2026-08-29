import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const errors=[];
const runtime=read('runtime/CanonicalAppRuntime.jsx');
const crud=read('runtime/OwnerCrudWorkbench.jsx');
const membership=read('runtime/OwnerMembershipControls.jsx');
const intelligence=read('runtime/OwnerIntelligenceLab.jsx');
const ownerService=read('domains/intelligence/owner.js');
const actions=read('domains/intelligence/actions.js');
const appContext=read('AppContext.jsx');
const requiredRoutes=['/owner','/owner/data','/owner/preview','/owner/audit','/owner/intelligence','/owner/reports','/owner/reports/history'];
for(const route of requiredRoutes)if(!runtime.includes(`path="${route}"`))errors.push(`missing owner route: ${route}`);
for(const token of ['services.admin.invoke(profile','services.admin.crud(profile','services.admin.searchUsers(profile','services.admin.setAccountCapabilities(profile','services.admin.setBusinessAccess(profile'])if(!crud.includes(token)&&!membership.includes(token))errors.push(`missing governed admin service wiring: ${token}`);
// The component consumes the service namespace while the factory defines its
// capabilities. Validate the boundary across both sides instead of requiring
// the consumer's property-access expression to appear in owner.js itself.
if(!intelligence.includes('services.ownerIntelligence')||!appContext.includes('ownerIntelligence:'))errors.push('missing owner intelligence service boundary');
for(const token of ['businessGrowthAnalytics','businessSummaryAnalytics','businessEngagementAnalytics','businessCampaignAnalytics','businessRoiAnalytics','businessBenchmarkAnalytics','businessGrowthActions','fleetDashboardSummary','fleetMetricCapabilities','fleetServiceOpportunities','enterpriseNetworkMetrics','enterpriseCampaignRoi','enterprisePartnerRoi'])if(!intelligence.includes(token)||!ownerService.includes(token))errors.push(`missing intelligence wiring: ${token}`);
for(const token of ['execute_intelligence_action','complete_intelligence_action','process_intelligence_action_jobs','create_intelligence_notification']){const files=['domains/intelligence/actions.js','domains/intelligence/convergence.js','domains/notifications/intelligence.js'];if(!files.some(f=>read(f).includes(token)))errors.push(`missing intelligence loop capability: ${token}`)}
for(const token of ['intelligenceActions','execute','complete','action_id','/intelligence/actions/'])if(!intelligence.includes(token))errors.push(`missing direct intelligence action UI wiring: ${token}`);
if(!membership.includes('/owner/data?resource=profiles')||!membership.includes('/owner/data?resource=businesses'))errors.push('membership controls are not linked to governed CRUD workbenches');
const report={generatedAt:new Date().toISOString(),status:errors.length?'attention':'ok',checks:{ownerRoutes:requiredRoutes.length,crudGovernedServiceCalls:true,membershipControls:true,intelligenceServiceSurface:true,intelligenceLoop:true,directIntelligenceActions:true},errors};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
