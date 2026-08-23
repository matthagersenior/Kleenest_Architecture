const PROFILE_FIELDS=['id','display_name','username','avatar_url','bio','role','subscription_tier','points','level','streak','total_check_ins','total_reviews','is_business_user','is_admin','created_at'];
const EDITABLE_FIELDS=['display_name','username','avatar_url','bio'];
export function createProfileService(client){
 if(!client)throw new Error('Supabase client is required.');
 const projection=PROFILE_FIELDS.join(',');
 return Object.freeze({
  get:async userId=>{
   if(!userId)return null;
   const ensured=await client.rpc('ensure_current_user_profile');
   if(ensured.error)throw ensured.error;
   const [{data,error},{data:authData}]=await Promise.all([client.from('profiles').select(projection).eq('id',userId).maybeSingle(),client.auth.getUser()]);
   if(error)throw error;
   if(!data)return null;
   return {...data,email:authData?.user?.email??null};
  },
  update:async(userId,patch={})=>{
   if(!userId)throw new Error('User is required.');
   const payload=Object.fromEntries(EDITABLE_FIELDS.filter(key=>Object.prototype.hasOwnProperty.call(patch,key)).map(key=>[key,patch[key]]));
   const{data,error}=await client.from('profiles').update(payload).eq('id',userId).select(projection).single();
   if(error)throw error;
   const{data:authData}=await client.auth.getUser();
   return {...data,email:authData?.user?.email??null};
  }
 });
}
export{PROFILE_FIELDS,EDITABLE_FIELDS};
