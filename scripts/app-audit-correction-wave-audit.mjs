import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('.');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const failures=[];
const games=read('src/runtime/GamesPage.jsx');
const nav=read('src/runtime/WorkspaceNavigation.jsx');
const social=read('src/runtime/SocialPage.jsx');
const community=read('src/domains/community/interactions.js');
const follows=read('src/domains/social/follows.js');

for(const token of ['Math.floor(Math.random()*(i+1))','presentedQuestion','option.index','setQuestionIndex(0)'])if(!games.includes(token))failures.push(`GamesPage.jsx: missing quiz randomization contract ${token}`);
if(/question\[1\]\.map\(\(x,i\)/.test(games))failures.push('GamesPage.jsx: raw source-order quiz rendering returned');
for(const token of ['OWNER_UNIVERSAL_NAV','home','explore','routes','saved','activity','play','community','social',"section:'Kleenest'"])if(!nav.includes(token))failures.push(`WorkspaceNavigation.jsx: owner universal navigation missing ${token}`);
if(nav.includes("current.id!=='admin'&&<nav"))failures.push('WorkspaceNavigation.jsx: owner navigation is still suppressed');
for(const token of ['searchUsers','profileHref','Follow reviewer','CONTRIBUTOR PROFILE','DISCOVER PEOPLE'])if(!social.includes(token))failures.push(`SocialPage.jsx: missing contributor discovery contract ${token}`);
if(/profiles:actor_user_id/.test(community))failures.push('community/interactions.js: broken social_activity actor profile embed returned');
if(/client\.from\(['"]follows['"]\)/.test(community))failures.push('community/interactions.js: competing direct follows-table authority returned');
for(const token of ['createFollowService','follows.toggle','follows.listFollowing','follows.listFollowers'])if(!community.includes(token))failures.push(`community/interactions.js: missing canonical follow delegation ${token}`);
for(const token of ['list_following_users','list_follower_users','is_following_user','follow_user','unfollow_user'])if(!follows.includes(token))failures.push(`domains/social/follows.js: missing RPC authority ${token}`);

if(failures.length){console.error('App audit correction wave FAILED');failures.forEach(item=>console.error(`- ${item}`));process.exit(1);}
console.log('App audit correction wave passed: quiz answers are randomized safely, Owner Control keeps universal navigation, and social discovery/follows use canonical authority.');
