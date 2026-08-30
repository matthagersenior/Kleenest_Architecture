import fs from 'node:fs';
import path from 'node:path';
import { CAPABILITY_REGISTRY } from '../src/architecture/capabilityRegistry.js';

const migrationDir=path.resolve('supabase/migrations');
if(!fs.existsSync(migrationDir))throw new Error('supabase/migrations is missing');
const migrationFiles=fs.readdirSync(migrationDir).filter(name=>name.endsWith('.sql')).sort();
const corpus=migrationFiles.map(name=>fs.readFileSync(path.join(migrationDir,name),'utf8').toLowerCase()).join('\n');
const factOwners=new Map();
for(const [domain,capability] of Object.entries(CAPABILITY_REGISTRY))for(const fact of capability.facts||[]){
  const key=String(fact).toLowerCase();
  const owners=factOwners.get(key)||[];owners.push(domain);factOwners.set(key,owners);
}
const missing=[];
for(const [fact,owners] of factOwners.entries())if(!corpus.includes(fact.toLowerCase()))missing.push(`${fact} <- ${owners.join(', ')}`);
if(missing.length){console.error(`Capability dataset migration audit failed: ${missing.length} registered fact(s) are absent from migration history.`);for(const item of missing)console.error(`- ${item}`);process.exit(1)}
console.log(`Capability dataset migration audit passed: ${factOwners.size} unique registered datasets are represented across ${migrationFiles.length} migrations.`);
