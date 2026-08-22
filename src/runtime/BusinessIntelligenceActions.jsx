import { useState } from 'react';
import { CalendarDays, CheckCircle2, MapPinned, Megaphone, Sparkles } from 'lucide-react';

const CONFIG={
  create_promotion:{label:'Create promotion',icon:Megaphone},
  create_campaign:{label:'Create campaign',icon:Sparkles},
  create_event:{label:'Create event',icon:CalendarDays},
  verify_location:{label:'Review location',icon:MapPinned},
  review_intelligence:{label:'Review intelligence',icon:CheckCircle2},
};

export default function BusinessIntelligenceActions({businessId,items=[],locations=[],onComplete}){
  const {services}=arguments[0]?.context||{};
  const [busy,setBusy]=useState(null);
  const [message,setMessage]=useState(null);
  const [error,setError]=useState(null);
  const run=async item=>{
    const action=item?.recommendation?.action_type;
    const config=CONFIG[action];
    const locationId=item?.location_id;
    if(!config||!businessId)return;
    const location=locations.find(x=>String(x?.id??x?.location_id)===String(locationId));
    if(action==='verify_location'||action==='review_intelligence'){
      if(locationId) window.location.assign(`/place/${encodeURIComponent(locationId)}`);
      return;
    }
    if(!location){setError('This intelligence signal is missing a managed business location. Refresh the intelligence panel and try again.');return;}
    setBusy(`${locationId}:${action}`);setMessage(null);setError(null);
    try{
      const result=await services.businessIntelligence.executeAction(businessId,{action,locationId,title:action==='create_promotion'?`Local demand offer — ${location.name||'your location'}`:action==='create_event'?`Community activity — ${location.name||'location'}`:undefined,description:`Created from a Kleenest ${item.recommendation.type.replaceAll('_',' ')} signal.`,name:`Quality improvement — ${location.name||'location'}`,goal:'Improve community experience and review sentiment.'});
      const detail={locationId,action,result,source:'business_intelligence'};
      window.dispatchEvent(new CustomEvent('kleenest:intelligence-action-completed',{detail}));
      window.dispatchEvent(new CustomEvent('kleenest:intelligence-updated',{detail}));
      await onComplete?.(detail);
      setMessage(`${config.label} completed for ${location.name||'the selected location'}.`);
    }catch(e){setError(e.message||'Unable to complete the intelligence action.');}finally{setBusy(null);}
  };
  const actionable=items.filter(item=>CONFIG[item?.recommendation?.action_type]);
  if(!actionable.length)return null;
  return <section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">INTELLIGENCE ACTIONS</span><h2>Turn signals into action</h2></div><Sparkles size={22}/></div><div className="business-intelligence-list">{actionable.slice(0,8).map(item=>{const action=item.recommendation.action_type;const config=CONFIG[action];const Icon=config.icon;const key=`${item.location_id}:${action}`;return <div className="business-row" key={key}><div><strong>{item.recommendation.title} · {item.name}</strong><span>{item.recommendation.body}</span><span>{item.recommendation.reasons?.join(' · ')||'Derived from current intelligence'}</span></div><button className="secondary" disabled={busy!==null} onClick={()=>run(item)}><Icon size={16}/>{busy===key?'Working…':config.label}</button></div>})}</div>{message&&<p className="observation-copy" role="status">{message}</p>}{error&&<p className="form-error" role="alert">{error}</p>}</section>;
}
