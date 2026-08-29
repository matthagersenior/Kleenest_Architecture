import fs from 'node:fs';
import { CAPABILITY_REGISTRY } from '../src/architecture/capabilityRegistry.js';

const appContext = fs.readFileSync(new URL('../src/AppContext.jsx', import.meta.url), 'utf8');
const start = appContext.indexOf('const base={');
const end = appContext.indexOf('};base.intelligenceConvergence', start);
if (start < 0 || end < 0) throw new Error('Unable to locate AppContext service registry.');

const baseSource = appContext.slice(start, end);
const objectStart = baseSource.indexOf('{');
const objectSource = objectStart >= 0 ? baseSource.slice(objectStart + 1) : '';
const serviceKeys = new Set();

// Accept both explicit object properties (`foo: service`) and shorthand
// properties (`foo,`). The source is intentionally compact, so audit the
// actual object contract rather than relying on formatting.
for (const match of objectSource.matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*(?=:|,|$)/g)) {
  serviceKeys.add(match[1]);
}
for (const match of objectSource.matchAll(/\b([A-Za-z_$][\w$]*)\s*:/g)) {
  serviceKeys.add(match[1]);
}

// Capability names are domain-facing contracts and may intentionally differ
// from the runtime property name when two surfaces share one canonical
// service implementation. Keep those aliases explicit and auditable.
const SERVICE_ALIASES = Object.freeze({
  platformAccount: 'account',
  universalDiscovery: 'maps',
  partners: 'enterprise',
});

const missing = [];
const domains = Object.entries(CAPABILITY_REGISTRY);
for (const [domain, capability] of domains) {
  for (const service of capability.services || []) {
    const runtimeService = SERVICE_ALIASES[service] || service;
    if (!serviceKeys.has(runtimeService)) missing.push(`${domain} -> ${service} (runtime: ${runtimeService})`);
  }
}

if (missing.length) {
  console.error('Capability service wiring audit failed.');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Capability service wiring audit passed: ${domains.length} domains, ${new Set(domains.flatMap(([, c]) => c.services || [])).size} services.`);
