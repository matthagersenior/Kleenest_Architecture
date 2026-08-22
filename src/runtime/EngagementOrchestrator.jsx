import { useState } from 'react';
import { useAppContext } from '../AppContext.jsx';

export default function EngagementOrchestrator({ locationId = '', qrCodeId = '', geofenceId = '', questId = '' }) {
  const { services } = useAppContext();
  const [eventType,setEventType]=useState('arrival'); const [result,setResult]=useState(null); const [error,setError]=useState(null); const [busy,setBusy]=useState(false);
  async function run(action){setBusy(true);setError(null);try{setResult(await action())}catch(e){setError(e?.message||String(e))}finally{setBusy(false)}}
  return <section className="capability-panel">
    <h2>QR + Geofence + Quest orchestration</h2>
    <p>Interaction primitives feed the canonical event graph instead of creating parallel engagement systems.</p>
    <div className="form-grid">
      <label>Event <select value={eventType} onChange={e=>setEventType(e.target.value)}><option>arrival</option><option>enter</option><option>dwell</option><option>exit</option></select></label>
      <button disabled={busy||!locationId||!geofenceId} onClick={()=>run(()=>services.geofencing.recordEvent({geofenceId,locationId,eventType,qrCodeId:qrCodeId||null}))}>Record geofence event</button>
      <button disabled={busy||!locationId||!geofenceId} onClick={()=>run(()=>services.geofencing.triggerQuests({locationId,geofenceEventId:null,eventType}))}>Trigger Quest opportunity</button>
      <button disabled={busy||!questId} onClick={()=>run(()=>services.quests.start(questId))}>Start Quest</button>
      <button disabled={busy} onClick={()=>run(()=>services.intelligence.crossTierLeaderboard('consumer_checkins',25))}>Refresh network intelligence</button>
      <button disabled={busy||!locationId} onClick={()=>run(()=>services.geofencing.notifyNearby(locationId,100,'restroom'))}>Notify nearby users</button>
    </div>
    {error&&<p role="alert">{error}</p>}{busy&&<p>Working…</p>}{result&&<pre style={{whiteSpace:'pre-wrap',overflow:'auto'}}>{JSON.stringify(result,null,2)}</pre>}
  </section>
}
