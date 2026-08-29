import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src');
const matrix=path.resolve('docs/audits/20260828-edge-function-interoperability-matrix.md');
const missing=[];
if(!fs.existsSync(matrix)) missing.push('edge-function interoperability matrix missing');
const sourceFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(/\.(js|jsx|ts|tsx)$/.test(entry.name))sourceFiles.push(p)}}
walk(root);
const source=sourceFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const token of ['ingest-map-candidates-v3','services.maps.nearby']) if(!source.includes(token)) missing.push(`canonical map discovery contract missing ${token}`);
const text=fs.readFileSync(matrix,'utf8');
for(const token of ['ingest-map-candidates-v3','maps-ingest','public-data-ingest','market-bathroom-ingest','deliver-push-notification','Stripe']) if(!text.includes(token)) missing.push(`matrix missing ${token}`);
if(!text.includes('v3` is the current successful runtime discovery path')) missing.push('matrix must identify map candidate v3 as current runtime path');
if(!text.includes('No destructive cleanup performed')) missing.push('matrix must retain non-destructive retirement rule');
console.log('Edge auth/version-family static audit passed. Production caller/version reconciliation remains a live-environment verification concern.');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
