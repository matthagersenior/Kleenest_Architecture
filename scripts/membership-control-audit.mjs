import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src/runtime');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.jsx?$/.test(entry.name))files.push(full)}}
walk(root);
const workspaceFiles=files.filter(f=>/Consumer|Business|Fleet|Enterprise|Owner|Membership|Workspace|Profile|Progression|Map|Route|Location|Notification/i.test(path.basename(f)));
const findings=[];
const seenLabels=new Map();
for(const file of workspaceFiles){
  const rel=path.relative(process.cwd(),file); const text=fs.readFileSync(file,'utf8');
  const buttons=[...text.matchAll(/<button\b[\s\S]*?>/g)].map(m=>m[0]);
  for(const button of buttons){
    const label=(button.replace(/<[^>]+>/g,' ').replace(/\{[^}]*\}/g,' ').replace(/\s+/g,' ').trim()||'(icon/control)').slice(0,120);
    if(!/onClick=|type=["']submit["']/.test(button))findings.push(`${rel}: button without onClick/submit handler (${label})`);
    if(/disabled=\{false\}/.test(button))findings.push(`${rel}: permanently enabled disabled=false control (${label})`);
    const key=label.toLowerCase(); if(key.length>2){const prior=seenLabels.get(key);if(prior&&prior!==rel)findings.push(`duplicate control label across workspace surfaces: "${label}" in ${prior} and ${rel}`);else seenLabels.set(key,rel)}
  }
  if(/\.from\(['"](businesses|locations|fleet_|enterprise_|intelligence_|notifications|activity_events)/.test(text)&&/\.insert\(|\.update\(|\.delete\(/.test(text))findings.push(`${rel}: direct protected-table mutation; use canonical RPC/service`);
  if(/onClick=\{\(\)\s*=>\s*(?:console\.log|alert)\b/.test(text))findings.push(`${rel}: placeholder interaction handler detected`);
  if(/href=["']#["']|to=["']#["']/.test(text))findings.push(`${rel}: placeholder # navigation detected`);
}
const report={generatedAt:new Date().toISOString(),sourceFiles:workspaceFiles.length,findings};
console.log(JSON.stringify(report,null,2));
if(findings.length)process.exitCode=1;
