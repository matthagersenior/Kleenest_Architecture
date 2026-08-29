import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/runtime');
const violations = [];

for (const name of fs.readdirSync(root)) {
  if (!/\.(jsx?|tsx?)$/.test(name)) continue;
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  const directClient = /infrastructure\/supabase\/client/.test(source);
  const directQuery = /\bsupabase\.(?:from|rpc|storage|functions|auth)\b/.test(source);
  if (directClient || directQuery) {
    violations.push(`${name}: runtime surface reaches Supabase directly instead of a domain/service boundary`);
  }
}

if (violations.length) {
  console.error('Runtime Supabase boundary audit failed:\n' + violations.map(v => ` - ${v}`).join('\n'));
  process.exit(1);
}
console.log('Runtime Supabase boundary audit passed. Runtime surfaces contain no direct Supabase access.');
