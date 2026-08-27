import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src/runtime');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.jsx?$/.test(entry.name))files.push(full)}}
walk(root);
const workspaceFiles=files.filter(f=>/Consumer|Business|Fleet|Enterprise|Owner|Membership|Workspace|Profile|Progression|Map|Route|Location|Notification/i.test(path.basename(f)));
const findings=[];
for(const file of workspaceFiles){
  const text=fs.readFileSync(file,'utf8');
  const buttons=[...text.matchAll(/<button\b[\s\S]*?>/g)].map(m=>m[0]);
  for(const button of buttons){
    if(!/onClick=|type=["']submit["']/.test(button))findings.push(`${path.relative(process.cwd(),file)}: button without onClick/submit handler`);
    if(/disabled=\{false\}/.test(button))findings.push(`${path.relative(process.cwd(),file)}: permanently enabled disabled=false control`);
  }
  if(/\.from\(['"](businesses|locations|fleet_|enterprise_|intelligence_|notifications|activity_events)/.test(text)&&/\.insert\(|\.update\(|\.delete\(/.test(text))findings.push(`${path.relative(process.cwd(),file)}: direct protected-table mutation; use canonical RPC/service`);
}
const report={generatedAt:new Date().toISOString(),sourceFiles:workspaceFiles.length,findings};
console.log(JSON.stringify(report,null,2));
if(findings.length)process.exitCode=1;
