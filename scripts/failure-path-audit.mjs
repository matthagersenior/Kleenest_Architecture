import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(/\.(jsx?|tsx?)$/.test(e.name))files.push(f)}}walk(root);
const text=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const findings=[];
for(const token of ['console.log(','TODO','FIXME','href="javascript:','href={"#'])if(text.includes(token))findings.push(`placeholder/debug token: ${token}`);
const actionable=files.filter(f=>/Owner|Lab|Workbench|Control|Action/i.test(path.basename(f))&&!f.includes(`${path.sep}domains${path.sep}`));
for(const f of actionable){const s=fs.readFileSync(f,'utf8');if(/async|await/.test(s)&&!/catch\s*\(/.test(s))findings.push(`async surface without catch: ${f}`);}
const domainFiles=['domains/community/interactions.js','domains/intelligence/actions.js'];
for(const rel of domainFiles){const f=path.join(root,rel);const s=fs.readFileSync(f,'utf8');if(/async|await/.test(s)&&!/throw\s+error|\.catch\s*\(|try\s*\{/.test(s))findings.push(`async domain surface without rejection strategy: ${f}`);}
if(findings.length){console.error(findings.join('\n'));process.exit(1)}
console.log(`Failure-path audit passed: ${files.length} source files scanned; ${actionable.length} owner/action surfaces checked.`);
