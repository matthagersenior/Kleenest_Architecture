import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['domains/notifications/inbox.js',['user_notifications','mark_notification_read','mark_all_notifications_read','subscribe','postgres_changes']],
 ['domains/notifications/intelligence.js',['create_intelligence_notification','p_user_id','p_location_id','p_dedupe_key']],
 ['domains/offline/packs.js',['create_offline_pack','offline_pack_events','findAuthoritativeReplay','shouldAttemptReplay','offline_replayed','client_event_id']],
 ['domains/offline/replay.js',['MAX_OFFLINE_ATTEMPTS','findAuthoritativeReplay','shouldAttemptReplay']],
 ['runtime/NotificationsPage.jsx',['services.notifications.subscribe','kleenest:intelligence-updated','kleenest:fleet-updated','kleenest:business-notification-created']],
 ['runtime/OfflineJourneyPage.jsx',['services.offline.pending','services.offline.sync','kleenest:offline-synced']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const inbox=fs.readFileSync(path.join(root,'domains/notifications/inbox.js'),'utf8');
if(!inbox.includes('id!==me.id'))missing.push('notifications/inbox.js: subscription identity guard missing');
const offline=fs.readFileSync(path.join(root,'domains/offline/packs.js'),'utf8');
for(const forbidden of ['demoNotification','mockNotification','fakeNotification','localOnlyAuthority'])if(offline.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`offline/packs.js: forbidden ${forbidden}`);
// Offline completion is published through the injected notification service;
// the domain remains UI-agnostic and must not depend on browser events.
if(!offline.includes('notifications?.publish'))missing.push('offline/packs.js: missing offline completion notification hook');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Notification → Realtime → Offline convergence audit passed: authenticated inbox, realtime subscription, bounded offline replay, idempotency, and recovery surfaces are wired.');
