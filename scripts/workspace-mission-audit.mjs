import { CAPABILITY_REGISTRY } from '../src/architecture/capabilityRegistry.js';
import { WORKSPACE_MISSIONS } from '../src/architecture/workspaceMission.js';
import { WORKSPACES, WORKSPACE_NAVIGATION } from '../src/domain/workspaces.js';

const failures=[];
for(const [workspace,mission] of Object.entries(WORKSPACE_MISSIONS)){
  if(!WORKSPACES[workspace])failures.push(`${workspace}: workspace metadata missing`);
  if(!mission.purpose?.trim())failures.push(`${workspace}: purpose missing`);
  if(!mission.primaryOutcomes?.length)failures.push(`${workspace}: primary outcomes missing`);
  if(!mission.requiredDomains?.length)failures.push(`${workspace}: required domains missing`);
  for(const domain of mission.requiredDomains||[]){
    const capability=CAPABILITY_REGISTRY[domain];
    if(!capability){failures.push(`${workspace}: unknown required domain ${domain}`);continue;}
    const exposed=(capability.ui||[]).includes(workspace)||(capability.ui||[]).includes('all');
    if(!exposed)failures.push(`${workspace}: ${domain} is required by mission but not exposed to workspace`);
  }
  if(workspace!=='admin'&&!(WORKSPACE_NAVIGATION[workspace]||[]).length)failures.push(`${workspace}: no navigation surface`);
}

const fleet=WORKSPACE_MISSIONS.fleet;
for(const token of ['assign drivers and vehicles','dispatch locked operational routes','track ETA versus actual','measure stop dwell and TTL','monitor maintenance and alerts']){
  if(!fleet.primaryOutcomes.includes(token))failures.push(`fleet mission missing outcome: ${token}`);
}
const consumer=WORKSPACE_MISSIONS.consumer;
for(const token of ['verify condition and amenities','contribute evidence','earn progression and reputation']){
  if(!consumer.primaryOutcomes.includes(token))failures.push(`consumer mission missing outcome: ${token}`);
}
const admin=WORKSPACE_MISSIONS.admin;
for(const token of ['inspect capability coverage','monitor ingestion and datasets','review security and RLS posture']){
  if(!admin.primaryOutcomes.includes(token))failures.push(`admin mission missing outcome: ${token}`);
}

if(failures.length){console.error('Workspace mission audit failed.');for(const item of failures)console.error(`- ${item}`);process.exit(1)}
console.log(`Workspace mission audit passed across ${Object.keys(WORKSPACE_MISSIONS).length} workspaces.`);
