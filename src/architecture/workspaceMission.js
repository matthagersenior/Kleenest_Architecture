export const WORKSPACE_MISSIONS=Object.freeze({
  consumer:Object.freeze({
    purpose:'Make the public service of finding, verifying, and improving restroom information useful and fun.',
    primaryOutcomes:['discover trusted bathrooms','verify condition and amenities','contribute evidence','earn progression and reputation','share useful community signal'],
    requiredDomains:['locations','discovery','maps','checkins','reviews','evidence','progression','quests','rewards','reputation','social','notifications','offline'],
    directDomains:['locations','discovery','maps','checkins','reviews','evidence','progression','rewards','reputation','social','notifications','offline'],
    avoid:['operator-only controls','unexplained enterprise metrics','paid-placement experiences that obscure trust']
  }),
  business:Object.freeze({
    purpose:'Help a business manage its restroom presence, engage customers, monitor outcomes, and deploy growth capabilities.',
    primaryOutcomes:['manage locations and restroom truth','deploy QR/geofence engagement','run promotions campaigns contests and events','respond to reviews','measure engagement ROI','act on business intelligence'],
    requiredDomains:['business','businessLifecycle','qr','geofencing','reviews','leaderboards','notifications','analytics','intelligence','reporting','monetization'],
    directDomains:['business','businessLifecycle','qr','geofencing','reviews','leaderboards','notifications','analytics','intelligence','reporting','monetization'],
    avoid:['fleet dispatch controls unless the tier includes Fleet','consumer-game-first navigation']
  }),
  fleet:Object.freeze({
    purpose:'Turn restroom and route intelligence into a dispatchable operational system for vehicles, drivers, stops, service, and performance.',
    primaryOutcomes:['assign drivers and vehicles','dispatch locked operational routes','track ETA versus actual','measure stop dwell and TTL','monitor maintenance and alerts','compare route driver and vehicle performance','act on fleet intelligence'],
    requiredDomains:['fleet','maps','locations','geofencing','leaderboards','notifications','analytics','intelligence','reporting','offline'],
    directDomains:['fleet','maps','locations','geofencing','leaderboards','notifications','analytics','intelligence','reporting','offline'],
    avoid:['editable dispatched stop order','duplicate routing authority','metrics without actionable operational context']
  }),
  enterprise:Object.freeze({
    purpose:'Coordinate partner networks, allocations, campaigns, fleet operations, benchmarks, and outcomes across organizations.',
    primaryOutcomes:['manage partner networks','allocate locations and programs','coordinate campaigns','benchmark network performance','measure attributed outcomes','govern shared intelligence'],
    requiredDomains:['enterprise','business','fleet','leaderboards','notifications','analytics','intelligence','reporting','externalData'],
    directDomains:['enterprise','leaderboards','notifications','analytics','intelligence','reporting','externalData'],
    avoid:['single-location-only framing','shadow metrics engines']
  }),
  admin:Object.freeze({
    purpose:'Operate and govern the Kleenest platform with complete visibility into capabilities, data health, access, ingestion, security, and production readiness.',
    primaryOutcomes:['inspect capability coverage','configure platform data','monitor ingestion and datasets','review security and RLS posture','operate moderation and support','inspect jobs events and delivery health','preview every tier safely'],
    requiredDomains:['admin','externalData','support','notifications','analytics','intelligence','reporting','monetization','locations','business','fleet','enterprise'],
    directDomains:['admin','externalData','support','notifications','analytics','intelligence','reporting','monetization','locations','fleet','enterprise'],
    avoid:['hidden privileged controls','direct public mutation paths','uncategorized operational datasets']
  })
});
export const WORKSPACE_MISSION_IDS=Object.freeze(Object.keys(WORKSPACE_MISSIONS));
export function getWorkspaceMission(workspace='consumer'){return WORKSPACE_MISSIONS[workspace]||WORKSPACE_MISSIONS.consumer;}
