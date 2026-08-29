import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
}
walk(root);

const failures = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const relative = path.relative(process.cwd(), file);
  for (const match of text.matchAll(/<button\b([^>]*)>/g)) {
    const attrs = match[1];
    const bodyStart = match.index + match[0].length;
    const close = text.indexOf('</button>', bodyStart);
    const body = text.slice(bodyStart, close >= 0 ? close : Math.min(text.length, bodyStart + 600));
    const forwardsProps = /\{\s*\.\.\.[A-Za-z_$][\w$]*\s*\}/.test(attrs);
    const delegatedAction = /\bdata-[A-Za-z0-9_-]+\s*=/.test(attrs);
    const interactive = /\bonClick\s*=/.test(attrs) || /\btype\s*=\s*["']submit["']/.test(attrs) || /\bformAction\s*=/.test(attrs) || forwardsProps || delegatedAction;
    const explicitlyStatic = /\bdisabled\s*=/.test(attrs) || /\baria-disabled\s*=/.test(attrs);
    if (!interactive && !explicitlyStatic && !/\b(button|close|cancel|back|menu|tab|next|previous|view|open|save|delete|edit|add|create|continue|submit|upgrade|manage|refresh|retry|sync|sign|log|logout|login|scan|route|check|review|report|export|import|filter|search|settings|preview|exit|dismiss)/i.test(body)) continue;
    if (!interactive && !explicitlyStatic) failures.push(`${relative}: button without an action or explicit disabled state`);
  }
  for (const match of text.matchAll(/<a\b([^>]*)>/g)) {
    const attrs = match[1];
    if (!/\bhref\s*=/.test(attrs) && !/\bonClick\s*=/.test(attrs)) failures.push(`${relative}: anchor without href or onClick`);
    if (/href\s*=\s*["']#["']/.test(attrs) || /href\s*=\s*["']javascript:/i.test(attrs)) failures.push(`${relative}: placeholder anchor destination`);
  }
}

if (failures.length) {
  console.error(`UI interaction audit failed with ${failures.length} finding(s):`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`UI interaction audit passed across ${files.length} source files.`);
