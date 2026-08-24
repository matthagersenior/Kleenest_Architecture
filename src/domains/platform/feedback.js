export function createFeedbackService(client){
  if(!client)throw new Error('Supabase client is required.');
  return Object.freeze({submit:async({type,title,description,page=null,metadata={}}={})=>{if(!type||!title||!description)throw new Error('Feedback type, title, and description are required.');const{data,error}=await client.rpc('submit_feedback',{p_type:type,p_title:title,p_description:description,p_page:page,p_metadata:metadata});if(error)throw error;return data;}});
}
