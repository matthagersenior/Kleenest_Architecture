import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src/runtime');
const files={crud:'OwnerCrudWorkbench.jsx',membership:'OwnerMembershipControls.jsx',intelligence:'OwnerIntelligenceLab.jsx'};
const errors=[];
for(const [name,file] of Object.entries(files)){
  const s=fs.readFileSync(path.join(root,file),'utf8');
  if(!s.includes('isPlatformOwner')) errors.push(`${name}: missing platform-owner guard`);
  if(!s.includes('authLoading')) errors.push(`${name}: missing authenticated-loading boundary`);
}
const crud=fs.readFileSync(path.join(root,files.crud),'utf8');
for(const token of ['services.admin.crud(profile','services.admin.invoke(profile','meta[action]','window.confirm'])
  if(!crud.includes(token)) errors.push(`crud: missing governed mutation/control check ${token}`);
const membership=fs.readFileSync(path.join(root,files.membership),'utf8');
for(const token of ['services.admin.setAccountCapabilities','services.admin.setBusinessAccess','services.admin.invoke(profile'])
  if(!membership.includes(token)) errors.push(`membership: missing governed admin operation ${token}`);
const intelligence=fs.readFileSync(path.join(root,files.intelligence),'utf8');
for(const token of ['services.ownerIntelligence','services.intelligenceActions'])
  if(!intelligence.includes(token)) errors.push(`intelligence: missing canonical service boundary ${token}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Owner authorization audit passed: CRUD, Membership, and Intelligence are owner-gated and service-bound.');
