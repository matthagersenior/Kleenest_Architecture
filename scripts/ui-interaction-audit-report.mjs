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

function openingTags(text, tagName) {
  const results = [];
  const needle = `<${tagName}`;
  let cursor = 0;
  while (cursor < text.length) {
    const start = text.indexOf(needle, cursor);
    if (start === -1) break;
    const boundary = text[start + needle.length];
    if (boundary && !/[\s/>]/.test(boundary)) { cursor = start + needle.length; continue; }
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
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '{') { braceDepth += 1; continue; }
      if (ch === '}' && braceDepth > 0) { braceDepth -= 1; continue; }
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

function maskTemplateLiteralBodies(text) {
  const chars = [...text];
  let inTemplate = false;
  let escaped = false;
  let interpolationDepth = 0;
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    if (!inTemplate) { if (ch === '`') { inTemplate = true; escaped = false; } continue; }
    if (escaped) { if (ch !== '\n' && ch !== '\r') chars[i] = ' '; escaped = false; continue; }
    if (ch === '\\') { chars[i] = ' '; escaped = true; continue; }
    if (interpolationDepth === 0) {
      if (ch === '`') { chars[i] = ' '; inTemplate = false; }
      else if (ch === '$' && chars[i + 1] === '{') { chars[i] = ' '; chars[i + 1] = ' '; interpolationDepth = 1; i += 1; }
      else if (ch !== '\n' && ch !== '\r') chars[i] = ' ';
      continue;
    }
    if (ch === '{') interpolationDepth += 1;
    else if (ch === '}') interpolationDepth -= 1;
    if (interpolationDepth === 0) chars[i] = ' ';
  }
  return chars.join('');
}

function isInsideForm(text, position) {
  const before = text.slice(0, position);
  return before.lastIndexOf('<form') > before.lastIndexOf('</form');
}

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const scanText = maskTemplateLiteralBodies(text);
  const relative = path.relative(process.cwd(), file);
  for (const match of openingTags(scanText, 'button')) {
    const attrs = match.attrs;
    const line = scanText.slice(0, match.start).split('\n').length;
    const interactive = /\bonClick\s*=/.test(attrs) || /\btype\s*=\s*["']submit["']/.test(attrs) || /\bformAction\s*=/.test(attrs);
    const explicitlyStatic = /\bdisabled\s*(?:=\s*(?:\{[^}]*\}|["'][^"']*["']))?/.test(attrs) || /\baria-disabled\s*=\s*["']true["']/.test(attrs);
    const delegated = /\{\.\.\.[A-Za-z_$][\w$]*\}/.test(attrs);
    const implicitSubmit = !/\btype\s*=/.test(attrs) && isInsideForm(scanText, match.start);
    if (!interactive && !explicitlyStatic && !delegated && !implicitSubmit) findings.push({file:relative,line,kind:'button-without-action'});
  }
  for (const match of openingTags(scanText, 'a')) {
    const attrs = match.attrs;
    const line = scanText.slice(0, match.start).split('\n').length;
    if (!/\bhref\s*=/.test(attrs) && !/\bonClick\s*=/.test(attrs)) findings.push({file:relative,line,kind:'anchor-without-destination'});
    if (/href\s*=\s*["']#["']/.test(attrs) || /href\s*=\s*["']javascript:/i.test(attrs)) findings.push({file:relative,line,kind:'placeholder-anchor'});
  }
}

const counts = findings.reduce((m,f)=>(m[f.kind]=(m[f.kind]||0)+1,m),{});
console.log(JSON.stringify({filesScanned:files.length,totalFindings:findings.length,counts,findings:findings.slice(0,200)},null,2));
process.exitCode=findings.length?1:0;