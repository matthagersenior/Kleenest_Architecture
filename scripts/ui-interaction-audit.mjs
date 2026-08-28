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

// JSX attributes can contain arrow functions (`=>`), strings, templates and
// nested expressions. A simple /<button[^>]*>/ regex therefore truncates
// attributes at the `>` in an arrow function and creates false findings.
// This scanner only treats `>` as the end of an opening tag when it is outside
// quoted strings and JSX expression braces.
function openingTags(text, tagName) {
  const results = [];
  const needle = `<${tagName}`;
  let cursor = 0;

  while (cursor < text.length) {
    const start = text.indexOf(needle, cursor);
    if (start === -1) break;
    const boundary = text[start + needle.length];
    if (boundary && !/[\s/>]/.test(boundary)) {
      cursor = start + needle.length;
      continue;
    }

    let i = start + needle.length;
    let quote = null;
    let braceDepth = 0;
    let escaped = false;

    for (; i < text.length; i += 1) {
      const ch = text[i];
      if (quote) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === '{') {
        braceDepth += 1;
        continue;
      }
      if (ch === '}' && braceDepth > 0) {
        braceDepth -= 1;
        continue;
      }
      if (ch === '>' && braceDepth === 0) {
        results.push({ start, end: i + 1, attrs: text.slice(start + needle.length, i) });
        cursor = i + 1;
        break;
      }
    }

    if (i >= text.length) break;
  }

  return results;
}

const failures = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const relative = path.relative(process.cwd(), file);

  for (const match of openingTags(text, 'button')) {
    const attrs = match.attrs;
    const body = text.slice(match.end, Math.min(text.length, match.end + 600));
    const interactive = /\bonClick\s*=/.test(attrs) || /\btype\s*=\s*["']submit["']/.test(attrs) || /\bformAction\s*=/.test(attrs);
    const explicitlyStatic = /\bdisabled\s*=\s*\{?true\}?/.test(attrs) || /\baria-disabled\s*=\s*["']true["']/.test(attrs);
    if (!interactive && !explicitlyStatic && !/\b(button|close|cancel|back|menu|tab|next|previous|view|open|save|delete|edit|add|create|continue|submit|upgrade|manage|refresh|retry|sync|sign|log|logout|login|scan|route|check|review|report|export|import|filter|search|settings|preview|exit|dismiss)/i.test(body)) continue;
    if (!interactive && !explicitlyStatic) failures.push(`${relative}: button without an action or explicit disabled state`);
  }

  for (const match of openingTags(text, 'a')) {
    const attrs = match.attrs;
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
