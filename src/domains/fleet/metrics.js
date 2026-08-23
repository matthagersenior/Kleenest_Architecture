export function createFleetMetricService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const requireId = value => { if (!value || typeof value !== 'string') throw new Error('Required identifier is missing.'); return value; };
  const finite = (value, fallback = null) => value == null || value === '' ? fallback : (Number.isFinite(Number(value)) ? Number(value) : fallback);
  return Object.freeze({
    capabilities: async businessId => {
      const id = requireId(businessId); const { data, error } = await client.rpc('get_fleet_metric_capabilities', { p_business_id: id }); if (error) throw error; return data ?? { business_id: id, measurement_sources: [], shared_primitives: [] };
    },
    configuration: async businessId => { const { data, error } = await client.rpc('get_fleet_metric_configuration', { p_business_id: requireId(businessId) }); if (error) throw error; return data; },
    values: async (businessId, asOf = new Date().toISOString().slice(0, 10)) => { const id = requireId(businessId); if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error('Invalid metric date.'); const { data, error } = await client.rpc('get_fleet_metric_values', { p_business_id: id, p_as_of: asOf }); if (error) throw error; return data; },
    create: async (businessId, values = {}) => {
      const id = requireId(businessId); if (!values.metricKey || !values.featureCode || !values.name || !values.sourceDataset || !values.sourceMetric) throw new Error('Metric key, feature, name, source dataset, and source metric are required.');
      const { data, error } = await client.rpc('create_fleet_metric_definition', { p_business_id:id,p_metric_key:String(values.metricKey),p_feature_code:String(values.featureCode),p_name:String(values.name),p_description:values.description||null,p_unit:values.unit||null,p_source_dataset:String(values.sourceDataset),p_source_metric:String(values.sourceMetric),p_aggregation:values.aggregation||'avg',p_direction:values.direction||'higher_is_better',p_scoring_method:values.scoringMethod||'threshold',p_goal:finite(values.goal),p_threshold:finite(values.threshold),p_max_score:finite(values.maxScore,100),p_scoring_config:values.scoringConfig||{},p_period:values.period||'weekly' }); if(error)throw error; return data;
    },
    update: async (metricDefinitionId, values = {}) => { const { data,error }=await client.rpc('update_fleet_metric_definition',{p_metric_definition_id:requireId(metricDefinitionId),p_name:values.name,p_description:values.description||null,p_goal:finite(values.goal),p_threshold:finite(values.threshold),p_max_score:finite(values.maxScore,100),p_scoring_method:values.scoringMethod||'threshold',p_scoring_config:values.scoringConfig||{},p_period:values.period||'weekly',p_active:values.active!==false});if(error)throw error;return data; },
    assign: async (metricDefinitionId,targetType,targetId) => { const {data,error}=await client.rpc('assign_fleet_metric',{p_metric_definition_id:requireId(metricDefinitionId),p_target_type:String(targetType||''),p_target_id:requireId(targetId)});if(error)throw error;return data; }
  });
}
