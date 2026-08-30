import { execFileSync } from 'node:child_process';

// Keep the canonical runner aligned with the audit surface declared in package.json.
// A single wave should exercise every architecture contract before build/deploy.
const audits = [
  'audit:routes','audit:capability-services','audit:capability-datasets','audit:membership','audit:membership-preview','audit:workspace-mission','audit:ui','audit:presentation-system','audit:interactions','audit:intelligence','audit:owner-labs','audit:failure-paths','audit:owner-authorization','audit:membership-controls','audit:surface-purpose','audit:location-interoperability','audit:map-routing-authority','audit:map-discovery','audit:discovery-duplication','audit:freshness-confidence','audit:route-evidence-convergence','audit:notification-offline-convergence','audit:rpc-execute-grants','audit:edge-auth-contract','audit:rls-surface','audit:intelligence-action-correlation','audit:fleet-enterprise-network','audit:fleet-operations-2','audit:business-growth','audit:consumer-trust-wave','audit:trust-fleet-progression','audit:community-authority','audit:runtime-supabase-boundary','audit:qr-engagement-convergence','audit:business-operations-authority','audit:access-commerce-convergence','audit:ai-assist-convergence'
];
for (const script of audits) {
  console.log(`\n=== ${script} ===`);
  execFileSync('npm', ['run', script], { stdio: 'inherit' });
}
console.log('\n=== build ===');
execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
console.log('\nCanonical audit suite passed.');
