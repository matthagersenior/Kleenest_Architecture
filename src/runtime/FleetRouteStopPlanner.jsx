import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Search, Sparkles, Trash2 } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import AiAssistPanel from './AiAssistPanel.jsx';
import FleetDispatchSignalPolicyPanel from './FleetDispatchSignalPolicyPanel.jsx';

const toLocal=value=>{if(!value)return'';const d=new Date(value);if(Number.isNaN(d.getTime()))return'';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`};
const toIso=value=>{if(!value)return null;const d=new Date(value);return Number.isNaN(d.getTime())?null:d.toISOString()};
const occupancyText=summary=>{if(!summary?.sample_count)return'No recent occupancy sample';const parts=[];if(summary.occupancy_count!=null)parts.push(`${summary.occupancy_count} present`);if(summary.utilization_pct!=null)parts.push(`${summary.utilization_pct}% utilization`);if(summary.queue_count!=null)parts.push(`${summary.queue_count} queued`);if(summary.wait_minutes!=null)parts.push(`${summary.wait_minutes} min wait`);return `${summary.fresh?'Fresh':'Recent'} · ${parts.join(' · ')}`};

export default function FleetRouteStopPlanner({businessId,route}){
  const {services}=useAppContext();
  const routeId=route?.id||route?.route_id;
  const locked=Boolean(route?.dispatch_locked)||['active','completed','cancelled','failed'].includes(route?.status);
  const [query,setQuery]=useState('');
  const [results,setResults]=useState([]);
  const [dispatchIntel,setDispatchIntel]=useState(null);
  const [stops,setStops]=useState([]);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');

  useEffect(()=>{
    let alive=true;
    if(!routeId)return()=>{alive=false};
    services.fleet.routePerformance(businessId,routeId).then(data=>{
      if(!alive)return;
      setStops((data?.stops||[]).map(stop=>({
        location_id:stop.location_id,
        display_name:stop.metadata?.display_name||`Location ${String(stop.location_id||'').slice(0,8)}`,
        address:stop.metadata?.address||'',
        planned_arrival_at:toLocal(stop.planned_arrival_at),
        planned_ttl_minutes:stop.planned_ttl_minutes??'',
        planned_dwell_minutes:stop.planned_dwell_minutes??'',
        metadata:stop.metadata||{}
      })));
    }).catch(()=>{});
    return()=>{alive=false};
  },[services,businessId,routeId]);

  const selectedIds=useMemo(()=>new Set(stops.map(stop=>String(stop.location_id))),[stops]);
  const search=async event=>{event.preventDefault();if(!query.trim())return;setBusy('search');setError('');try{setResults(await services.fleet.searchStopLocations(query.trim()))}catch(e){setError(e.message||'Unable to search locations.')}finally{setBusy('')}};
  const loadDispatchIntel=async()=>{setBusy('intel');setError('');try{setDispatchIntel(await services.fleet.dispatchIntelligence(businessId,routeId,12))}catch(e){setError(e.message||'Unable to load dispatch intelligence.')}finally{setBusy('')}};
  const add=result=>{
    const locationId=result.id||result.location_id;
    if(!locationId||selectedIds.has(String(locationId)))return;
    const address=[result.address,result.city,result.state].filter(Boolean).join(', ');
    setStops(current=>[...current,{
      location_id:locationId,
      display_name:result.name||'Location',
      address,
      planned_arrival_at:'',
      planned_ttl_minutes:'',
      planned_dwell_minutes:'',
      metadata:{display_name:result.name||'Location',address,dispatch_priority_score:result.priority_score??null,dispatch_reasons:result.reasons??[],dispatch_occupancy_summary:result.occupancy_summary??null}
    }]);
  };
  const update=(index,key,value)=>setStops(current=>current.map((stop,i)=>i===index?{...stop,[key]:value}:stop));
  const move=(index,delta)=>setStops(current=>{const next=[...current];const target=index+delta;if(target<0||target>=next.length)return current;[next[index],next[target]]=[next[target],next[index]];return next});
  const remove=index=>setStops(current=>current.filter((_,i)=>i!==index));
  const save=async()=>{setBusy('save');setError('');setMessage('');try{await services.fleet.setRouteStops(businessId,routeId,stops.map(stop=>({location_id:stop.location_id,planned_arrival_at:toIso(stop.planned_arrival_at),planned_ttl_minutes:stop.planned_ttl_minutes===''?null:Number(stop.planned_ttl_minutes),planned_dwell_minutes:stop.planned_dwell_minutes===''?null:Number(stop.planned_dwell_minutes),metadata:{...stop.metadata,display_name:stop.display_name,address:stop.address}})));setMessage('Stop plan saved. Dispatch will lock this order.')}catch(e){setError(e.message||'Unable to save route stops.')}finally{setBusy('')}};

  const candidates=Array.isArray(dispatchIntel?.candidate_stops)?dispatchIntel.candidate_stops:[];
  const readyDrivers=(dispatchIntel?.drivers||[]).filter(item=>item.ready).length;
  const readyVehicles=(dispatchIntel?.vehicles||[]).filter(item=>item.ready).length;

  return <section className="fleet-stop-planner">
    <div className="panel-heading"><div><span className="eyebrow">STOP PLAN</span><h3>Ordered route stops</h3><p className="muted">Search verified Kleenest locations and set planned arrival, TTL, and dwell before dispatch.</p></div></div>
    {!locked&&<div className="compact-actions"><button className="button secondary" type="button" onClick={loadDispatchIntel} disabled={busy==='intel'}><Sparkles size={14}/>{busy==='intel'?'Analyzing…':'Dispatch intelligence'}</button>{dispatchIntel&&<span className="status-pill">{readyDrivers} ready drivers · {readyVehicles} ready vehicles · {dispatchIntel.model||'authoritative dispatch'}</span>}</div>}
    {!locked&&<FleetDispatchSignalPolicyPanel businessId={businessId} onSaved={()=>void loadDispatchIntel()}/>} 
    {dispatchIntel&&<AiAssistPanel task="fleet_dispatch" context={{route,dispatch:dispatchIntel,stops}} title="Fleet dispatch copilot" description="Explains assignment risk, stop priorities, occupancy facts, and timing considerations from current Fleet facts." instruction="Give the dispatcher the most important actions to take before dispatch. Cite current occupancy, utilization, queue, or wait facts only when supplied. Do not invent traffic or travel times."/>}
    {locked?<p className="state">Stop order is locked for this dispatched route.</p>:<form className="compact-actions" onSubmit={search}><label className="form-field"><span>Find a location</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, address, city, restroom…"/></label><button className="button secondary" type="submit" disabled={busy==='search'}><Search size={14}/>{busy==='search'?'Searching…':'Search'}</button></form>}
    {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="form-success" role="status">{message}</p>}
    {!locked&&candidates.length>0&&<section className="detail-panel fleet-dispatch-intelligence"><span className="eyebrow">DISPATCH INTELLIGENCE</span><h4>Recommended service stops</h4><p className="muted">Ranked from authoritative service-opportunity and fresh occupancy facts using the visible dispatch signal policy. AI explains these recommendations but does not change route authority.</p><div className="crud-records">{candidates.map(candidate=><article className="business-row crud-record-row" key={candidate.location_id}><div className="crud-record-main"><strong>{candidate.name}</strong><span>Priority {candidate.priority_score} · {(candidate.reasons||[]).join(' · ')||'service opportunity'}</span><small>{occupancyText(candidate.occupancy_summary)}</small></div><button className="button secondary" type="button" onClick={()=>add(candidate)} disabled={selectedIds.has(String(candidate.location_id))}><Plus size={13}/>{selectedIds.has(String(candidate.location_id))?'Added':'Add recommended stop'}</button></article>)}</div></section>}
    {!locked&&results.length>0&&<div className="crud-records">{results.slice(0,8).map(result=><article className="business-row crud-record-row" key={result.id}><div className="crud-record-main"><strong>{result.name||'Location'}</strong><span>{[result.address,result.city,result.state].filter(Boolean).join(', ')}</span></div><button className="button secondary" type="button" onClick={()=>add(result)} disabled={selectedIds.has(String(result.id))}><Plus size={13}/>{selectedIds.has(String(result.id))?'Added':'Add stop'}</button></article>)}</div>}
    <div className="crud-records fleet-stop-plan-list">{stops.map((stop,index)=><article className="business-row crud-record-row" key={`${stop.location_id}:${index}`}><div className="crud-record-main"><strong>#{index+1} · {stop.display_name}</strong><span>{stop.address||stop.location_id}</span>{stop.metadata?.dispatch_occupancy_summary&&<small>At recommendation: {occupancyText(stop.metadata.dispatch_occupancy_summary)}</small>}<div className="form-row"><label className="form-field"><span>Planned arrival</span><input type="datetime-local" value={stop.planned_arrival_at} disabled={locked} onChange={e=>update(index,'planned_arrival_at',e.target.value)}/></label><label className="form-field"><span>TTL (min)</span><input type="number" min="0" step="1" value={stop.planned_ttl_minutes} disabled={locked} onChange={e=>update(index,'planned_ttl_minutes',e.target.value)}/></label><label className="form-field"><span>Dwell (min)</span><input type="number" min="0" step="1" value={stop.planned_dwell_minutes} disabled={locked} onChange={e=>update(index,'planned_dwell_minutes',e.target.value)}/></label></div></div>{!locked&&<div className="compact-actions"><button className="icon-button" type="button" title="Move stop up" disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp size={14}/></button><button className="icon-button" type="button" title="Move stop down" disabled={index===stops.length-1} onClick={()=>move(index,1)}><ArrowDown size={14}/></button><button className="icon-button" type="button" title="Remove stop" onClick={()=>remove(index)}><Trash2 size={14}/></button></div>}</article>)}</div>
    {!locked&&<div className="hero-actions"><button className="button primary" type="button" onClick={save} disabled={busy==='save'}><Save size={14}/>{busy==='save'?'Saving…':'Save stop plan'}</button></div>}
  </section>;
}
