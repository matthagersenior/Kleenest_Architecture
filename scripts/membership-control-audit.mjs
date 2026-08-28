import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/runtime');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.jsx?$/.test(entry.name)) files.push(full);
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

const workspaceFiles = files.filter((file) => /Consumer|Business|Fleet|Enterprise|Owner|Membership|Workspace|Profile|Progression|Map|Route|Location|Notification/i.test(path.basename(file)));
const findings = [];

for (const file of workspaceFiles) {
  const relative = path.relative(process.cwd(), file);
  const text = fs.readFileSync(file, 'utf8');
  const scanText = maskTemplateLiteralBodies(text);

  for (const match of openingTags(scanText, 'button')) {
    const attrs = match.attrs;
    const interactive = /\bonClick\s*=/.test(attrs) || /\btype\s*=\s*["']submit["']/.test(attrs) || /\bformAction\s*=/.test(attrs);
    const explicitlyStatic = /\bdisabled\s*(?:=\s*(?:\{[^}]*\}|["'][^"']*["']))?/.test(attrs) || /\baria-disabled\s*=\s*["']true["']/.test(attrs);
    const delegated = /\{\.\.\.[A-Za-z_$][\w$]*\}/.test(attrs);
    const implicitSubmit = !/\btype\s*=/.test(attrs) && scanText.slice(0, match.start).lastIndexOf('<form') > scanText.slice(0, match.start).lastIndexOf('</form');
    if (!interactive && !explicitlyStatic && !delegated && !implicitSubmit) findings.push(`${relative}: button without an action or explicit disabled state`);
  }

  if (/\.from\(['"](businesses|locations|fleet_|enterprise_|intelligence_|notifications|activity_events)/.test(text) && /\.insert\(|\.update\(|\.delete\(/.test(text)) {
    findings.push(`${relative}: direct protected-table mutation; use canonical RPC/service`);
  }
  if (/onClick=\{\(\)\s*=>\s*(?:console\.log|alert)\b/.test(text)) findings.push(`${relative}: placeholder interaction handler detected`);
  if (/href=["']#["']|to=["']#["']/.test(text)) findings.push(`${relative}: placeholder # navigation detected`);
}

const report = { generatedAt: new Date().toISOString(), sourceFiles: workspaceFiles.length, findings };
console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exitCode = 1;
