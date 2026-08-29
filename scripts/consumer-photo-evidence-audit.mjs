import fs from 'node:fs';

const service = fs.readFileSync('src/domains/consumer/photo.js', 'utf8');
const required = [
  "from('location-photos').upload",
  "submit_location_photo_record",
  'p_check_in_id',
  'MAX_BYTES',
];
for (const token of required) {
  if (!service.includes(token)) throw new Error(`consumer photo evidence contract missing: ${token}`);
}
console.log('consumer-photo-evidence-audit: PASS');
