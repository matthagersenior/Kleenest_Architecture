import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(/\.(jsx?|tsx?)$/.test(e.name))files.push(f)}}walk(root);
const routeFiles=files.filter(f=>/App|routes?|router/i.test(path.basename(f)));const routeText=routeFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');const routes=new Set();
for(const m of routeText.matchAll(/(?:path|to)\s*=\s*["'`]([^"'`$]+)["'`]/g))routes.add(m[1]);for(const m of routeText.matchAll(/(?:navigate|redirect)\(\s*["'`]([^"'`$]+)["'`]/g))routes.add(m[1]);
const findings=[];for(const f of files){const lines=fs.readFileSync(f,'utf8').split(/\r?\n/);lines.forEach((line,i)=>{if(/\b(to|href)\s*=\s*["'`]#?["'`]/.test(line))findings.push(`${f}:${i+1}: empty/placeholder destination`);if(/href\s*=\s*["'`]javascript:/i.test(line))findings.push(`${f}:${i+1}: javascript URL destination`);});}
if(findings.length){console.error(findings.join('\n'));process.exit(1)}console.log(`Interaction audit passed: ${files.length} source files scanned; ${routes.size} static destinations indexed.`);
