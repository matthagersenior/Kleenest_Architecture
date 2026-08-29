import fs from 'node:fs';
import { CAPABILITY_REGISTRY } from '../src/architecture/capabilityRegistry.js';

const appContext = fs.readFileSync(new URL('../src/AppContext.jsx', import.meta.url), 'utf8');
const start = appContext.indexOf('const base={');
const end = appContext.indexOf('};base.intelligenceConvergence', start);
if (start < 0 || end < 0) throw new Error('Unable to locate AppContext service registry.');

const baseSource = appContext.slice(start, end);
const serviceKeys = new Set();
const propertyPattern = /(?:^|,)([A-Za-z_$][\w$]*)\s*(?::|,)/g;
for (const match of baseSource.matchAll(propertyPattern)) serviceKeys.add(match[1]);

const missing = [];
const domains = Object.entries(CAPABILITY_REGISTRY);
for (const [domain, capability] of domains) {
  for (const service of capability.services || []) {
    if (!serviceKeys.has(service)) missing.push(`${domain} -> ${service}`);
  }
}

if (missing.length) {
  console.error('Capability service wiring audit failed.');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Capability service wiring audit passed: ${domains.length} domains, ${new Set(domains.flatMap(([, c]) => c.services || [])).size} services.`);
