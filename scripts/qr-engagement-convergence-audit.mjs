import fs from 'node:fs';

const files = {
  v2: fs.readFileSync('src/runtime/BusinessQrStudioPageV2.jsx','utf8'),
  v3: fs.readFileSync('src/runtime/BusinessQrStudioPageV3.jsx','utf8'),
  landing: fs.readFileSync('src/runtime/QrLandingPage.jsx','utf8'),
  branding: fs.readFileSync('src/domains/business/qr-branding.js','utf8'),
  publicLanding: fs.readFileSync('src/domains/qr/public-landing.js','utf8'),
  management: fs.readFileSync('src/domains/business/management.js','utf8'),
  runtimeBoundary: fs.readFileSync('scripts/runtime-supabase-boundary-audit.mjs','utf8'),
};

const checks = [
  ['V2 collapses to canonical V3', files.v2.includes("export { default } from './BusinessQrStudioPageV3.jsx'")],
  ['V3 uses branding domain boundary', files.v3.includes('uploadBusinessQrBrandingLogo') && !files.v3.includes('infrastructure/supabase/client')],
  ['branding domain owns qr-branding storage', files.branding.includes("storage.from('qr-branding')") && files.branding.includes('auth.getUser()')],
  ['public landing uses QR domain boundary', files.landing.includes('getPublicQrLanding') && !files.landing.includes('infrastructure/supabase/client')],
  ['public landing domain owns canonical RPC', files.publicLanding.includes("rpc('get_public_qr_landing'")],
  ['landing preserves QR into verified visit', files.landing.includes('&qr=${encodeURIComponent')],
  ['custom QR create authority', files.management.includes("rpc('business_create_custom_qr'")],
  ['custom QR update authority', files.management.includes("rpc('business_update_custom_qr'")],
  ['custom QR delete authority', files.management.includes("rpc('business_delete_qr'")],
  ['QR program create authority', files.management.includes("rpc('create_qr_engagement_program'")],
  ['QR program list authority', files.management.includes("rpc('list_qr_engagement_programs'")],
  ['QR action resolution authority', files.management.includes("rpc('resolve_custom_qr_action'")],
  ['QR redemption authority', files.management.includes("rpc('redeem_qr_code'")],
  ['QR attribution authority', files.management.includes("rpc('record_qr_attribution'")],
  ['QR analytics authority', files.management.includes("rpc('business_qr_analytics'")],
  ['runtime audit has no QR exceptions', !files.runtimeBoundary.includes('QrLandingPage.jsx') && !files.runtimeBoundary.includes('BusinessQrStudioPageV2.jsx') && !files.runtimeBoundary.includes('BusinessQrStudioPageV3.jsx')],
];

const failed = checks.filter(([,ok])=>!ok).map(([name])=>name);
if (failed.length) {
  console.error('QR + Engagement convergence audit FAILED');
  failed.forEach(name=>console.error(`- ${name}`));
  process.exit(1);
}
console.log(`QR + Engagement convergence audit passed (${checks.length} contracts): canonical Studio, branding, public landing, programs, attribution, redemption and analytics boundaries are wired.`);
