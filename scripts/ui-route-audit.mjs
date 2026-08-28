import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const files=[];const routes=new Set();
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','dist'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(/\.(jsx?|tsx?)$/.test(e.name))files.push(f)}}walk(root);
for(const file of files){const t=fs.readFileSync(file,'utf8');for(const m of t.matchAll(/(?:path|to)\s*=\s*["'`]([^"'`]+)["'`]/g)){const r=m[1];if(r.startsWith('/'))routes.add(r)}}
const missing=[];for(const r of routes){if(r.includes('?')||r.includes(':')||r.includes('*'))continue;const candidates=[`src/runtime/${r.slice(1).replaceAll('/','/')}.jsx`,`src/runtime/${r.slice(1).replaceAll('/','')}.jsx`];if(r==='/')continue;if(!candidates.some(f=>fs.existsSync(path.resolve(f))))missing.push(r)}
console.log(JSON.stringify({filesScanned:files.length,staticRoutes:routes.size,possiblyMissing:missing},null,2));
