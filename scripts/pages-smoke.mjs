import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const required = ['index.html', 'package.json', 'src/main.jsx', 'vite.config.js'];
for (const file of required) {
  if (!existsSync(new URL(file, root))) throw new Error(`Missing required Pages application file: ${file}`);
}
const index = readFileSync(new URL('index.html', root), 'utf8');
if (!index.includes('id="root"')) throw new Error('index.html does not contain the React root');
if (index.includes('Profile') || index.includes('Interoperability') || index.includes('Production signals')) {
  throw new Error('Static capability explorer detected in application entrypoint');
}
console.log('Pages application entrypoint verified.');
