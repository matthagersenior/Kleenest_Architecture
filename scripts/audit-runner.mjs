import {execFileSync} from 'node:child_process';

const audits=['audit:routes','audit:membership','audit:membership-preview','audit:ui','audit:interactions','audit:intelligence','audit:owner-labs','audit:failure-paths','audit:owner-authorization','audit:membership-controls','audit:surface-purpose','audit:location-interoperability','audit:fleet-enterprise-network','audit:business-growth'];
for(const script of audits){console.log(`\n=== ${script} ===`);execFileSync('npm',['run',script],{stdio:'inherit'});}
console.log('\n=== build ===');execFileSync('npm',['run','build'],{stdio:'inherit'});console.log('\nCanonical audit suite passed.');
