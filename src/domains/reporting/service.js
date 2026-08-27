import { supabase } from '../../lib/supabase.js';

const DEFAULT_METRICS = {
  business: ['growth','visitors','engagement','reviews','campaigns','roi'],
  fleet: ['routes','vehicles','drivers','alerts','maintenance','performance'],
  enterprise: ['networks','partners','campaigns','outcomes','metrics','roi'],
  admin: ['capabilities','analytics','notifications','data_quality','system_health']
};

export const reportingService = {
  async list(scopeType) {
    let q = supabase.from('reporting_schedules').select('*').order('created_at',{ascending:false});
    if (scopeType) q = q.eq('scope_type',scopeType);
    const { data,error } = await q;
    if (error) throw error;
    return data || [];
  },
  async create(input) {
    const payload = {...input, metrics: input.metrics?.length ? input.metrics : (DEFAULT_METRICS[input.scope_type] || [])};
    const { data,error } = await supabase.from('reporting_schedules').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  async update(id,patch) {
    const { data,error } = await supabase.from('reporting_schedules').update({...patch,updated_at:new Date().toISOString()}).eq('id',id).select().single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('reporting_schedules').delete().eq('id',id);
    if (error) throw error;
  },
  async runs(scheduleId) {
    const { data,error } = await supabase.from('reporting_runs').select('*').eq('schedule_id',scheduleId).order('created_at',{ascending:false}).limit(20);
    if (error) throw error;
    return data || [];
  },
  defaults: DEFAULT_METRICS
};
