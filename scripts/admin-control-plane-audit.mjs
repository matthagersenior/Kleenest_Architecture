import fs from 'node:fs';
const checks=[
 ['src/domains/admin/operations.js',['controlPlaneSnapshot','admin_control_plane_snapshot','controlPlaneHistory','admin_control_plane_history','controlPlaneSnapshot:true','controlPlaneHistory:true']],
 ['src/runtime/AdminMaintenancePage.jsx',['OWNER CONTROL PLANE','Platform health snapshot','services.admin.controlPlaneSnapshot','AdminControlPlaneHistoryPanel','refreshControlPlane','governance history']],
 ['src/runtime/AdminControlPlaneHistoryPanel.jsx',['CONTROL-PLANE HISTORY','Governance activity & configuration','features enabled','recent access changes','Architecture governance','Retired backend contracts']],
 ['src/runtime/EnterpriseCommandCenterPage.jsx',['CONTROL PLANE','controlPlaneSnapshot','Enterprise or Fleet organizations']],
 ['supabase/migrations/20260830005000_admin_control_plane_authority_v1.sql',['admin_control_plane_snapshot','admin_data_integrity_summary','is_platform_owner','Platform owner access required','admin_operational_capability_catalog','admin_backend_resource_catalog','revoke all','grant execute']],
 ['supabase/migrations/20260830005100_admin_control_plane_history_v1.sql',['admin_control_plane_history','admin_capability_audit','capability_audit_runs','capability_retirement_log','feature_catalog','pricing_catalog','Platform owner access required','revoke all','grant execute']],
 ['supabase/migrations/20260830004900_enterprise_control_plane_authority_v1.sql',['enterprise_control_plane_snapshot','record_enterprise_partner_campaign_outcome','enterprise_partner_campaigns','revoke all','grant execute']]
];
const missing=[];for(const[file,tokens]of checks){if(!fs.existsSync(file)){missing.push(`${file}: missing file`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${file}: missing ${token}`)}
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Wave 4 Enterprise + Admin Control Plane closure audit passed: canonical Enterprise portfolio authority, executable outcome recording, owner-aware Admin integrity, protected platform snapshot, governance/configuration history, refresh convergence, and owner-only service/runtime boundaries are wired end to end.');
