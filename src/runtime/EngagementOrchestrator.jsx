import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

function Result({result}){if(!result)return null;const entries=Array.isArray(result)?result:[result];return <div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">RESULT</span><h2>Completed</h2></div></div><div className="detail-grid">{entries.slice(0,8).map((item,i)=><div className="metric-card" key={i}><strong>{typeof item==='object'?item.name||item.title||item.status||item.event_type||`Result ${i+1}`:String(item)}</strong>{typeof item==='object'&&<span>{item.message||item.description||item.id||'Action completed'}</span>}</div>)}</div></div>}

export default function EngagementOrchestrator({locationId='',qrCodeId='',geofenceId='',questId=''}){
 const {services}=useAppContext(); const [eventType,setEventType]=useState('arrival'); const [result,setResult]=useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 async function run(action){setBusy(true);setError('');try{setResult(await action())}catch(e){setError(e?.message||String(e))}finally{setBusy(false)}}
 async function recordCanonicalGeofenceEngagement(){
  if(!locationId||!geofenceId)throw new Error('A canonical location and geofence are required.');
  const event=await services.geofencing.recordEvent({geofenceId,locationId,eventType,qrCodeId:qrCodeId||null});
  const row=Array.isArray(event)?event[0]:event;
  const geofenceEventId=row?.id||row?.geofence_event_id||null;
  if(!geofenceEventId)throw new Error('Geofence event was not returned by the authoritative service.');
  const triggered=eventType==='exit'?null:await services.geofencing.triggerQuests({locationId,geofenceEventId,eventType,metadata:{source:'engagement-orchestrator',qrCodeId:qrCodeId||null}});
  await services.analytics.record('geofence_engagement',{featureCode:'location_geofence',subjectType:'location',subjectId:locationId,locationId,metadata:{geofence_id:geofenceId,geofence_event_id:geofenceEventId,event_type:eventType,qr_code_id:qrCodeId||null,quest_trigger_result:triggered}});
  window.dispatchEvent(new CustomEvent('kleenest:geofence-engagement',{detail:{locationId,geofenceId,eventType,geofenceEventId,triggered}}));
  return {event,triggered};
 }
 return <WorkspaceShell><section className="page"><div className="page-header"><div><span className="eyebrow">ENGAGEMENT FLOW</span><h1>Orchestrate a visit</h1><p>Connect location signals, quests, notifications, and network intelligence through the canonical event graph.</p></div><div className="hero-actions"><Link className="secondary" to="/map">Map</Link><Link className="secondary" to="/play">Progression</Link><Link className="secondary" to="/intelligence">Intelligence</Link></div></div>{error&&<p className="form-error" role="alert">{error}</p>}<div className="detail-grid"><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LOCATION</span><h2>Trigger signal</h2></div></div><label>Event<select value={eventType} onChange={e=>setEventType(e.target.value)}><option>arrival</option><option>enter</option><option>dwell</option><option>exit</option></select></label><button className="primary" disabled={busy||!locationId||!geofenceId} onClick={()=>run(recordCanonicalGeofenceEngagement)}>{busy?'Working…':'Record geofence event'}</button></div><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">OPPORTUNITY</span><h2>Activate engagement</h2></div></div><div className="hero-actions"><button className="primary" disabled={busy||!locationId||!geofenceId} onClick={()=>run(recordCanonicalGeofenceEngagement)}>Trigger quest from signal</button><button className="secondary" disabled={busy||!questId} onClick={()=>run(()=>services.quests.start(questId))}>Start quest</button><button className="secondary" disabled={busy||!locationId} onClick={()=>run(()=>services.geofencing.notifyNearby(locationId,100,'restroom'))}>Notify nearby</button></div></div><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">NETWORK</span><h2>Refresh intelligence</h2></div></div><p>Use the canonical platform intelligence feed to continue the engagement loop.</p><button className="secondary" disabled={busy} onClick={()=>run(()=>services.intelligence.crossTierLeaderboard('consumer_checkins',25))}>Refresh leaderboard</button></div></div><Result result={result}/></section></WorkspaceShell>;
}
