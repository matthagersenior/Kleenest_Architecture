import fs from 'node:fs';
const shell=fs.readFileSync('src/runtime/WorkspaceShell.jsx','utf8');
const lab=fs.readFileSync('src/runtime/OwnerTierPreview.jsx','utf8');
const tiers=['free','premium','family','fleet','enterprise','business_standard','business_growth','business_fleet','business_enterprise'];
const required=['sessionStorage','PREVIEW_WORKSPACE','PREVIEW_LABEL','exitPreview','presentation only','getProductTier','canAccessMembershipWorkspace'];
const missing=required.filter(token=>!shell.includes(token));
for(const tier of tiers){if(!lab.includes(`'${tier}'`))missing.push(`lab:${tier}`);if(!shell.includes(`${tier}:`))missing.push(`workspace:${tier}`)}
if(!lab.includes('previewHref') || !lab.includes('to={previewHref(tier, workspace)}'))missing.push('lab:real-preview-link');
if(missing.length){console.error('Membership preview wiring audit failed:',missing.join(', '));process.exit(1)}
console.log(`Membership preview wiring audit passed: ${tiers.length} canonical tiers verified.`);