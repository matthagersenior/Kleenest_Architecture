import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const targets = [
  ['domains/social/follows.js', ['client.rpc(\'follow_user\'', 'client.rpc(\'unfollow_user\'', 'client.rpc(\'list_following_users\'', 'client.rpc(\'is_following_user\'']],
];
const failures = [];
for (const [relative, tokens] of targets) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) { failures.push(`${relative}: missing`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  for (const token of tokens) if (!text.includes(token)) failures.push(`${relative}: missing canonical contract ${token}`);
  if (/client\.from\(['"]follows['"]\)/.test(text)) failures.push(`${relative}: direct protected follows-table access remains`);
}
if (failures.length) {
  console.error('Community authority audit FAILED');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('Community authority audit passed: follow reads and mutations use canonical RPC authority.');
