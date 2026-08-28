export function createCapabilityCoverageService(client){
  if(!client) throw new Error('Supabase client is required.');
  const normalizeOutcome=outcome=>String(outcome||'').toLowerCase()==='blocked'?'denied':outcome;
  return Object.freeze({
    async list(){const{data,error}=await client.from('capability_coverage_rollup').select('*').order('category').order('feature_code');if(error)throw error;return data??[];},
    async contracts(){const{data,error}=await client.from('capability_domain_contracts').select('domain,canonical_capability,canonical_rpc,owner_surface,active').eq('active',true).order('domain');if(error)throw error;return data??[];},
    async catalog(){const{data,error}=await client.from('feature_catalog').select('feature_code,name,category,minimum_tier,enabled').order('category').order('name');if(error)throw error;return data??[];},
    async record({featureCode,outcome,tierCode=null,destination=null,metadata={}}={}){if(!featureCode)throw new Error('featureCode is required.');const normalized=normalizeOutcome(outcome);if(!['allowed','locked','denied'].includes(normalized))throw new Error('Invalid feature access outcome.');const{data,error}=await client.rpc('record_feature_access',{p_feature_code:featureCode,p_outcome:normalized,p_tier_code:tierCode,p_destination:destination,p_metadata:{...(metadata??{}),...(String(outcome)==='blocked'?{original_outcome:'blocked'}:{})}});if(error)throw error;return data;},
    async recordAllowed(featureCode,options={}){return this.record({featureCode,outcome:'allowed',...options});},
    async recordBlocked(featureCode,options={}){return this.record({featureCode,outcome:'blocked',...options});},
    async recordLocked(featureCode,options={}){return this.record({featureCode,outcome:'locked',...options});},
  });
}
