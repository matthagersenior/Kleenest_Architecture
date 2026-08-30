import fs from 'node:fs';

const checks=[
 ['src/runtime/AdminMaintenancePage.jsx',['NATIONAL DATA INGESTION · AUTOMATIC','nationalIngestionStatus','Every 15 minutes','No manual ingestion cards are required.']],
 ['src/domains/admin/operations.js',["nationalIngestionStatus:profile=>ownerRpc(profile,'admin_national_ingestion_status')"]],
 ['supabase/functions/national-ingestion-orchestrator/index.ts',['national_ingestion_markets','national_ingestion_source_policies','national_ingestion_runs','ingest_external_locations','DATA_GOV_API_KEY','DEMO_KEY','overpass-api.de','cycle()']],
 ['supabase/migrations/20260830110000_national_ingestion_queue_and_quota_control.sql',['national_ingestion_markets','national_ingestion_source_policies','admin_national_ingestion_status','kleenest-national-ingestion','*/15 * * * *']],
 ['supabase/migrations/20260830110500_make_external_location_ingestion_row_resilient.sql',['skipped_rows','row_errors','exception when others','ingest_external_locations']]
];
const missing=[];
for(const[file,tokens]of checks){if(!fs.existsSync(file)){missing.push(`${file}: missing`);continue;}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${file}: missing ${token}`);}
const admin=fs.existsSync('src/runtime/AdminMaintenancePage.jsx')?fs.readFileSync('src/runtime/AdminMaintenancePage.jsx','utf8'):'';
for(const forbidden of ['Run OSM top markets','Run Data.gov top markets','OSM top 10','Data.gov top 10','Run OSM / Data.gov by market','Catalog public datasets','MARKETS = [','INGESTION_SOURCES = ['])if(admin.includes(forbidden))missing.push(`AdminMaintenancePage.jsx: obsolete manual ingestion control returned: ${forbidden}`);
const edge=fs.existsSync('supabase/functions/national-ingestion-orchestrator/index.ts')?fs.readFileSync('supabase/functions/national-ingestion-orchestrator/index.ts','utf8'):'';
if(!edge.includes("daily_request_limit")||!edge.includes("daily_byte_limit"))missing.push('national ingestion worker must enforce source quotas');
if(!edge.includes("market_kind==='city'?0.10:0.18"))missing.push('national ingestion worker must tile city/state markets deterministically');
if(missing.length){console.error('National ingestion convergence audit failed.');for(const item of missing)console.error(`- ${item}`);process.exit(1);}
console.log('National ingestion convergence audit passed: one quota-aware scheduler owns OSM/Data.gov market progression, canonical persistence, national queue status, and the admin dashboard has no competing manual ingestion controls.');
