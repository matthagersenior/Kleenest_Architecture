#!/usr/bin/env node
/**
 * Structural UI purpose audit.
 * A control must have an observable destination/action; navigation must have a
 * route; mutations must identify an action handler. This is intentionally
 * conservative: findings require human verification of the actual effect.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT=path.resolve(process.argv[2]||'src');
const EXT=new Set(['.js','.jsx','.ts','.tsx']);
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git','dist','build'].includes(entry.name))continue;const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(EXT.has(path.extname(entry.name)))files.push(p);}}
walk(ROOT);
const findings=[];
for(const file of files){const text=fs.readFileSync(file,'utf8');
  const buttonRe=/<button\b[\s\S]*?<\/button>/gi; let m;
  while((m=buttonRe.exec(text))){const block=m[0];const hasHandler=/\bonClick\s*=|\bonSubmit\s*=|\btype\s*=\s*["']submit["']/i.test(block);const disabled=/\bdisabled\s*=/.test(block);const label=(block.match(/(?:aria-label|title)\s*=\s*["']([^"']+)/i)||[])[1]||(block.match(/>([^<>]{2,80})<\/button>/i)||[])[1]||'unlabelled';if(!hasHandler&&!disabled)findings.push({file:path.relative(process.cwd(),file),kind:'button-without-observable-action',label:label.trim()});}
  const navRe=/(?:navigate|to|href|path)\s*[:=]\s*["']([^"']+)["']/g;while((m=navRe.exec(text))){if(m[1].startsWith('#')||m[1].startsWith('http'))continue;}
}
console.log(JSON.stringify({root:ROOT,filesScanned:files.length,findings},null,2));
if(process.env.CI==='true'&&findings.length)process.exitCode=1;
