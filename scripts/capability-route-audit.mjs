import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const runtime = fs.readFileSync(path.join(root,'src/runtime/CanonicalAppRuntime.jsx'),'utf8');
const registry = fs.readFileSync(path.join(root,'src/architecture/capabilityRegistry.js'),'utf8');
const routes = [...runtime.matchAll(/<Route\s+path="([^"]+)"/g)].map(m=>m[1]);
const capabilityIds = [...registry.matchAll(/^\s{2}([A-Za-z0-9_]+):\{/gm)].map(m=>m[1]);
const duplicates = routes.filter((r,i)=>routes.indexOf(r)!==i);
const protectedPrefixes = ['/admin','/owner'];
const unprotectedOwnerRoutes = routes.filter(r=>protectedPrefixes.some(p=>r.startsWith(p)) && !runtime.includes(`<Route path="${r}" element={<OwnerRoute`));
const requiredRuntimeFiles = ['CanonicalAppRuntime.jsx','CapabilityHubPage.jsx'];
const missingFiles = requiredRuntimeFiles.filter(file=>!fs.existsSync(path.join(root,'src/runtime',file)));
const report = {generatedAt:new Date().toISOString(),routeCount:routes.length,capabilityCount:capabilityIds.length,duplicateRoutes:[...new Set(duplicates)],unprotectedOwnerRoutes,missingFiles,status:(duplicates.length||unprotectedOwnerRoutes.length||missingFiles.length)?'attention':'ok'};
console.log(JSON.stringify(report,null,2));
if(report.status!=='ok') process.exitCode=1;
