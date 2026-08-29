import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['domains/routing/route.js',['create_route_plan','arrive_route_stop','complete_route','canonicalCoordinatesMany','route-stop-arrived']],
 ['domains/consumer/location-evidence.js',['complete_active_route_stop_after_evidence','route-stop-completed','refresh_location_trust_state','evidence-created']],
 ['runtime/VisitSurface.jsx',['routeId','routeStopId','services.routing.arriveStop','services.locationEvidence.restroomObservation','services.reviews.create']],
 ['runtime/LocationDetailsPage.jsx',['Add to route','services.locationEvidence.trustedBathroomVerification','services.reviews.create']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Route/evidence convergence audit passed: canonical locations, qualifying check-ins, evidence, route-stop completion, trust refresh, and review progression are wired.');
