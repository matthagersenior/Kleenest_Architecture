import { useMemo, useState } from 'react';
import { AlertTriangle, Check, RefreshCw, Sparkles } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';

const providerMessage=(result)=>{
  if(result?.provider!=='grounded_fallback')return '';
  if(result?.provider_status==='missing_api_key')return 'Model provider is not configured; showing Kleenest\'s deterministic grounded fallback.';
  if(result?.provider_status==='provider_error'){
    if(result?.provider_error_type==='insufficient_quota'||result?.provider_error_code==='credit_balance_exhausted')return 'Model provider capacity is unavailable; showing Kleenest\'s deterministic grounded fallback.';
    return 'Model provider is temporarily unavailable; showing Kleenest\'s deterministic grounded fallback.';
  }
  return 'Using Kleenest\'s deterministic grounded fallback.';
};

export default function AiAssistPanel({
  task,
  context,
  instruction='',
  title='AI Assist',
  description='Grounded in the current Kleenest data on this screen.',
  actionLabel='Ask AI',
  applyLabel='Use suggestion',
  onApply=null,
  className=''
}){
  const {services}=useAppContext();
  const [result,setResult]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const contextKey=useMemo(()=>{try{return JSON.stringify(context??{}).slice(0,12000)}catch{return String(Date.now())}},[context]);
  const run=async()=>{
    setBusy(true);setError('');
    try{
      const response=await services.intelligenceConvergence.aiAssist({task,context,instruction});
      setResult(response);
    }catch(e){setError(e?.message||'AI Assist is unavailable.');}
    finally{setBusy(false);}
  };
  const apply=()=>{if(result?.answer&&typeof onApply==='function')onApply(result.answer,result);};
  const modelAssisted=result?.provider==='openai';
  const fallback=result?.provider==='grounded_fallback';
  const providerIssue=fallback&&result?.provider_status==='provider_error';
  const fallbackMessage=providerMessage(result);
  return <section className={`detail-panel ai-assist-panel ${className}`.trim()} data-context-key={contextKey.length}>
    <div className="panel-heading">
      <div><span className="eyebrow">AI ASSIST</span><h3>{title}</h3><p className="muted">{description}</p></div>
      <Sparkles size={20}/>
    </div>
    <div className="hero-actions">
      <button className="button secondary" type="button" onClick={run} disabled={busy}><RefreshCw size={14}/>{busy?'Thinking…':result?'Refresh AI':actionLabel}</button>
      {result?.answer&&onApply&&<button className="button primary" type="button" onClick={apply}><Check size={14}/>{applyLabel}</button>}
    </div>
    {error&&<p className="form-error" role="alert">{error}</p>}
    {result?.answer&&<div className="metric-card ai-assist-answer">
      <strong>{modelAssisted?'Model-assisted recommendation':'Grounded recommendation'}</strong>
      {fallbackMessage&&<small className={providerIssue?'form-error':''}>{providerIssue&&<AlertTriangle size={13}/>} {fallbackMessage}</small>}
      <span>{result.answer}</span>
      <small>{modelAssisted&&result.model?`Model: ${result.model} · `:''}Review required before any change is applied.</small>
    </div>}
  </section>;
}
