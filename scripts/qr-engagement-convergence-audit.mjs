import fs from 'node:fs';

const files={
 shared:fs.readFileSync('src/runtime/QrStudioSurface.jsx','utf8'),
 business:fs.readFileSync('src/runtime/BusinessQrStudioPage.jsx','utf8'),
 platform:fs.readFileSync('src/runtime/PlatformQrStudioPage.jsx','utf8'),
 ownerCrud:fs.readFileSync('src/runtime/OwnerCrudWorkbench.jsx','utf8'),
 landing:fs.readFileSync('src/runtime/QrLandingPage.jsx','utf8'),
 branding:fs.readFileSync('src/domains/business/qr-branding.js','utf8'),
 publicLanding:fs.readFileSync('src/domains/qr/public-landing.js','utf8'),
 management:fs.readFileSync('src/domains/business/management.js','utf8'),
 runtimeBoundary:fs.readFileSync('scripts/runtime-supabase-boundary-audit.mjs','utf8'),
};
const checks=[
 ['shared QR Studio is canonical',files.shared.includes('export default function QrStudioSurface')&&files.shared.includes('services.business.customQr.create')&&files.shared.includes('services.business.customQr.update')&&files.shared.includes('services.business.customQr.remove')],
 ['shared Studio owns full experience',files.shared.includes('Download PNG')&&files.shared.includes('Print')&&files.shared.includes('Copy link')&&files.shared.includes('Connect program')&&files.shared.includes('QR performance')&&files.shared.includes('Single-use QR')&&files.shared.includes('Max redemptions')],
 ['shared Studio uses branding boundary',files.shared.includes('uploadBusinessQrBrandingLogo')&&!files.shared.includes('infrastructure/supabase/client')],
 ['Business QR Studio uses shared authority',files.business.includes("from './QrStudioSurface.jsx'")&&files.business.includes('<QrStudioSurface business={selectedBusiness}')],
 ['Platform QR Studio uses shared authority',files.platform.includes("from './QrStudioSurface.jsx'")&&files.platform.includes('platformMode')&&files.platform.includes("services.admin.crud(profile,'businesses','list')")],
 ['Platform CRUD hands qr_codes to Studio',files.ownerCrud.includes("resource==='qr_codes'")&&files.ownerCrud.includes('<PlatformQrStudioPage embedded/>')&&!files.ownerCrud.includes("services.admin.crud(profile,'qr_codes'")],
 ['legacy versioned Studio files removed',!fs.existsSync('src/runtime/BusinessQrStudioPageV2.jsx')&&!fs.existsSync('src/runtime/BusinessQrStudioPageV3.jsx')],
 ['branding domain owns qr-branding storage',files.branding.includes("storage.from('qr-branding')")&&files.branding.includes('auth.getUser()')],
 ['public landing uses QR domain boundary',files.landing.includes('getPublicQrLanding')&&!files.landing.includes('infrastructure/supabase/client')],
 ['public landing domain owns canonical RPC',files.publicLanding.includes("rpc('get_public_qr_landing'")],
 ['landing preserves QR into verified visit',files.landing.includes('&qr=${encodeURIComponent')],
 ['custom QR create authority',files.management.includes("rpc('business_create_custom_qr'")],
 ['custom QR update authority',files.management.includes("rpc('business_update_custom_qr'")],
 ['custom QR delete authority',files.management.includes("rpc('business_delete_qr'")],
 ['QR program create authority',files.management.includes("rpc('create_qr_engagement_program'")],
 ['QR program list authority',files.management.includes("rpc('list_qr_engagement_programs'")],
 ['QR action resolution authority',files.management.includes("rpc('resolve_custom_qr_action'")],
 ['QR redemption authority',files.management.includes("rpc('redeem_qr_code'")],
 ['QR attribution authority',files.management.includes("rpc('record_qr_attribution'")],
 ['QR analytics authority',files.management.includes("rpc('business_qr_analytics'")],
 ['runtime audit has no QR exceptions',!files.runtimeBoundary.includes('QrLandingPage.jsx')&&!files.runtimeBoundary.includes('QrStudioSurface.jsx')&&!files.runtimeBoundary.includes('BusinessQrStudioPage.jsx')&&!files.runtimeBoundary.includes('PlatformQrStudioPage.jsx')],
];
const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('QR + Engagement convergence audit FAILED');failed.forEach(name=>console.error(`- ${name}`));process.exit(1)}
console.log(`QR + Engagement convergence audit passed (${checks.length} contracts): one shared Studio powers Business + Platform with canonical branding, lifecycle, programs, attribution, redemption and analytics.`);
