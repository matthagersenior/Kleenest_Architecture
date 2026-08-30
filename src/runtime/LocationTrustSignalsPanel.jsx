import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, UsersRound, Wrench } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';

const arr=value=>Array.isArray(value)?value:[];
const qty=item=>item?.observed_quantity==null?'quantity unknown':`× ${item.observed_quantity}`;
const age=value=>{if(!value)return'unknown freshness';const ms=Date.now()-new Date(value).getTime();if(!Number.isFinite(ms))return'unknown freshness';const h=Math.max(0,Math.round(ms/3600000));return h<1?'updated recently':h<24?`${h}h ago`:`${Math.round(h/24)}d ago`;};

export default function LocationTrustSignalsPanel({locationId,compact=false}){
  const{services}=useAppContext();
  const[inventory,setInventory]=useState([]),[trend,setTrend]=useState(null),[conflicts,setConflicts]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const load=async()=>{if(!locationId||!services?.locationEvidence)return;setLoading(true);setError('');try{const[i,t,c]=await Promise.allSettled([services.locationEvidence.amenityInventory(locationId),services.locationEvidence.occupancyTrend(locationId,{hours:24,bucketMinutes:120}),services.locationEvidence.trustConflicts(locationId)]);setInventory(i.status==='fulfilled'?arr(i.value):[]);setTrend(t.status==='fulfilled'?t.value:null);setConflicts(c.status==='fulfilled'?arr(c.value?.amenity_conflicts):[])}catch(e){setError(e?.message||'Unable to load trust signals.')}finally{setLoading(false)}};
  useEffect(()=>{void load()},[locationId,services]);
  useEffect(()=>{const refresh=e=>{const id=e?.detail?.locationId||e?.detail?.location_id;if(!id||String(id)===String(locationId))void load()};window.addEventListener('kleenest:evidence-created',refresh);window.addEventListener('kleenest:location-trust-refreshed',refresh);return()=>{window.removeEventListener('kleenest:evidence-created',refresh);window.removeEventListener('kleenest:location-trust-refreshed',refresh)}},[locationId,services]);
  const counted=useMemo(()=>inventory.filter(x=>x.observed_quantity!=null),[inventory]);
  const buckets=arr(trend?.buckets);
  const latest=buckets[buckets.length-1]||null;
  return <section className={`detail-panel location-trust-signals ${compact?'compact':''}`}>
    <div className="panel-heading"><div><span className="eyebrow">CURRENT TRUST SIGNALS</span><h2>Amenities, occupancy & reverification</h2><p className="muted">Aggregated evidence only. Raw contributor observations stay private where required.</p></div><button className="icon-button" type="button" onClick={load} disabled={loading} title="Refresh trust signals"><RefreshCw size={17}/></button></div>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <div className="detail-grid">
      <article className="metric-card"><Wrench size={18}/><span>Counted amenities</span><strong>{counted.length}</strong><small>{counted.length?counted.slice(0,4).map(x=>`${x.name} ${qty(x)}`).join(' · '):'No quantity-backed amenity inventory yet'}</small></article>
      <article className="metric-card"><UsersRound size={18}/><span>24h occupancy trend</span><strong>{buckets.length?`${buckets.length} trusted buckets`:'Insufficient shared data'}</strong><small>{latest?`${latest.utilization_pct??'—'}% utilization · queue ${latest.queue_count??'—'} · ${age(latest.freshest_observed_at)}`:'Trend buckets require at least 2 distinct contributors for privacy.'}</small></article>
      <article className="metric-card"><AlertTriangle size={18}/><span>Needs reverification</span><strong>{conflicts.length}</strong><small>{conflicts.length?conflicts.slice(0,3).map(x=>`${x.name}${x.status_conflict?' presence disagrees':''}${x.quantity_conflict?` count ${x.min_quantity}–${x.max_quantity}`:''}`).join(' · '):'No recent amenity contradictions detected'}</small></article>
    </div>
    {counted.length>0&&<div className="amenity-grid trust-amenity-inventory">{counted.slice(0,12).map(item=><span className="amenity-pill" key={item.amenity_id}>{item.name} {qty(item)} · {item.sample_count||0} sample{Number(item.sample_count)===1?'':'s'} · {age(item.freshest_observed_at)}</span>)}</div>}
    {conflicts.length>0&&<div className="state warning" role="status"><AlertTriangle size={17}/><span>Some recent amenity observations disagree. A fresh verified visit can resolve these signals; Kleenest does not automatically choose a side.</span></div>}
  </section>;
}
