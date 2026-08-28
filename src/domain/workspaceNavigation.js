export const WORKSPACE_ORDER=Object.freeze(['consumer','business','fleet','enterprise','admin']);

export const WORKSPACES=Object.freeze({
 consumer:Object.freeze({id:'consumer',label:'Kleenest',shortLabel:'You',description:'Find cleaner places, record visits, and earn rewards.'}),
 business:Object.freeze({id:'business',label:'Business',shortLabel:'Business',description:'Manage locations, customer engagement, and growth.'}),
 fleet:Object.freeze({id:'fleet',label:'Fleet',shortLabel:'Fleet',description:'Run vehicles, routes, service, maintenance, and metrics.'}),
 enterprise:Object.freeze({id:'enterprise',label:'Enterprise',shortLabel:'Enterprise',description:'Manage networks, partners, allocations, and outcomes.'}),
 admin:Object.freeze({id:'admin',label:'Owner Control',shortLabel:'Owner',description:'Control the Kleenest platform, data, access, and governance.'})
});

export const WORKSPACE_NAVIGATION=Object.freeze({
 consumer:Object.freeze([
  {id:'home',label:'Home',path:'/',section:'Primary',primary:true},
  {id:'explore',label:'Explore',path:'/map',section:'Primary',primary:true},
  {id:'routes',label:'Routes',path:'/route',section:'Primary',primary:true},
  {id:'saved',label:'Saved',path:'/saved',section:'Primary'},
  {id:'activity',label:'Activity',path:'/activity',section:'Primary'},
  {id:'play',label:'Rewards & Play',path:'/play',section:'Play'},
  {id:'community',label:'Community',path:'/community',section:'Connect'},
  {id:'notifications',label:'Notifications',path:'/notifications',section:'Account'},
  {id:'profile',label:'Profile',path:'/profile',section:'Account'}
 ]),
 business:Object.freeze([
  {id:'overview',label:'Overview',path:'/business',section:'Manage',primary:true},
  {id:'locations',label:'Locations',path:'/business/assets',section:'Manage',primary:true},
  {id:'qr',label:'QR Check-In',path:'/business/qr',section:'Engage',primary:true},
  {id:'promotions',label:'Promotions',path:'/business/promotions',section:'Engage'},
  {id:'campaigns',label:'Campaigns',path:'/business/campaigns',section:'Engage'},
  {id:'events',label:'Events',path:'/business/events',section:'Engage'},
  {id:'contests',label:'Contests',path:'/business/contests',section:'Engage'},
  {id:'reviews',label:'Reviews',path:'/business/reviews',section:'Insights'},
  {id:'analytics',label:'Analytics',path:'/business/analytics',section:'Insights'},
  {id:'intelligence',label:'Intelligence',path:'/business/intelligence',section:'Insights'},
  {id:'plan',label:'Plan & Access',path:'/business/entitlements',section:'Account'}
 ]),
 fleet:Object.freeze([
  {id:'command',label:'Command',path:'/fleet',section:'Operate',primary:true},
  {id:'routes',label:'Routes',path:'/fleet/routes',section:'Operate',primary:true},
  {id:'operations',label:'Operations',path:'/fleet/opportunities',section:'Operate',primary:true},
  {id:'intelligence',label:'Intelligence',path:'/fleet/intelligence',section:'Insights'},
  {id:'performance',label:'Performance',path:'/fleet/performance',section:'Insights'},
  {id:'notifications',label:'Notifications',path:'/notifications',section:'Account'}
 ]),
 enterprise:Object.freeze([
  {id:'command',label:'Command',path:'/enterprise',section:'Operate',primary:true},
  {id:'partners',label:'Partners & Networks',path:'/enterprise/partners',section:'Manage',primary:true},
  {id:'campaigns',label:'Campaigns',path:'/enterprise/campaigns',section:'Manage'},
  {id:'fleet',label:'Fleet',path:'/enterprise/fleet',section:'Operate'},
  {id:'analytics',label:'Performance & Analytics',path:'/enterprise/performance',section:'Insights'},
  {id:'reports',label:'Reports',path:'/enterprise/reports',section:'Insights'}
 ]),
 admin:Object.freeze([
  {id:'overview',label:'Platform Overview',path:'/owner',section:'Platform',primary:true},
  {id:'crud',label:'Platform CRUD',path:'/owner/data',section:'Platform',primary:true},
  {id:'capabilities',label:'Capabilities',path:'/admin/capabilities',section:'Governance'},
  {id:'security',label:'Security & Maintenance',path:'/admin/maintenance',section:'Governance'},
  {id:'audit',label:'Audit History',path:'/owner/audit',section:'Governance'},
  {id:'preview',label:'Membership Preview',path:'/owner/preview',section:'Governance'}
 ])
});

export const NAVIGATION_ALIASES=Object.freeze({
 '/discover':'/map','/interaction':'/check-in','/interactions':'/check-in','/visit':'/check-in',
 '/check-in':'/check-in','/play/quests':'/play/quest','/quests':'/play/quest','/rewards':'/play','/contests':'/play',
 '/leaderboard':'/leaderboards','/social':'/community','/business/dashboard':'/business/analytics','/business/manage':'/business',
 '/business/qr-studio':'/business/qr','/business/performance':'/business/analytics','/fleet/goals':'/fleet/performance',
 '/enterprise/intelligence':'/enterprise/performance','/admin':'/owner','/admin/crud':'/owner/data','/admin/operational-capabilities':'/owner/operational-capabilities',
 '/admin/intelligence':'/admin/capabilities','/admin/reports':'/business/reports'
});

export function normalizeNavigationPath(path='/'){
 const value=String(path||'/');
 const base=value.split('?')[0].split('#')[0]||'/';
 return base.length>1?base.replace(/\/+$/,''):base;
}
export function getCanonicalNavigationPath(path='/'){
 const normalized=normalizeNavigationPath(path);
 return NAVIGATION_ALIASES[normalized]||normalized;
}
export function getWorkspace(id='consumer'){return WORKSPACES[id]||WORKSPACES.consumer;}
export function getNavigationForWorkspace(workspace='consumer'){return WORKSPACE_NAVIGATION[workspace]||[];}
export function getPrimaryNavigationForWorkspace(workspace='consumer'){return getNavigationForWorkspace(workspace).filter(item=>item.primary);}
export function getNavigationSections(workspace='consumer'){
 return getNavigationForWorkspace(workspace).reduce((sections,item)=>{const key=item.section||'Primary';(sections[key] ||= []).push(item);return sections},{})
}
