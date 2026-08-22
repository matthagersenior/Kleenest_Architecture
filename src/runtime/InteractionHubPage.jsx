import { useState } from 'react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

function Box({ title, children }) { return <section className="capability-panel"><h2>{title}</h2>{children}</section>; }
function Form({ title, fields, submit, result, setResult }) {
  const [value,setValue]=useState({});
  return <Box title={title}><form onSubmit={async e=>{e.preventDefault();try{setResult(JSON.stringify(await submit(value),null,2))}catch(err){setResult(`Error: ${err.message}`)}}}>{fields.map(f=><label key={f.name} style={{display:'block',margin:'10px 0'}}>{f.label}<input required={f.required!==false} value={value[f.name]??''} onChange={e=>setValue(v=>({...v,[f.name]:e.target.value}))} style={{display:'block',width:'100%',padding:10,marginTop:4}}/></label>)}<button type="submit">Run</button></form>{result&&<pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{result}</pre>}</Box>;
}

export default function InteractionHubPage(){
 const {services}=useAppContext(); const [result,setResult]=useState('');
 return <WorkspaceShell workspace="consumer"><section className="page-heading"><span className="eyebrow">Kleenest</span><h1>QR · Geofence · Check-in</h1><p>The canonical interaction layer: arrival creates verified activity that can feed Quest, progression, rewards, leaderboards and network intelligence.</p></section>
 <div className="flow">Discover → arrive → QR / GPS → check-in → geofence event → Quest → rating/evidence → progression → reward → leaderboard → intelligence → notification</div>
 <Form title="Check in with QR" fields={[{name:'placeId',label:'Place ID'},{name:'qrToken',label:'QR token'}]} submit={services.checkins.byQr} result={result} setResult={setResult}/>
 <Form title="Check in by GPS" fields={[{name:'latitude',label:'Latitude'},{name:'longitude',label:'Longitude'},{name:'radiusMeters',label:'Radius meters',required:false}]} submit={v=>services.checkins.byGps({latitude:v.latitude,longitude:v.longitude,radiusMeters:v.radiusMeters||100})} result={result} setResult={setResult}/>
 <Form title="Consume single-use QR" fields={[{name:'code',label:'QR code'}]} submit={v=>services.qr.consumeSingleUse(v.code)} result={result} setResult={setResult}/>
 <Form title="Redeem QR" fields={[{name:'code',label:'QR code'}]} submit={v=>services.qr.redeem(v.code)} result={result} setResult={setResult}/>
 <Form title="Record geofence event" fields={[{name:'geofenceId',label:'Geofence ID'},{name:'locationId',label:'Location ID'},{name:'eventType',label:'Event type'}]} submit={v=>services.geofencing.recordEvent({geofenceId:v.geofenceId,locationId:v.locationId,eventType:v.eventType})} result={result} setResult={setResult}/>
 <Form title="Trigger Quest from geofence" fields={[{name:'locationId',label:'Location ID'},{name:'geofenceEventId',label:'Geofence event ID'},{name:'eventType',label:'Event type'}]} submit={v=>services.geofencing.triggerQuests(v)} result={result} setResult={setResult}/>
 </WorkspaceShell>;
}
