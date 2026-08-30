import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const headers={
  'Content-Type':'application/json',
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'
};
const supabaseAdmin=createClient(Deno.env.get('SUPABASE_URL')||'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'');
const allowedTasks=new Set(['business_growth','fleet_dispatch','visit_review','admin_moderation','route_plan']);
const clamp=(value:unknown,max=18000)=>JSON.stringify(value??{}).slice(0,max);
const text=(value:unknown)=>String(value??'').trim();

function fallback(task:string,context:any){
  if(task==='visit_review'){
    const stars=Number(context?.stars||0);const clean=Number(context?.cleanliness||0);const observation=text(context?.observation).replaceAll('_',' ');const note=text(context?.note);
    const parts=[stars?`${stars}/5 visit`:null,clean?`cleanliness about ${clean}%`:null,observation||null,note||null].filter(Boolean);
    return `Draft from your verified visit: ${parts.join('. ')}.${note?'':' Add any specific detail you personally observed before publishing.'}`;
  }
  if(task==='fleet_dispatch'){
    const c=context?.dispatch||context||{};const candidates=Array.isArray(c?.recommended_stops)?c.recommended_stops:[];const readyDrivers=Number(c?.ready_driver_count??0);const readyVehicles=Number(c?.ready_vehicle_count??0);
    const top=candidates.slice(0,3).map((r:any)=>`${r.name||'Location'} (${(r.reasons||[]).join(', ')||'service opportunity'})`);
    return [`Dispatch readiness: ${readyDrivers} ready driver(s), ${readyVehicles} ready vehicle(s).`,top.length?`Highest-priority stops: ${top.join('; ')}.`:'No ranked service stops are available yet.','Review assignments, timing, and stop order before dispatch.'].join(' ');
  }
  if(task==='business_growth'){
    const recs=Array.isArray(context?.recommendations)?context.recommendations:[];
    const top=recs.slice(0,3).map((r:any)=>`${r?.name||'Location'}: ${r?.recommendation?.title||r?.title||'review signal'}`);
    return top.length?`Highest-value actions from current Kleenest signals: ${top.join('; ')}. Validate each recommendation against current staffing, promotions, and location conditions before executing.`:'No strong growth recommendation is available from the current authoritative signals.';
  }
  if(task==='admin_moderation'){
    const review=text(context?.comment);const reason=text(context?.reason);const details=text(context?.details);
    return `Moderation triage only — no automatic decision. Report reason: ${reason||'unspecified'}. ${details?`Details: ${details}. `:''}${review?`Review text to inspect: ${review.slice(0,500)}`:'No review text was provided.'}`;
  }
  const stops=Array.isArray(context?.stops)?context.stops:[];
  return stops.length?`Route contains ${stops.length} stop(s). Prefer an order that preserves required appointments, minimizes backtracking, and leaves realistic dwell/TTL buffers. Review the proposed order before saving.`:'Add candidate stops before asking for route-plan guidance.';
}

function systemPrompt(task:string){
  const shared='You are Kleenest AI Assist. Use only the supplied authoritative Kleenest context. Never invent locations, metrics, reviews, business facts, driver states, or user observations. Be concise, operational, and explicit about uncertainty. Suggestions are advisory and require human review before any mutation.';
  const map:Record<string,string>={
    business_growth:' Identify the 3 highest-value business actions, explain why each matters, and cite the supplied signal names or metrics in plain language.',
    fleet_dispatch:' Recommend dispatch priorities, assignment concerns, and stop-order considerations from the supplied Fleet facts. Do not claim live traffic unless it is in context.',
    visit_review:' Draft a first-person review using only the user-provided verified visit details. Do not add facts the user did not provide. Avoid marketing language.',
    admin_moderation:' Summarize the moderation concern, separate observable text from inference, and list what a human moderator should verify. Never make the final enforcement decision.',
    route_plan:' Explain a sensible route ordering strategy using only supplied stops, constraints, planned arrival, TTL, dwell, and location facts. Do not invent travel times.'
  };
  return shared+(map[task]||'');
}

async function modelAssist(task:string,context:any,instruction:string){
  const apiKey=Deno.env.get('OPENAI_API_KEY');
  if(!apiKey)return null;
  const model=Deno.env.get('OPENAI_MODEL')||'gpt-5.6-luna';
  const response=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      model,
      input:[
        {role:'system',content:[{type:'input_text',text:systemPrompt(task)}]},
        {role:'user',content:[{type:'input_text',text:`Instruction: ${instruction||'Help with this task.'}\nAuthoritative context:\n${clamp(context)}`}]}],
      max_output_tokens:700
    })
  });
  if(!response.ok)throw new Error(`AI provider error ${response.status}`);
  const payload=await response.json();
  const output=Array.isArray(payload?.output)?payload.output:[];
  const answer=output.flatMap((item:any)=>Array.isArray(item?.content)?item.content:[]).map((item:any)=>item?.text).filter(Boolean).join('\n').trim();
  if(!answer)throw new Error('AI provider returned no text');
  return {answer,model};
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers});
  try{
    const auth=req.headers.get('Authorization');
    if(!auth)return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
    const token=auth.replace(/^Bearer\s+/i,'');
    const {data:{user},error:authError}=await supabaseAdmin.auth.getUser(token);
    if(authError||!user)return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers});
    const body=await req.json();
    const task=text(body?.task);
    if(!allowedTasks.has(task))return new Response(JSON.stringify({error:'Unsupported AI task'}),{status:400,headers});
    const context=body?.context??{};
    const instruction=text(body?.instruction).slice(0,2000);
    let provider:'openai'|'grounded_fallback'='grounded_fallback';let model:string|null=null;let answer='';
    try{const generated=await modelAssist(task,context,instruction);if(generated){provider='openai';model=generated.model;answer=generated.answer;}}catch(error){console.error('ai-assist provider fallback',error);}
    if(!answer)answer=fallback(task,context);
    try{await supabaseAdmin.from('data_feature_events').insert({event_type:'ai_assist_generated',feature_code:'ai_assist',subject_type:'user',subject_id:user.id,source_table:'edge_function',value_text:task,metadata:{provider,model,task}});}catch{}
    return new Response(JSON.stringify({task,answer,provider,model,review_required:true}),{headers});
  }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:'AI assist failed'}),{status:400,headers});}
});