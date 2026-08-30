import { useCallback, useEffect, useState } from 'react';
import { Activity, Clock3, Play, TimerReset } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import AiAssistPanel from './AiAssistPanel.jsx';

const formatMinutes=value=>value==null?'—':`${Number(value).toFixed(1)} min`;
const formatPercent=value=>value==null?'—':`${Number(value).toFixed(0)}%`;
const formatTime=value=>value?new Date(value).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'—';

export default function FleetRoutePerformanceCard({ businessId, route }) {
  const { services } = useAppContext();
  const routeId=route?.id||route?.route_id;
  const [performance,setPerformance]=useState(null);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');

  const load=useCallback(async()=>{
    if(!businessId||!routeId)return;
    try{setPerformance(await services.fleet.routePerformance(businessId,routeId));setError('')}catch(e){setError(e.message||'Unable to load route performance.')}
  },[services,businessId,routeId]);

  useEffect(()=>{void load();const refresh=()=>void load();window.addEventListener('kleenest:fleet-updated',refresh);return()=>window.removeEventListener('kleenest:fleet-updated',refresh)},[load]);

  const run=async(key,operation)=>{setBusy(key);setError('');try{await operation();await load()}catch(e){setError(e.message||'Fleet route operation failed.')}finally{setBusy('')}};
  const dispatch=()=>run('dispatch',()=>services.fleet.dispatchRoute(businessId,routeId));
  const timing=(stopId,eventType)=>run(`${stopId}:${eventType}`,()=>services.fleet.recordRouteStopTiming(businessId,routeId,stopId,eventType));

  const stops=Array.isArray(performance?.stops)?performance.stops:[];
  const canDispatch=['planned','paused'].includes(route?.status)&&route?.driver_id&&route?.vehicle_id;
  const hasMeasuredOutcome=Boolean(performance&&(performance.actual_duration_minutes!=null||stops.some(stop=>stop.actual_arrived_at||stop.actual_completed_at)));
  return <section className="fleet-route-performance" aria-label={`Performance for ${route?.name||'route'}`}>
    <div className="compact-actions">
      {canDispatch&&<button className="button primary" type="button" onClick={dispatch} disabled={busy==='dispatch'}><Play size={14}/>{busy==='dispatch'?'Dispatching…':'Dispatch route'}</button>}
      <button className="button secondary" type="button" onClick={load}><TimerReset size={14}/>Refresh metrics</button>
    </div>
    {error&&<p className="form-error" role="alert">{error}</p>}
    {performance&&<>
      <div className="reward-stats fleet-route-metrics">
        <div className="reward-stat"><span>Stops</span><strong>{performance.completed_stops??0}/{performance.total_stops??0}</strong></div>
        <div className="reward-stat"><span>On-time arrivals</span><strong>{formatPercent(performance.arrived_by_plan_pct)}</strong></div>
        <div className="reward-stat"><span>ETA variance</span><strong>{formatMinutes(performance.avg_eta_variance_minutes)}</strong></div>
        <div className="reward-stat"><span>TTL variance</span><strong>{formatMinutes(performance.avg_ttl_variance_minutes)}</strong></div>
        <div className="reward-stat"><span>Actual duration</span><strong>{formatMinutes(performance.actual_duration_minutes)}</strong></div>
        <div className="reward-stat"><span>Duration variance</span><strong>{formatMinutes(performance.duration_variance_minutes)}</strong></div>
        <div className="reward-stat"><span>Avg dwell</span><strong>{formatMinutes(performance.avg_actual_dwell_minutes)}</strong></div>
        <div className="reward-stat"><span>Dwell variance</span><strong>{formatMinutes(performance.avg_dwell_variance_minutes)}</strong></div>
      </div>
      {hasMeasuredOutcome&&<AiAssistPanel task="fleet_debrief" context={{route,performance}} title="Fleet route debrief" description="Turns measured ETA, TTL, dwell, stop-completion, and duration outcomes into an operator review." instruction="Identify the largest measured variances and what the dispatcher should inspect before changing future route plans. Never invent a cause that is not in the data."/>}
      {stops.length>0&&<div className="crud-records fleet-stop-performance">{stops.map(stop=><article className="business-row crud-record-row" key={stop.id}>
        <div className="crud-record-main">
          <strong>Stop {stop.stop_order} · {stop.metadata?.display_name||'Location'}</strong>
          <span>{stop.status} · planned {formatTime(stop.planned_arrival_at)} · actual {formatTime(stop.actual_arrived_at)}</span>
          <span><Clock3 size={13}/> ETA Δ {formatMinutes(stop.eta_variance_minutes)} · TTL planned {formatMinutes(stop.planned_ttl_minutes)} / actual {formatMinutes(stop.actual_ttl_minutes)} / Δ {formatMinutes(stop.ttl_variance_minutes)}</span>
          <span>Dwell planned {formatMinutes(stop.planned_dwell_minutes)} / actual {formatMinutes(stop.actual_dwell_minutes)} / Δ {formatMinutes(stop.dwell_variance_minutes)}</span>
        </div>
        <div className="compact-actions">
          {!stop.actual_arrived_at&&<button className="button secondary" type="button" onClick={()=>timing(stop.id,'arrived')} disabled={busy.startsWith(stop.id)}><Activity size={13}/>Arrived</button>}
          {stop.status==='arrived'&&<button className="button secondary" type="button" onClick={()=>timing(stop.id,'service_started')} disabled={busy.startsWith(stop.id)}>Start service</button>}
          {stop.status!=='completed'&&stop.status!=='skipped'&&<button className="button primary" type="button" onClick={()=>timing(stop.id,'completed')} disabled={busy.startsWith(stop.id)}>Complete</button>}
          {stop.status!=='completed'&&stop.status!=='skipped'&&<button className="button secondary" type="button" onClick={()=>timing(stop.id,'skipped')} disabled={busy.startsWith(stop.id)}>Skip</button>}
        </div>
      </article>)}</div>}
    </>}
  </section>;
}
