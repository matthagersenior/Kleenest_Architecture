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

// Route-specific HTML was previously able to shadow the canonical SPA on GitHub Pages.
// Keep product routes runtime-owned: their entrypoints must not exist as committed HTML.
const forbiddenRouteEntries = [
  'consumer/index.html', 'business/index.html', 'fleet/index.html', 'enterprise/index.html',
  'admin/index.html', 'owner/index.html', 'map/index.html', 'route/index.html',
  'play/index.html', 'games/index.html', 'community/index.html', 'interaction/index.html',
  'interactions/index.html', 'intelligence/index.html', 'saved/index.html'
];
for (const file of forbiddenRouteEntries) {
  if (existsSync(new URL(file, root))) throw new Error(`Stale static route entry detected: ${file}`);
}

console.log('Pages application entrypoint and route ownership verified.');
