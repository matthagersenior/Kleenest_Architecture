const DEFAULT_METRICS={business:['growth','visitors','engagement','reviews','campaigns','roi'],fleet:['routes','vehicles','drivers','alerts','maintenance','performance'],enterprise:['networks','partners','campaigns','outcomes','metrics','roi'],admin:['capabilities','analytics','notifications','data_quality','system_health']};
export function createReportingService(client){
 if(!client) throw new Error('Supabase client is required.');
 const list=async scopeType=>{let q=client.from('reporting_schedules').select('*').order('created_at',{ascending:false});if(scopeType)q=q.eq('scope_type',scopeType);const{data,error}=await q;if(error)throw error;return data||[]};
 const create=async input=>{const payload={...input,metrics:input.metrics?.length?input.metrics:(DEFAULT_METRICS[input.scope_type]||[])};const{data,error}=await client.from('reporting_schedules').insert(payload).select().single();if(error)throw error;return data};
 const update=async(id,patch)=>{const{data,error}=await client.from('reporting_schedules').update({...patch,updated_at:new Date().toISOString()}).eq('id',id).select().single();if(error)throw error;return data};
 const remove=async id=>{const{error}=await client.from('reporting_schedules').delete().eq('id',id);if(error)throw error};
 const runs=async scheduleId=>{const{data,error}=await client.from('reporting_runs').select('*').eq('schedule_id',scheduleId).order('created_at',{ascending:false}).limit(20);if(error)throw error;return data||[]};
 return Object.freeze({list,create,update,remove,runs,defaults:DEFAULT_METRICS});
}
