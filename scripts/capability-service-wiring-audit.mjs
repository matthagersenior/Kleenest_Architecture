import fs from 'node:fs';
import { CAPABILITY_REGISTRY } from '../src/architecture/capabilityRegistry.js';

const appContext = fs.readFileSync(new URL('../src/AppContext.jsx', import.meta.url), 'utf8');
const start = appContext.indexOf('const base={');
const end = appContext.indexOf('};base.intelligenceConvergence', start);
if (start < 0 || end < 0) throw new Error('Unable to locate AppContext service registry.');

const baseSource = appContext.slice(start, end);

// AppContext is intentionally compact and contains nested object literals.
// Parse only the top-level keys of `base` so nested keys cannot masquerade as
// runtime services. This also handles both `foo: service` and shorthand `foo`.
const objectSource = baseSource.slice(baseSource.indexOf('{') + 1);
const serviceKeys = new Set();
let depth = 0;
let token = '';
let expectKey = true;
for (let i = 0; i < objectSource.length; i += 1) {
  const ch = objectSource[i];
  if (ch === '{') { depth += 1; continue; }
  if (ch === '}') { depth -= 1; continue; }
  if (depth !== 0) continue;
  if (/[A-Za-z0-9_$]/.test(ch)) token += ch;
  else if (ch === ':' || ch === ',') {
    if (expectKey && token) serviceKeys.add(token);
    token = '';
    expectKey = ch === ',';
  } else if (/\s/.test(ch)) continue;
  else { token = ''; expectKey = false; }
}
if (token && expectKey) serviceKeys.add(token);

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
