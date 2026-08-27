import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON=Deno.env.get("SUPABASE_ANON_KEY")!;
const db=createClient(URL,SERVICE,{auth:{persistSession:false}});
const auth=createClient(URL,ANON,{auth:{persistSession:false}});
const C={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization,x-client-info,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"};
const out=(x:unknown,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json",...C}});

const BOX:Record<string,[number,number,number,number]>={
  STL:[38.532,-90.320,38.774,-90.166],KCMO:[38.829,-94.819,39.377,-94.419],NYC:[40.477,-74.259,40.918,-73.700],
  LA:[33.704,-118.668,34.337,-117.646],CHI:[41.645,-87.940,42.023,-87.524],DFW:[32.536,-97.083,33.385,-96.376],
  HOU:[29.48,-95.91,30.11,-95.01],DC:[38.79,-77.12,39,-76.85],MIA:[25.38,-80.32,25.98,-80.03],
  PHL:[39.83,-75.28,40.14,-74.96],ATL:[33.5,-84.75,34,-84.05],PHX:[33.25,-112.5,33.9,-111.9]
};
const QUERIES:Record<string,string[]>={
  STL:["St. Louis Missouri","St Louis Missouri","Saint Louis Missouri","Missouri public restrooms","Missouri parks","Missouri restaurant inspections","Missouri public facilities"],
  KCMO:["Kansas City Missouri","Kansas City MO","Missouri public restrooms","Missouri parks","Missouri restaurant inspections"],
  NYC:["New York City public restrooms","New York restaurant inspections","New York City parks"],LA:["Los Angeles public restrooms","Los Angeles restaurant inspections","Los Angeles parks"],
  CHI:["Chicago public restrooms","Chicago food inspections","Chicago parks"],DFW:["Dallas public restrooms","Fort Worth public restrooms","Texas restaurant inspections"],
  HOU:["Houston public restrooms","Houston restaurant inspections","Houston parks"],DC:["Washington DC public restrooms","Washington DC restaurant inspections","Washington DC parks"],
  MIA:["Miami public restrooms","Miami restaurant inspections","Miami parks"],PHL:["Philadelphia public restrooms","Philadelphia restaurant inspections","Philadelphia parks"],
  ATL:["Atlanta public restrooms","Atlanta restaurant inspections","Atlanta parks"],PHX:["Phoenix public restrooms","Phoenix restaurant inspections","Phoenix parks"]
};

async function admin(req:Request){
  const t=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");if(!t)throw Error("Authentication required");
  const {data,error}=await auth.auth.getUser(t);if(error||!data.user)throw Error("Invalid authentication");
  const {data:p,error:pe}=await db.from("profiles").select("is_admin,role").eq("id",data.user.id).maybeSingle();if(pe)throw pe;
  const role=String(p?.role||"").toLowerCase();if(!p?.is_admin&&!['admin','owner','platform_admin','super_admin'].includes(role))throw Error("Admin access required");return data.user.id;
}
function coords(x:any){
  const g=x.geometry||x.geo_shape||x.geolocation||x.location;
  if(g?.coordinates&&Array.isArray(g.coordinates)){const a=g.coordinates;const c=a.length>2?a[a.length-1]:a;return{lat:Number(c[1]),lon:Number(c[0])};}
  if(g?.latitude&&g?.longitude)return{lat:Number(g.latitude),lon:Number(g.longitude)};
  if(x.latitude&&x.longitude)return{lat:Number(x.latitude),lon:Number(x.longitude)};
  return null;
}
function row(x:any,city:string,d:any,i:number){
  const p=coords(x);if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon))return null;const b=BOX[city];if(p.lat<b[0]||p.lat>b[2]||p.lon<b[1]||p.lon>b[3])return null;
  const text=JSON.stringify(x).toLowerCase();let type="service";if(/restroom|bathroom|toilet|lavatory/.test(text))type="restroom";else if(/restaurant|food establishment|eatery|food service/.test(text))type="restaurant";else if(/park|recreation|greenway/.test(text))type="park";else if(/cafe|coffee/.test(text))type="cafe";else if(/gas|fuel/.test(text))type="gas_station";
  return {source_id:`datagov:${d.id}:${x.id||x.objectid||x.OBJECTID||i}`,latitude:p.lat,longitude:p.lon,name:x.name||x.facility_name||x.site_name||x.business_name||x.location_name||`${d.title} ${i+1}`,place_type:type,address:x.address||x.street_address||x.location_address||null,city:x.city||city,state:x.state||null,postal_code:String(x.zip||x.zipcode||x.postal_code||"")||null,phone:x.phone||x.telephone||null,website:x.website||x.url||null,source_metadata:{source:"Data.gov",catalog_dataset_id:d.id,dataset:d.title,dataset_description:d.notes||null,record:x,brand:x.brand||x.chain||x.operator||null}};
}
async function fetchResource(url:string){
  const r=await fetch(url,{headers:{"user-agent":"KleenestApp/1.0","accept":"application/json,text/csv,application/geo+json,*/*"}});if(!r.ok)return null;const ct=r.headers.get("content-type")||"";
  if(ct.includes("json")||ct.includes("geojson")||/\.json($|\?)/i.test(url)){const j=await r.json();if(Array.isArray(j))return j;if(Array.isArray(j.features))return j.features.map((f:any)=>({...f.properties,geometry:f.geometry}));return j.result?.records||j.records||j.data||null;}
  if(ct.includes("csv")||/\.csv($|\?)/i.test(url)){const txt=await r.text();const lines=txt.split(/\r?\n/).filter(Boolean);if(!lines.length)return[];const parse=(s:string)=>s.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(v=>v.trim().replace(/^\"|\"$/g,""));const h=parse(lines[0]);return lines.slice(1).map(l=>{const v=parse(l);return Object.fromEntries(h.map((k,i)=>[k,v[i]??""]));});}
  return null;
}
async function search(q:string){const u=`https://catalog.data.gov/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=50&start=0`;const r=await fetch(u,{headers:{accept:"application/json","user-agent":"KleenestApp/1.0"}});if(!r.ok)throw Error(`Data.gov catalog ${r.status} for ${q}`);const j=await r.json();if(!j.success)throw Error(j.error?.message||`Data.gov search failed for ${q}`);return j.result?.results||[];}
async function ingest(rows:any[]){let total={imported_locations:0,updated_locations:0};for(let i=0;i<rows.length;i+=500){const {data,error}=await db.rpc("ingest_external_locations",{p_source_key:"data_gov",p_rows:rows.slice(i,i+500)});if(error)throw error;total.imported_locations+=Number(data?.imported_locations||0);total.updated_locations+=Number(data?.updated_locations||0);}return total;}
async function city(city:string){
  if(!BOX[city])throw Error(`Unsupported city: ${city}`);const ds:any[]=[];const seen=new Set<string>();const errors:string[]=[];
  for(const q of QUERIES[city])try{for(const d of await search(q))if(!seen.has(d.id)){seen.add(d.id);ds.push(d);}}catch(e){errors.push(String(e));}
  const imports:any[]=[];let rowsTotal=0;
  for(const d of ds){const resources=(d.resources||[]).filter((r:any)=>{const u=String(r.url||"").toLowerCase();const f=String(r.format||"").toLowerCase();return /json|geojson|csv|api|arcgis|feature/.test(`${f} ${u}`)}).slice(0,8);
    for(const r of resources)try{const raw=await fetchResource(r.url);if(!Array.isArray(raw))continue;const rows=raw.map((x:any,i:number)=>row(x,city,d,i)).filter(Boolean);if(rows.length){const totals=await ingest(rows);rowsTotal+=rows.length;imports.push({dataset:d.title,dataset_id:d.id,resource:r.url,rows:rows.length,...totals});break;}}catch(e){errors.push(`${d.title}: ${String(e)}`);}
  }
  return{ok:true,city,source:"data_gov",datasets_considered:ds.length,datasets_with_imports:imports.length,rows_considered:rowsTotal,imports,search_errors:errors.slice(0,20)};
}
Deno.serve(async req=>{if(req.method==="OPTIONS")return new Response("ok",{headers:C});try{const user_id=await admin(req);const b=await req.json().catch(()=>({}));const action=String(b.action||"datagov-city");if(action==="datagov-city")return out({...await city(String(b.city||"").toUpperCase()),user_id});if(action==="datagov-top-10"){const markets=["STL","KCMO","NYC","LA","CHI","DFW","HOU","DC","MIA","PHL"];const results:any={};for(const c of markets)try{results[c]=await city(c); }catch(e){results[c]={ok:false,error:String(e)}}return out({ok:true,user_id,results});}return out({ok:false,error:`Unsupported action: ${action}`},400);}catch(e){return out({ok:false,error:e instanceof Error?e.message:String(e)},500);}});
