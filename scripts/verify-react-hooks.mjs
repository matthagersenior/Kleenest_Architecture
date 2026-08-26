import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('src/runtime');
const failures = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(jsx|js|tsx|ts)$/.test(entry.name)) {
      const source = await readFile(full, 'utf8');
      if (/\buseAppContext\s*\(/.test(source) && !/import[^;]*\buseAppContext\b[^;]*from\s*['"](?:\.\.\/)+AppContext\.jsx['"]/.test(source)) {
        failures.push(path.relative(process.cwd(), full));
      }
    }
  }
}

await walk(root);
if (failures.length) {
  console.error('useAppContext is referenced without importing it from AppContext.jsx:');
  for (const file of failures) console.error(` - ${file}`);
  process.exit(1);
}
console.log('React context import audit passed.');
