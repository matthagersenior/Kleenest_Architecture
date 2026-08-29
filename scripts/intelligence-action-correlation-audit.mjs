import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['domains/intelligence/actions.js',['createIntelligenceActionService','execute','complete','createLink']],
 ['domains/intelligence/convergence.js',['createAction','executeAction','completeAction','processJobs']],
 ['domains/business/intelligence.js',['executeAction','attributionFunnel','roi']],
 ['runtime/BusinessIntelligencePage.jsx',['actionLinks','kleenest:intelligence-updated']],
 ['runtime/BusinessIntelligenceActions.jsx',['executeAction','kleenest:intelligence-action-completed','kleenest:intelligence-updated']]
];
const missing=[];
for(const [rel,tokens] of required){const f=path.join(root,rel);if(!fs.existsSync(f)){missing.push(`${rel}: file missing`);continue}const t=fs.readFileSync(f,'utf8');for(const x of tokens)if(!t.includes(x))missing.push(`${rel}: missing ${x}`)}
const actions=fs.readFileSync(path.join(root,'domains/intelligence/actions.js'),'utf8');
if(!actions.includes("outcome('completed'"))missing.push('domains/intelligence/actions.js: missing completed outcome publication');
const page=fs.readFileSync(path.join(root,'runtime/BusinessIntelligencePage.jsx'),'utf8');
if(!page.includes("addEventListener('kleenest:intelligence-updated'"))missing.push('runtime/BusinessIntelligencePage.jsx: missing intelligence refresh subscription');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Intelligence action correlation audit passed: action lifecycle, business execution, outcome refresh, and attribution/ROI contracts are present.');
