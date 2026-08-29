import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src/runtime');const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.jsx?$/.test(entry.name))files.push(full)}}
walk(root);
const workspaceFiles=files.filter(f=>/Consumer|Business|Fleet|Enterprise|Owner|Membership|Workspace|Profile|Progression|Map|Route|Location|Notification/i.test(path.basename(f)));
const findings=[];
for(const file of workspaceFiles){
 const rel=path.relative(process.cwd(),file);const text=fs.readFileSync(file,'utf8');
 // Static JSX cannot reliably infer handlers from nested expressions, component
 // wrappers, spreads, or enclosing forms. Only flag controls when the source
 // explicitly marks a button as a non-submit button and provides no handler.
 const buttons=[...text.matchAll(/<button\b([^>]*)>/g)].map(m=>m[1]);
 for(const attrs of buttons){
  const hasHandler=/onClick\s*=|onSubmit\s*=|\.\.\.[A-Za-z_$][\w$]*/.test(attrs);
  const isSubmit=/type\s*=\s*["']submit["']/.test(attrs);
  const hasExplicitNonSubmit=/type\s*=\s*["'](?:button|reset)["']/.test(attrs);
  if(!hasHandler&&!isSubmit&&hasExplicitNonSubmit)findings.push(`${rel}: explicit non-submit button without handler`);
  if(/disabled\s*=\s*\{false\}/.test(attrs))findings.push(`${rel}: permanently enabled disabled=false control`);
 }
 if(/\.from\(['"](businesses|locations|fleet_|enterprise_|intelligence_|notifications|activity_events)/.test(text)&&/\.insert\(|\.update\(|\.delete\(/.test(text))findings.push(`${rel}: direct protected-table mutation; use canonical RPC/service`);
 if(/onClick=\{\(\)\s*=>\s*(?:console\.log|alert)\b/.test(text))findings.push(`${rel}: placeholder interaction handler detected`);
 if(/href=["']#["']|to=["']#["']/.test(text))findings.push(`${rel}: placeholder # navigation detected`);
}
const report={generatedAt:new Date().toISOString(),sourceFiles:workspaceFiles.length,findings};console.log(JSON.stringify(report,null,2));if(findings.length)process.exitCode=1;
