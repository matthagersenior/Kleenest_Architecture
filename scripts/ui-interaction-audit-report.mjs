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

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const relative = path.relative(process.cwd(), file);
  for (const match of text.matchAll(/<button\b([^>]*)>/g)) {
    const attrs = match[1];
    const line = text.slice(0, match.index).split('\n').length;
    const interactive = /\bonClick\s*=/.test(attrs) || /\btype\s*=\s*["']submit["']/.test(attrs) || /\bformAction\s*=/.test(attrs);
    const explicitlyStatic = /\bdisabled\s*=\s*\{?true\}?/.test(attrs) || /\baria-disabled\s*=\s*["']true["']/.test(attrs);
    if (!interactive && !explicitlyStatic) findings.push({file:relative,line,kind:'button-without-action'});
  }
  for (const match of text.matchAll(/<a\b([^>]*)>/g)) {
    const attrs = match[1];
    const line = text.slice(0, match.index).split('\n').length;
    if (!/\bhref\s*=/.test(attrs) && !/\bonClick\s*=/.test(attrs)) findings.push({file:relative,line,kind:'anchor-without-destination'});
    if (/href\s*=\s*["']#["']/.test(attrs) || /href\s*=\s*["']javascript:/i.test(attrs)) findings.push({file:relative,line,kind:'placeholder-anchor'});
  }
}

const counts = findings.reduce((m,f)=>(m[f.kind]=(m[f.kind]||0)+1,m),{});
console.log(JSON.stringify({filesScanned:files.length,totalFindings:findings.length,counts,findings:findings.slice(0,200)},null,2));
process.exitCode=findings.length?1:0;
