import { useState } from 'react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

function Box({ title, children }) { return <section className="capability-panel"><h2>{title}</h2>{children}</section>; }
function Form({ title, fields, submit, result, setResult }) {
  const [value,setValue]=useState({});
  return <Box title={title}><form onSubmit={async e=>{e.preventDefault();try{setResult(JSON.stringify(await submit(value),null,2))}catch(err){setResult(`Error: ${err.message}`)}}}>{fields.map(f=><label key={f.name} style={{display:'block',margin:'10px 0'}}>{f.label}<input required={f.required!==false} value={value[f.name]??''} onChange={e=>setValue(v=>({...v,[f.name]:e.target.value}))} style={{display:'block',width:'100%',padding:10,marginTop:4}}/></label>)}<button type="submit">Run</button></form>{result&&<pre style={{whiteSpace:'pre-wrap',marginTop:12,maxHeight:320,overflow:'auto'}}>{result}</pre>}</Box>;
}

export default function InteractionHubPage(){
 const {services}=useAppContext(); const [result,setResult]=useState('');
 const run = fn => async value => { const data = await fn(value); setResult(JSON.stringify(data,null,2)); return data; };
 return <WorkspaceShell workspace="consumer"><section className="page-heading"><span className="eyebrow">Kleenest</span><h1>Canonical Interaction Hub</h1><p>One authenticated interaction graph connects arrival, QR, geofence, check-in, rating, evidence, Quest, progression, rewards, leaderboards, intelligence and notifications.</p></section>
 <div className="flow">Discover → arrive → QR / GPS → check-in → geofence → Quest → rate / observe → evidence → XP → reward → leaderboard → intelligence → notification</div>
 <Box title="Consumer visit foundation"><p>These actions write through the canonical Production services. Authentication and backend authorization remain authoritative.</p></Box>
 <Form title="Check in with QR" fields={[{name:'placeId',label:'Place ID'},{name:'qrToken',label:'QR token'}]} submit={run(services.checkins.byQr)} result={result} setResult={setResult}/>
 <Form title="Check in by GPS" fields={[{name:'latitude',label:'Latitude'},{name:'longitude',label:'Longitude'},{name:'radiusMeters',label:'Radius meters',required:false}]} submit={run(v=>services.checkins.byGps({latitude:v.latitude,longitude:v.longitude,radiusMeters:v.radiusMeters||100}))} result={result} setResult={setResult}/>
 <Form title="Map check-in" fields={[{name:'locationId',label:'Location ID'},{name:'latitude',label:'Latitude'},{name:'longitude',label:'Longitude'}]} submit={run(v=>services.checkins.fromMap(v))} result={result} setResult={setResult}/>
 <Form title="Consume single-use QR" fields={[{name:'code',label:'QR code'}]} submit={run(v=>services.qr.consumeSingleUse(v.code))} result={result} setResult={setResult}/>
 <Form title="Redeem QR" fields={[{name:'code',label:'QR code'}]} submit={run(v=>services.qr.redeem(v.code))} result={result} setResult={setResult}/>
 <Form title="Record geofence event" fields={[{name:'geofenceId',label:'Geofence ID'},{name:'locationId',label:'Location ID'},{name:'eventType',label:'Event type'},{name:'dwellSeconds',label:'Dwell seconds',required:false}]} submit={run(v=>services.geofencing.recordEvent(v))} result={result} setResult={setResult}/>
 <Form title="Trigger Quest from geofence" fields={[{name:'locationId',label:'Location ID'},{name:'geofenceEventId',label:'Geofence event ID'},{name:'eventType',label:'Event type'}]} submit={run(v=>services.geofencing.triggerQuests(v))} result={result} setResult={setResult}/>
 <Form title="Rate the bathroom" fields={[{name:'locationId',label:'Location ID'},{name:'checkInId',label:'Check-in ID',required:false},{name:'stars',label:'Stars (1-5)',type:'number'},{name:'cleanlinessPct',label:'Cleanliness %',type:'number',required:false},{name:'comment',label:'Review',required:false}]} submit={run(v=>services.reviews.create(v))} result={result} setResult={setResult}/>
 <Form title="Submit restroom observation" fields={[{name:'locationId',label:'Location ID'},{name:'checkInId',label:'Check-in ID',required:false},{name:'observationType',label:'Observation type'},{name:'cleanlinessPct',label:'Cleanliness %',type:'number',required:false},{name:'note',label:'Note',required:false}]} submit={run(v=>services.locationEvidence.restroomObservation(v))} result={result} setResult={setResult}/>
 <Form title="Submit location quality signal" fields={[{name:'locationId',label:'Location ID'},{name:'checkInId',label:'Check-in ID',required:false},{name:'stars',label:'Stars',type:'number'},{name:'cleanliness',label:'Cleanliness',type:'number',required:false},{name:'safety',label:'Safety',type:'number',required:false},{name:'availability',label:'Availability',type:'number',required:false},{name:'feedback',label:'Feedback',required:false}]} submit={run(v=>services.locationEvidence.qualityObservation(v))} result={result} setResult={setResult}/>
 <Form title="Start Quest" fields={[{name:'questId',label:'Quest ID'}]} submit={run(v=>services.quests.start(v.questId))} result={result} setResult={setResult}/>
 <Form title="Record Quest step" fields={[{name:'participationId',label:'Participation ID'},{name:'stepId',label:'Quest step ID'},{name:'eventType',label:'Event type'},{name:'locationId',label:'Location ID',required:false},{name:'checkinId',label:'Check-in ID',required:false},{name:'qrCodeId',label:'QR code ID',required:false}]} submit={run(v=>services.quests.recordStep(v.participationId,v.stepId,v.eventType,{locationId:v.locationId,checkinId:v.checkinId,qrCodeId:v.qrCodeId}))} result={result} setResult={setResult}/>
 <Form title="Check-in reward summary" fields={[{name:'checkInId',label:'Check-in ID'}]} submit={run(v=>services.progression.checkinRewards(v.checkInId))} result={result} setResult={setResult}/>
 <Form title="Review reward summary" fields={[{name:'reviewId',label:'Review ID'}]} submit={run(v=>services.progression.reviewRewards(v.reviewId))} result={result} setResult={setResult}/>
 <Form title="Cross-tier leaderboard" fields={[{name:'leaderboardKey',label:'Leaderboard key',defaultValue:'consumer_checkins',required:false}]} submit={run(v=>services.progression.platformLeaderboard(v.leaderboardKey||'consumer_checkins',25))} result={result} setResult={setResult}/>
 <Form title="Progression dashboard" fields={[]} submit={run(()=>services.progression.dashboard())} result={result} setResult={setResult}/>
 <Form title="Nearby notification" fields={[{name:'locationId',label:'Location ID'},{name:'distanceMeters',label:'Distance meters',required:false},{name:'category',label:'Category',defaultValue:'restroom',required:false}]} submit={run(v=>services.geofencing.notifyNearby(v.locationId,Number(v.distanceMeters||100),v.category||'restroom'))} result={result} setResult={setResult}/>
 </WorkspaceShell>;
}
