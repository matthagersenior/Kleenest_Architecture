import fs from 'node:fs';

const checks=[
 ['src/runtime/AdminMaintenancePage.jsx',['NATIONAL DATA INGESTION · AUTOMATIC','nationalIngestionStatus','Every 15 minutes','storage_guard']],
 ['src/domains/admin/operations.js',["nationalIngestionStatus:profile=>ownerRpc(profile,'admin_national_ingestion_status')",'authorizeNationalIngestionContinuation']],
 ['supabase/functions/national-ingestion-orchestrator/index.ts',['national_ingestion_markets','national_ingestion_source_policies','national_ingestion_runs','ingest_external_locations','DATA_GOV_API_KEY','overpass-api.de','cycle()']],
 ['supabase/migrations/20260830110000_national_ingestion_queue_and_quota_control.sql',['national_ingestion_markets','national_ingestion_source_policies','admin_national_ingestion_status','kleenest-national-ingestion','*/15 * * * *']],
 ['supabase/migrations/20260830110500_make_external_location_ingestion_row_resilient.sql',['skipped_rows','row_errors','exception when others','ingest_external_locations']],
 ['supabase/migrations/20260830112600_national_ingestion_storage_guard.sql',['pause_fraction','hard_stop_fraction','national_ingestion_storage_guard','authorize_national_ingestion_continuation']]
];
const missing=[];
for(const[file,tokens]of checks){if(!fs.existsSync(file)){missing.push(`${file}: missing`);continue;}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${file}: missing ${token}`);}
const admin=fs.existsSync('src/runtime/AdminMaintenancePage.jsx')?fs.readFileSync('src/runtime/AdminMaintenancePage.jsx','utf8'):'';
for(const forbidden of ['Run OSM top markets','Run Data.gov top markets','OSM top 10','Data.gov top 10','Run OSM / Data.gov by market','Catalog public datasets','MARKETS = [','INGESTION_SOURCES = ['])if(admin.includes(forbidden))missing.push(`AdminMaintenancePage.jsx: obsolete manual ingestion control returned: ${forbidden}`);
const edge=fs.existsSync('supabase/functions/national-ingestion-orchestrator/index.ts')?fs.readFileSync('supabase/functions/national-ingestion-orchestrator/index.ts','utf8'):'';
if(!edge.includes('daily_request_limit')||!edge.includes('daily_byte_limit'))missing.push('national ingestion worker must enforce source quotas');
if(!/kind\s*===\s*['"]city['"]\s*\?\s*0\.10\s*:\s*0\.18/.test(edge))missing.push('national ingestion worker must tile city/state markets deterministically');
if(missing.length){console.error('National ingestion convergence audit failed.');for(const item of missing)console.error(`- ${item}`);process.exit(1);}
console.log('National ingestion convergence audit passed: quota-aware scheduled ingestion, storage guard, canonical persistence, national queue status, and no competing manual ingestion controls.');
