import fs from 'node:fs';
import path from 'node:path';

const roots=[path.resolve('src/runtime'),path.resolve('src/components'),path.resolve('src/consumer')].filter(fs.existsSync);
const files=[];
for(const root of roots){const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.jsx?$/.test(entry.name))files.push(full)}};walk(root)}
const failures=[];
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  const rel=path.relative(process.cwd(),file);
  for(const match of text.matchAll(/<button\b([^>]*)>/g)){
    const attrs=match[1];
    const styled=/\bclassName\s*=/.test(attrs)||/\bstyle\s*=/.test(attrs);
    if(!styled)failures.push(`${rel}: button without className/style presentation hook`);
  }
  for(const match of text.matchAll(/<Link\b([^>]*)>/g)){
    const attrs=match[1];
    if(!/\bclassName\s*=/.test(attrs))failures.push(`${rel}: Link without className presentation hook`);
  }
  for(const tag of ['select','textarea'])for(const match of text.matchAll(new RegExp(`<${tag}\\b([^>]*)>`,'g'))){
    const attrs=match[1];
    if(!/\bclassName\s*=/.test(attrs)&&!/<label\b/.test(text.slice(Math.max(0,match.index-300),match.index)))failures.push(`${rel}: ${tag} has no className or labeled form presentation context`);
  }
}
const cssFiles=[];
for(const root of [path.resolve('src')]){const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.css$/.test(entry.name))cssFiles.push(full)}};walk(root)}
const css=cssFiles.map(file=>fs.readFileSync(file,'utf8')).join('\n');
for(const token of ['button','input','select','textarea','.workspace-nav-link','.detail-panel','.result-card','.business-row','.reward-stat','.status-pill','.tier-hero','.page-header']){
  if(!css.includes(token))failures.push(`styles: missing shared presentation coverage for ${token}`);
}
if(!css.includes(':focus')&&!css.includes(':focus-visible'))failures.push('styles: focus-state coverage missing');
if(!css.includes('@media'))failures.push('styles: responsive presentation coverage missing');

if(failures.length){console.error(`Presentation system audit failed with ${failures.length} finding(s).`);for(const item of failures.slice(0,150))console.error(`- ${item}`);process.exit(1)}
console.log(`Presentation system audit passed across ${files.length} UI source files and ${cssFiles.length} stylesheets.`);
