import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const routeFiles = fs.readdirSync(path.join(root, 'src/runtime/routing')).filter(file => /Routes\.jsx$/.test(file));
const routeSource = routeFiles.map(file => read(`src/runtime/routing/${file}`)).join('\n');
const routePaths = [...routeSource.matchAll(/<Route\s+(?:[^>]*?\s)?path="([^"]+)"/g)].map(match => match[1]);
const routeSet = new Set(routePaths);
const registrySource = read('src/architecture/capabilityRegistry.js');
const registryIds = [...registrySource.matchAll(/^\s{2}([A-Za-z0-9_]+):\{/gm)].map(match => match[1]);
const presentation = read('src/architecture/capabilityPresentation.js');
const routeBlock = presentation.match(/CAPABILITY_ROUTES\s*=\s*Object\.freeze\(\{([\s\S]*?)\}\);/);
const capabilityRoutes = routeBlock ? [...routeBlock[1].matchAll(/([A-Za-z0-9_]+):\s*'([^']+)'/g)].map(match => ({ id: match[1], path: match[2] })) : [];
const contextualBlock = presentation.match(/CAPABILITY_WORKSPACE_ROUTES\s*=\s*Object\.freeze\(\{([\s\S]*?)\}\);/);
const contextualRoutes = contextualBlock ? [...contextualBlock[1].matchAll(/(business|fleet|enterprise|admin):\s*Object\.freeze\(\{([\s\S]*?)\}\)/g)].flatMap(match => [...match[2].matchAll(/([A-Za-z0-9_]+):\s*'([^']+)'/g)].map(item => ({ workspace: match[1], id: item[1], path: item[2] }))) : [];
const navSource = read('src/domain/workspaceNavigation.js');
const navPaths = [...navSource.matchAll(/path:\s*'([^']+)'/g)].map(match => match[1]);
const normalize = value => value.split(/[?#]/)[0].replace(/\/$/, '') || '/';
const routeExists = target => {
  const normalized = normalize(target);
  if (routeSet.has(normalized)) return true;
  return routePaths.some(route => {
    const pattern = normalize(route).replace(/:[^/]+/g, '[^/]+');
    return new RegExp(`^${pattern}$`).test(normalized);
  });
};
const staleCapabilityDestinations = capabilityRoutes.filter(({ path }) => !routeExists(path));
const staleContextualDestinations = contextualRoutes.filter(({ path }) => !routeExists(path));
const staleNavigationDestinations = navPaths.filter(path => !routeExists(path));
const unmappedCapabilities = registryIds.filter(id => !capabilityRoutes.some(route => route.id === id));
const workspaceNames = ['consumer', 'business', 'fleet', 'enterprise', 'admin'];
const workspaceRegistryCoverage = workspaceNames.map(workspace => ({ workspace, capabilityCount: (read('src/architecture/capabilityRegistry.js').match(new RegExp(`ui:\\[[^\\]]*['"]${workspace}['"]`, 'g')) || []).length }));
const report = {
  generatedAt: new Date().toISOString(),
  routeCount: routePaths.length,
  routeModules: routeFiles,
  capabilityCount: registryIds.length,
  capabilityDestinationCount: capabilityRoutes.length,
  contextualDestinationCount: contextualRoutes.length,
  navigationDestinationCount: navPaths.length,
  staleCapabilityDestinations,
  staleContextualDestinations,
  staleNavigationDestinations,
  unmappedCapabilities,
  workspaceRegistryCoverage,
  canonicalRuntime: fs.existsSync(path.join(root, 'src/runtime/CanonicalAppRuntime.jsx')),
  workspaceShell: fs.existsSync(path.join(root, 'src/runtime/WorkspaceShell.jsx')),
  presentationModel: fs.existsSync(path.join(root, 'src/architecture/capabilityPresentation.js')),
};
console.log(JSON.stringify(report, null, 2));
if (staleCapabilityDestinations.length || staleContextualDestinations.length || staleNavigationDestinations.length || unmappedCapabilities.length || !report.canonicalRuntime || !report.workspaceShell || !report.presentationModel) process.exitCode = 1;
