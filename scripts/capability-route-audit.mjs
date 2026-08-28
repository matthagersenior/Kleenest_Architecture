import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const runtimePath = path.join(root, 'src/runtime/CanonicalAppRuntime.jsx');
const routingDir = path.join(root, 'src/runtime/routing');
const registry = fs.readFileSync(path.join(root, 'src/architecture/capabilityRegistry.js'), 'utf8');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const routeFiles = fs.readdirSync(routingDir).filter(file => /Routes\.jsx$/.test(file));
const routeSource = routeFiles.map(file => fs.readFileSync(path.join(routingDir, file), 'utf8')).join('\n');
const routes = [...routeSource.matchAll(/<Route\s+(?:[^>]*?\s)?path="([^"]+)"/g)].map(m => m[1]);
const capabilityIds = [...registry.matchAll(/^\s{2}([A-Za-z0-9_]+):\{/gm)].map(m => m[1]);
const duplicates = routes.filter((r, i) => routes.indexOf(r) !== i);
const protectedPrefixes = ['/admin', '/owner'];
const unprotectedOwnerRoutes = routes.filter(route => protectedPrefixes.some(prefix => route.startsWith(prefix)) && !routeSource.includes(`<OwnerRoute`));
const requiredRuntimeFiles = ['CanonicalAppRuntime.jsx', 'CapabilityHubPage.jsx'];
const missingFiles = requiredRuntimeFiles.filter(file => !fs.existsSync(path.join(root, 'src/runtime', file)));
const routeModules = routeFiles.map(file => ({ file, routeCount: [...fs.readFileSync(path.join(routingDir, file), 'utf8').matchAll(/<Route\s+(?:[^>]*?\s)?path="([^"]+)"/g)].length }));
const report = {
  generatedAt: new Date().toISOString(),
  routeCount: routes.length,
  routeModules,
  capabilityCount: capabilityIds.length,
  duplicateRoutes: [...new Set(duplicates)],
  unprotectedOwnerRoutes,
  missingFiles,
  runtimeUsesRouteModules: /Routes\.jsx/.test(runtime),
  status: (duplicates.length || unprotectedOwnerRoutes.length || missingFiles.length || !routes.length || !/Routes\.jsx/.test(runtime)) ? 'attention' : 'ok'
};
console.log(JSON.stringify(report, null, 2));
if (report.status !== 'ok') process.exitCode = 1;
