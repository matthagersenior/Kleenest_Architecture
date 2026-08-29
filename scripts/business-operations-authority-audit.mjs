import fs from 'node:fs';
const source=fs.readFileSync('src/domains/business/management.js','utf8');
const required=['business_list_workspaces','business_list_locations','business_manage_location','business_list_campaigns','business_create_campaign','business_update_campaign','business_delete_campaign','business_promotion_detail','business_create_promotion','business_manage_promotion','business_list_contests','business_create_contest','business_update_contest','business_delete_contest','business_list_events','business_manage_event','business_list_media','business_create_media','business_update_media','business_delete_media','business_list_amenities','business_set_location_amenity','business_reply_review','business_invite_member','business_change_member_role','business_remove_member','business_management_context','business_qr_detail','business_manage_qr','business_create_custom_qr','business_update_custom_qr','business_delete_qr'];
const failures=[];
for(const token of required)if(!source.includes(token))failures.push(`missing canonical Business RPC ${token}`);
if(/client\.from\(/.test(source))failures.push('direct table access remains in canonical Business management service');
if(!source.includes("rpc('business_list_workspaces'"))failures.push('workspace discovery does not use canonical workspace authority');
if(failures.length){console.error('Business operations authority audit FAILED');failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log(`Business operations authority audit passed (${required.length} canonical RPC contracts).`);
