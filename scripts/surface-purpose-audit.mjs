#!/usr/bin/env node
/** Structural UI purpose audit. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT=path.resolve(process.argv[2]||'src');
const EXT=new Set(['.js','.jsx','.ts','.tsx']);
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git','dist','build'].includes(entry.name))continue;const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(EXT.has(path.extname(entry.name)))files.push(p);}}
walk(ROOT);
const findings=[];
for(const file of files){const text=fs.readFileSync(file,'utf8');
  const openingRe=/<button\b([^>]*)>/gi;let m;
  while((m=openingRe.exec(text))){const attrs=m[1];const hasHandler=/\bon(?:Click|Submit|MouseDown|MouseUp|KeyDown|KeyUp|Change)\s*=|\btype\s*=\s*["']submit["']|\.\.\.[A-Za-z_$][\w$]*/i.test(attrs);const explicitNonSubmit=/\btype\s*=\s*["'](?:button|reset)["']/i.test(attrs);const disabled=/\bdisabled\s*=/.test(attrs);if(explicitNonSubmit&&!hasHandler&&!disabled)findings.push({file:path.relative(process.cwd(),file),kind:'button-without-observable-action',label:'explicit non-submit button'});}
  if(/(?:href|to)\s*=\s*["']#["']/.test(text))findings.push({file:path.relative(process.cwd(),file),kind:'placeholder-navigation'});
  if(/onClick\s*=\s*\{\(\)\s*=>\s*(?:console\.log|alert)\b/.test(text))findings.push({file:path.relative(process.cwd(),file),kind:'placeholder-interaction'});
}
console.log(JSON.stringify({root:ROOT,filesScanned:files.length,findings},null,2));
if(process.env.CI==='true'&&findings.length)process.exitCode=1;
