import fs from 'node:fs';

const shell = fs.readFileSync('src/runtime/WorkspaceShell.jsx', 'utf8');
const preview = fs.readFileSync('src/runtime/workspace/useWorkspacePreview.js', 'utf8');
const lab = fs.readFileSync('src/runtime/OwnerTierPreview.jsx', 'utf8');
const tiers = ['free', 'premium', 'family', 'fleet', 'enterprise', 'business_standard', 'business_growth', 'business_fleet', 'business_enterprise'];

const requiredByFile = [
  [preview, ['sessionStorage', 'PREVIEW_WORKSPACE', 'PREVIEW_LABEL', 'exitPreview', 'getProductTier']],
  [shell, ['presentation only', 'canAccessMembershipWorkspace', 'useWorkspacePreview', 'useWorkspaceAccess']],
  [lab, ['PRODUCT_TIERS', 'capabilityState', 'previewHref']],
];

const missing = [];
for (const [source, tokens] of requiredByFile) {
  for (const token of tokens) if (!source.includes(token)) missing.push(token);
}

for (const tier of tiers) {
  if (!preview.includes(`'${tier}'`)) missing.push(`preview:${tier}`);
  if (!lab.includes(tier)) missing.push(`lab:${tier}`);
}

if (!lab.includes('previewHref(tier, workspace)')) missing.push('lab:real-preview-link');

if (missing.length) {
  console.error('Membership preview wiring audit failed:', [...new Set(missing)].join(', '));
  process.exit(1);
}

console.log(`Membership preview wiring audit passed: ${tiers.length} canonical tiers verified across extracted preview controller, workspace shell, and owner lab.`);
