import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { emptyAcquisitionResult, ingestionError, scheduledResult } from "../_shared/map-ingestion-contract.ts";

const URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SOURCE_ID = "52b2f51b-5749-470f-90fe-abf7a3173356";
const VERSION = 24;
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const MARKETS: Record<string, [number, number, number, number]> = {
  st_louis: [38.35, -90.75, 38.9, -89.7],
  kansas_city: [38.75, -95, 39.5, -94.1],
  chicago: [41.6445, -87.9401, 42.023, -87.5237],
};
const headers = { "content-type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-kleenest-scheduler" };
const json = (x: unknown, s = 200) => new Response(JSON.stringify(x), { status: s, headers });
const serviceClient = createClient(URL, SERVICE, { auth: { persistSession: false } });

async function auth(req: Request) {
  const scheduler = req.headers.get("x-kleenest-scheduler") || "";
  if (scheduler) {
    const { data, error } = await serviceClient.rpc("get_internal_scheduler_secret", { p_name: "kleenest_maps_scheduler" });
    if (!error && data && scheduler === data) return "scheduler";
  }
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new Error("Authentication required");
  if (token === SERVICE) return "service-role";
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid authentication");
  const { data: p, error: pe } = await serviceClient.from("profiles").select("is_admin,role").eq("id", data.user.id).maybeSingle();
  if (pe) throw pe;
  const role = String(p?.role || "").toLowerCase();
  if (!p?.is_admin && !["admin", "super_admin", "platform_admin", "owner"].includes(role)) throw new Error("Admin access required");
  return data.user.id;
}

function normalize(el: any) {
  const t = el.tags || {}, c = el.center || { lat: el.lat, lon: el.lon };
  const bathroom = t.amenity === "toilets" || t.toilets === "yes" || t.changing_table === "yes";
  const type = t.amenity === "restaurant" ? "restaurant" : t.amenity === "cafe" ? "cafe" : t.amenity === "fuel" ? "gas_station" : t.shop ? "shopping" : t.leisure === "park" ? "park" : t.amenity === "clinic" || t.amenity === "hospital" ? "health" : t.amenity === "fire_station" || t.amenity === "police" ? "public_safety" : bathroom ? "restroom" : "service";
  return { source_id: `osm:${el.type}:${el.id}`, latitude: c.lat, longitude: c.lon, name: t.name || t.operator || (bathroom ? "Public restroom" : "Unnamed place"), place_type: type, address: [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ") || null, city: t["addr:city"] || null, state: t["addr:state"] || null, postal_code: t["addr:postcode"] || null, phone: t.phone || t["contact:phone"] || null, website: t.website || t["contact:website"] || null, osm_amenity: t.amenity || null, observations: t, source_metadata: { source: "OpenStreetMap", osm_type: el.type, osm_id: String(el.id), brand: t.brand || null, operator: t.operator || null, bathroom_confirmed: bathroom } };
}
function splitBox(b: [number, number, number, number]) { const [s, w, n, e] = b; const a = s + (n - s) / 3, b2 = s + 2 * (n - s) / 3, c = w + (e - w) / 3, d = w + 2 * (e - w) / 3; return [[s,w,a,c],[s,c,a,d],[s,d,a,e],[a,w,b2,c],[a,c,b2,d],[a,d,b2,e],[b2,w,n,c],[b2,c,n,d],[b2,d,n,e]] as [number,number,number,number][]; }
function queryFor(b: [number, number, number, number]) { const [s,w,n,e] = b; return `[out:json][timeout:35];(nwr[amenity~"restaurant|cafe|fuel|toilets|clinic|hospital|fire_station|police"](${s},${w},${n},${e});nwr[shop](${s},${w},${n},${e});nwr[leisure=park](${s},${w},${n},${e});nwr[toilets=yes](${s},${w},${n},${e});nwr[changing_table=yes](${s},${w},${n},${e}););out center tags;`; }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function fetchTile(b: [number,number,number,number]) {
  const q = queryFor(b); let last = "";
  for (const endpoint of ENDPOINTS) for (let attempt = 0; attempt < 2; attempt++) {
    const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 40000);
    try {
      const r = await fetch(endpoint, { method: "POST", headers: { "content-type": "text/plain", "user-agent": "KleenestApp/1.0" }, body: q, signal: ac.signal });
      if (r.ok) { const d = await r.json(); return Array.isArray(d.elements) ? d.elements : []; }
      const retryable = [429,502,503,504].includes(r.status), retryAfter = r.headers.get("retry-after");
      last = `${endpoint}: HTTP ${r.status}`;
      if (!retryable) break;
      if (attempt === 0) await sleep(retryAfter ? Math.min(10000, Math.max(500, Number(retryAfter) * 1000)) : 1000);
    } catch (e) { last = e instanceof Error ? e.message : String(e); if (attempt === 0) await sleep(750); }
    finally { clearTimeout(timer); }
  }
  throw new Error(`tile fetch failed after endpoint failover: ${last}`);
}

async function recoverStaleJobs() {
  await serviceClient.from("external_import_jobs").update({ status: "failed", finished_at: new Date().toISOString(), errors: 1, error_detail: [{ code: "STALE_JOB_RECOVERED", stage: "job_accounting", message: "Recovered stale running maps_ingest job" }] }).eq("job_type", "maps_ingest").eq("status", "running").lt("started_at", new Date(Date.now() - 30 * 60_000).toISOString());
}

async function run(body: any) {
  const market = String(body.market || "").toLowerCase(), box = MARKETS[market];
  if (!box) throw new Error(`market must be one of ${Object.keys(MARKETS).join(", ")}`);
  await recoverStaleJobs();
  const { data: job, error: je } = await serviceClient.from("external_import_jobs").insert({ source_id: SOURCE_ID, job_type: "maps_ingest", status: "running", started_at: new Date().toISOString(), query: { market, classification: "network_places_and_bathrooms", version: VERSION, contract: "scheduled-authoritative" } }).select("id").single();
  if (je) throw je;
  const jobId = job.id;
  try {
    const tiles = splitBox(box), results = await Promise.allSettled(tiles.map(fetchTile)), elements: any[] = [], failures: string[] = [];
    for (const r of results) r.status === "fulfilled" ? elements.push(...r.value) : failures.push(r.reason?.message || String(r.reason));
    const seen = new Set<string>();
    const rows = elements.filter(el => { const k = `${el.type}:${el.id}`; if (seen.has(k)) return false; seen.add(k); return true; }).map(normalize).filter((x: any) => Number.isFinite(x.latitude) && Number.isFinite(x.longitude));
    if (failures.length === tiles.length) {
      const errors = [ingestionError("acquisition", "UPSTREAM_ALL_TILES_FAILED", "All Overpass acquisition tiles failed", { provider: "overpass", retryable: true, details: { failures, total_tiles: tiles.length } })];
      await serviceClient.from("external_import_jobs").update({ status: "failed", finished_at: new Date().toISOString(), records_seen: 0, errors: 1, error_detail: errors }).eq("id", jobId);
      return scheduledResult({ acquisition_status: "failed", persistence_status: "not_started", job_status: "failed", discovered: 0, imported: 0, updated: 0, observations_upserted: 0, errors });
    }
    let imported = 0, updated = 0, obs = 0;
    if (rows.length) {
      for (let i = 0; i < rows.length; i += 250) {
        const out = await serviceClient.rpc("ingest_external_locations", { p_source_key: "osm", p_rows: rows.slice(i, i + 250) });
        if (out.error) throw out.error;
        imported += Number(out.data?.imported_locations || 0); updated += Number(out.data?.updated_locations || 0); obs += Number(out.data?.observations_upserted || 0);
      }
    }
    const acquisition_status = rows.length ? "success" : "empty";
    const errors = failures.length ? [ingestionError("acquisition", "UPSTREAM_PARTIAL_FAILURE", "One or more acquisition tiles failed", { provider: "overpass", retryable: true, details: { failures, failed_tiles: failures.length, total_tiles: tiles.length } })] : [];
    const result = scheduledResult({ acquisition_status, persistence_status: "succeeded", job_status: errors.length ? "failed" : "completed", discovered: rows.length, imported, updated, observations_upserted: obs, errors });
    await serviceClient.from("external_import_jobs").update({ status: result.job_status, finished_at: new Date().toISOString(), records_seen: rows.length, records_imported: imported, observations_imported: obs, errors: errors.length, error_detail: errors }).eq("id", jobId);
    return { ...result, market, version: VERSION, tiles: tiles.length, successful_tiles: tiles.length - failures.length, job_id: jobId };
  } catch (e) {
    const error = ingestionError("persistence", "CANONICAL_PERSISTENCE_FAILED", e instanceof Error ? e.message : String(e), { retryable: true });
    await serviceClient.from("external_import_jobs").update({ status: "failed", finished_at: new Date().toISOString(), errors: 1, error_detail: [error] }).eq("id", jobId);
    return scheduledResult({ acquisition_status: "success", persistence_status: "failed", job_status: "failed", discovered: 0, imported: 0, updated: 0, observations_upserted: 0, errors: [error] });
  }
}

Deno.serve(async req => {
  try { if (req.method === "OPTIONS") return new Response(null, { status: 204, headers }); if (req.method !== "POST") return json({ ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "POST required" } }, 405); await auth(req); return json(await run(await req.json())); }
  catch (e) { return json({ ok: false, error: { code: "INGESTION_REQUEST_FAILED", stage: "job_accounting", message: e instanceof Error ? e.message : String(e) } }, 500); }
});
