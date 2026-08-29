export type IngestionStage='acquisition'|'normalization'|'persistence'|'job_accounting';
export type IngestionError={code:string;stage:IngestionStage;message:string;provider?:string;retryable?:boolean;details?:unknown};
export type IngestionResult={ok:boolean;acquisition_status:'success'|'empty'|'failed';persistence_status:'succeeded'|'not_started'|'failed';job_status:'completed'|'failed';discovered:number;imported:number;updated:number;observations_upserted:number;errors:IngestionError[]};
export function describeError(e:unknown){if(e instanceof Error)return{message:e.message,name:e.name};if(e&&typeof e==='object'){const x=e as Record<string,unknown>;return{message:String(x.message??x.error??x.details??'Unknown error'),code:x.code,details:x.details,hint:x.hint,name:x.name};}return{message:String(e)};}
export function ingestionError(stage:IngestionStage,code:string,message:string,extra:Partial<IngestionError>={}):IngestionError{return{code,stage,message,...extra};}
export function scheduledResult(input:Omit<IngestionResult,'ok'>):IngestionResult{const ok=input.job_status==='completed'&&input.persistence_status==='succeeded'&&input.errors.length===0;return{ok,...input};}
