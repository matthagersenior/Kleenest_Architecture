import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/runtime');
const allowed = new Map([
  ['QrLandingPage.jsx', ['get_public_qr_landing']],
  ['BusinessQrStudioPageV2.jsx', ['qr-branding']],
  ['BusinessQrStudioPageV3.jsx', ['qr-branding']],
]);
const violations = [];

for (const name of fs.readdirSync(root)) {
  if (!/\.(jsx?|tsx?)$/.test(name)) continue;
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  const directClient = /infrastructure\/supabase\/client/.test(source);
  const directQuery = /\bsupabase\.(?:from|rpc|storage|functions|auth)\b/.test(source);
  if (!directClient && !directQuery) continue;
  const exceptions = allowed.get(name) || [];
  if (!exceptions.length) {
    violations.push(`${name}: runtime surface reaches Supabase directly instead of a domain service`);
    continue;
  }
  for (const match of source.matchAll(/supabase\.(?:from|rpc|storage|functions|auth)[\s\S]{0,100}/g)) {
    if (!exceptions.some(token => match[0].includes(token))) {
      violations.push(`${name}: unapproved direct Supabase access near ${match[0].slice(0,80).replace(/\s+/g,' ')}`);
    }
  }
}

if (violations.length) {
  console.error('Runtime Supabase boundary audit failed:\n' + violations.map(v => ` - ${v}`).join('\n'));
  process.exit(1);
}
console.log('Runtime Supabase boundary audit passed. Direct runtime access is restricted to explicit public/legacy exceptions.');
