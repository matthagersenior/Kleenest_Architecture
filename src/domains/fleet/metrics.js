export function createFleetMetricService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    configuration: async businessId => {
      const { data, error } = await client.rpc('get_fleet_metric_configuration', { p_business_id: businessId });
      if (error) throw error;
      return data;
    },
    values: async (businessId, asOf = new Date().toISOString().slice(0, 10)) => {
      const { data, error } = await client.rpc('get_fleet_metric_values', { p_business_id: businessId, p_as_of: asOf });
      if (error) throw error;
      return data;
    },
    create: async (businessId, values) => {
      const { data, error } = await client.rpc('create_fleet_metric_definition', {
        p_business_id: businessId,
        p_metric_key: values.metricKey,
        p_feature_code: values.featureCode,
        p_name: values.name,
        p_description: values.description || null,
        p_unit: values.unit || null,
        p_source_dataset: values.sourceDataset,
        p_source_metric: values.sourceMetric,
        p_aggregation: values.aggregation || 'avg',
        p_direction: values.direction || 'higher_is_better',
        p_scoring_method: values.scoringMethod || 'threshold',
        p_goal: values.goal == null ? null : Number(values.goal),
        p_threshold: values.threshold == null ? null : Number(values.threshold),
        p_max_score: values.maxScore == null ? 100 : Number(values.maxScore),
        p_scoring_config: values.scoringConfig || {},
        p_period: values.period || 'weekly'
      });
      if (error) throw error;
      return data;
    },
    update: async (metricDefinitionId, values) => {
      const { data, error } = await client.rpc('update_fleet_metric_definition', {
        p_metric_definition_id: metricDefinitionId,
        p_name: values.name,
        p_description: values.description || null,
        p_goal: values.goal == null ? null : Number(values.goal),
        p_threshold: values.threshold == null ? null : Number(values.threshold),
        p_max_score: values.maxScore == null ? 100 : Number(values.maxScore),
        p_scoring_method: values.scoringMethod || 'threshold',
        p_scoring_config: values.scoringConfig || {},
        p_period: values.period || 'weekly',
        p_active: values.active !== false
      });
      if (error) throw error;
      return data;
    },
    assign: async (metricDefinitionId, targetType, targetId) => {
      const { data, error } = await client.rpc('assign_fleet_metric', { p_metric_definition_id: metricDefinitionId, p_target_type: targetType, p_target_id: targetId });
      if (error) throw error;
      return data;
    }
  });
}
