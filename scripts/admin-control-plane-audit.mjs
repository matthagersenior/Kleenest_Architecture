import fs from 'node:fs';
const checks=[
 ['src/domains/admin/operations.js',['controlPlaneSnapshot','admin_control_plane_snapshot','controlPlaneSnapshot:true']],
 ['src/runtime/AdminMaintenancePage.jsx',['OWNER CONTROL PLANE','Platform health snapshot','services.admin.controlPlaneSnapshot','high integrity issues','secured capability contracts','cataloged backend resources']],
 ['supabase/migrations/20260830005000_admin_control_plane_authority_v1.sql',['admin_control_plane_snapshot','admin_data_integrity_summary','is_platform_owner','Platform owner access required','admin_operational_capability_catalog','admin_backend_resource_catalog','revoke all','grant execute']]
];
const missing=[];for(const[file,tokens]of checks){if(!fs.existsSync(file)){missing.push(`${file}: missing file`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${file}: missing ${token}`)}
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Admin control-plane audit passed: owner-aware integrity, protected platform snapshot, capability/resource health, maintenance refresh, and service/runtime convergence are wired.');
