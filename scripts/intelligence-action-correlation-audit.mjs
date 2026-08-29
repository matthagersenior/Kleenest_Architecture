import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['domains/intelligence/actions.js',['createAction','execute','complete']],
 ['domains/intelligence/convergence.js',['createAction','executeAction','completeAction','processJobs']],
 ['domains/business/intelligence.js',['executeAction','attributionFunnel','roi']],
 ['runtime/BusinessIntelligencePage.jsx',['actionLinks','intelligence-action-completed','intelligence-updated']],
 ['runtime/BusinessIntelligenceActions.jsx',['executeAction','intelligence-action-completed','intelligence-updated']]
];
const missing=[];
for(const [rel,tokens] of required){const f=path.join(root,rel);if(!fs.existsSync(f)){missing.push(`${rel}: file missing`);continue}const t=fs.readFileSync(f,'utf8');for(const x of tokens)if(!t.includes(x))missing.push(`${rel}: missing ${x}`)}
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Intelligence action correlation audit passed: action lifecycle, business execution, outcome refresh, and attribution/ROI contracts are present.');
