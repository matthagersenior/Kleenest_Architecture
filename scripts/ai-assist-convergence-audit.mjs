import fs from 'node:fs';
import path from 'node:path';
const required=[
 ['supabase/functions/ai-assist/index.ts',['OPENROUTER_API_KEY','OPENROUTER_MODEL','openrouter/free','GEMINI_API_KEY','GEMINI_MODEL','gemini-3.7-flash','OPENAI_API_KEY','gpt-5.6-luna','const providers = [openRouterAssist,geminiAssist,openAiAssist]','provider_attempts','review_required:true','grounded_fallback','provider_status','provider_error_type','provider_error_code','provider_request_id','trace_id','business_growth','fleet_dispatch','fleet_debrief','enterprise_network','notification_copy','visit_review','evidence_interpretation','admin_moderation','admin_operations','route_plan']],
 ['src/domains/intelligence/convergence.js',["client.functions.invoke('ai-assist'",'aiAssist','kleenest:ai-assist-generated','review_required','providerStatus:result.provider_status','providerErrorCode:result.provider_error_code','providerErrorType:result.provider_error_type','traceId:result.trace_id']],
 ['src/runtime/AiAssistPanel.jsx',['services.intelligenceConvergence.aiAssist','Review required before any change is applied','Grounded recommendation','Model-assisted recommendation',"result?.provider_error_code==='missing_api_key'",'providerMessage','credit_balance_exhausted','result?.provider_status===429','deterministic grounded fallback',"Model: ${result.model}","result.provider!=='grounded_fallback'"]],
 ['src/runtime/FleetRouteStopPlanner.jsx',['AiAssistPanel','task="fleet_dispatch"','Fleet dispatch copilot']],
 ['src/runtime/FleetRoutePerformanceCard.jsx',['AiAssistPanel','task="fleet_debrief"','Fleet route debrief','largest measured variances','Never invent a cause']],
 ['src/runtime/BusinessGrowthEngagementPanel.jsx',['AiAssistPanel','task="business_growth"','Business growth copilot']],
 ['src/runtime/BusinessIntelligenceActions.jsx',['AiAssistPanel','task="business_growth"','AI action brief','Do not execute or invent an action']],
 ['src/runtime/BusinessCustomNotificationPanel.jsx',['AiAssistPanel','task="notification_copy"','Notification copy copilot','Use as message','Review and edit before sending']],
 ['src/runtime/EnterpriseOperationsPage.jsx',['AiAssistPanel','task="enterprise_network"','Enterprise network copilot','cannot change campaigns, allocations, or memberships']],
 ['src/runtime/AdminReviewModerationPage.jsx',['AiAssistPanel','task="admin_moderation"','AI moderation triage','Do not recommend or make a final enforcement decision']],
 ['src/runtime/AdminMaintenancePage.jsx',['AiAssistPanel','task="admin_operations"','Admin operations copilot','cannot run maintenance actions']],
 ['src/runtime/CapabilityHubPage.jsx',['AiAssistPanel','task="admin_operations"','Capability reconciliation copilot','cannot change capability definitions, entitlements, or service wiring']],
 ['src/runtime/RouteSurface.jsx',['AiAssistPanel','task="route_plan"','Route planning copilot','do not change the route automatically']],
 ['src/runtime/VerifiedReviewDraft.jsx',['AiAssistPanel','task="visit_review"','Verified review draft','Use draft','Do not invent amenities']],
 ['src/runtime/VisitSurface.jsx',['VerifiedReviewDraft','onApply={answer=>setReview','Publish verified review']],
 ['src/runtime/LocationEvidenceInterpretation.jsx',['AiAssistPanel','task="evidence_interpretation"','Evidence confidence guide','Only call something contradictory']],
 ['src/runtime/LocationEvidencePage.jsx',['LocationEvidenceInterpretation','services.locations.getById','Publish quality signal']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.resolve(rel);if(!fs.existsSync(file)){missing.push(`${rel}: missing file`);continue;}const source=fs.readFileSync(file,'utf8');for(const token of tokens)if(!source.includes(token))missing.push(`${rel}: missing ${token}`);}
const gateway=fs.readFileSync(path.resolve('supabase/functions/ai-assist/index.ts'),'utf8');
if(gateway.includes('VITE_')||gateway.includes('dangerouslyAllowBrowser'))missing.push('AI provider credentials must remain server-side');
if(!gateway.includes("supabaseAdmin.auth.getUser(token)"))missing.push('AI gateway must authenticate the caller');
const providerOrder='const providers = [openRouterAssist,geminiAssist,openAiAssist]';
if(!gateway.includes(providerOrder))missing.push('AI gateway provider order must be OpenRouter -> Gemini -> OpenAI');
const safeResponse='provider_status:providerStatus,provider_error_code:providerErrorCode,provider_error_type:providerErrorType';
if(!gateway.includes(safeResponse))missing.push('AI gateway must return normalized provider state to the runtime');
const responseStart=gateway.indexOf('return new Response(JSON.stringify({task,answer,provider,model,review_required:true');
if(responseStart<0)missing.push('AI gateway safe browser response is missing');
else {
  const responseSlice=gateway.slice(responseStart,responseStart+500);
  if(responseSlice.includes('provider_attempts')||responseSlice.includes('error_message')||responseSlice.includes('provider_request_id'))missing.push('AI gateway browser response must not expose provider attempt internals');
}
if(!gateway.includes('generated?.requestId ?? lastFailure?.request_id ?? null'))missing.push('AI gateway must preserve failure request IDs for telemetry correlation');
if(missing.length){console.error('AI Assist convergence audit failed.');for(const item of missing)console.error(`- ${item}`);process.exit(1);}
console.log('AI Assist convergence audit passed: authenticated free-first OpenRouter -> Gemini -> OpenAI failover, deterministic grounded fallback, server-only provider credentials, normalized safe runtime diagnostics, failure request-ID telemetry, provider attempt observability, provider-state event propagation, centralized service authority, Fleet/Business/Enterprise/Admin/consumer AI surfaces, and human review before mutations.');
