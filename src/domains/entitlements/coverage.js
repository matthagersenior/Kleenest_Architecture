export function createCapabilityCoverageService(client){
  if(!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    async list(){
      const {data,error}=await client.from('capability_coverage_rollup').select('*').order('category').order('feature_code');
      if(error) throw error;
      return data??[];
    },
    async record({featureCode,outcome,tierCode=null,destination=null,metadata={}}={}){
      if(!featureCode) throw new Error('featureCode is required.');
      const {data,error}=await client.rpc('record_feature_access',{p_feature_code:featureCode,p_outcome:outcome,p_tier_code:tierCode,p_destination:destination,p_metadata:metadata??{}});
      if(error) throw error;
      return data;
    },
    async recordAllowed(featureCode, options={}){ return this.record({featureCode,outcome:'allowed',...options}); },
    async recordBlocked(featureCode, options={}){ return this.record({featureCode,outcome:'blocked',...options}); },
    async recordLocked(featureCode, options={}){ return this.record({featureCode,outcome:'locked',...options}); },
  });
}
