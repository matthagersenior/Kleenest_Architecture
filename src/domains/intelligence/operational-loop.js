export function createOperationalIntelligenceLoopService({fleet,businessIntelligence,intelligenceConvergence,reporting}={}){
  if(!fleet||!intelligenceConvergence)throw new Error('Operational intelligence loop requires fleet and intelligence convergence services.');
  const emit=(name,detail)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))};
  const requireBusinessId=id=>{if(!id)throw new Error('Business is required.');return String(id)};
  const run=async(businessId,{surface='fleet',limit=25,start=null,end=null}={})=>{
    const id=requireBusinessId(businessId);
    const intelligence=surface==='business'&&businessIntelligence
      ? (businessIntelligence.authorityBundle?await businessIntelligence.authorityBundle(id,start,end):await businessIntelligence.dashboard(id,start,end))
      : await fleet.intelligence(id);
    const signals=surface==='business'&&businessIntelligence
      ? intelligence?.location_intelligence??intelligence?.locationIntelligence??intelligence?.intelligence??[]
      : intelligence?.recommendations??[];
    const candidates=surface==='fleet'?await fleet.notificationCandidates(id):[];
    const processed=await intelligenceConvergence.processJobs(limit);
    const result={businessId:id,surface,intelligence,signals,candidates,processed};
    emit('kleenest:operational-loop-updated',result);
    emit('kleenest:business-updated',{businessId:id,reason:'operational-loop'});
    return result;
  };
  const createAction=async(businessId,{locationId=null,surface='fleet',signalType,actionType,metadata={}}={})=>intelligenceConvergence.createAction({locationId,businessId:requireBusinessId(businessId),surface,signalType,actionType,metadata});
  const execute=async actionId=>intelligenceConvergence.executeAction(actionId);
  const complete=async(actionId,metadata={})=>intelligenceConvergence.completeAction(actionId,metadata);
  const notify=async args=>intelligenceConvergence.notifyFromSignal(args);
  const publish=async args=>intelligenceConvergence.publishLocationSignal(args);
  return Object.freeze({run,createAction,execute,complete,notify,publish,processJobs:limit=>intelligenceConvergence.processJobs(limit),report:async(businessId,start,end)=>reporting?.business?.(requireBusinessId(businessId),start,end)??null});
}
