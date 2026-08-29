import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (x: unknown, s = 200) => new Response(JSON.stringify(x), { status: s, headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" } });

const AMENITY_QUERIES: Record<string, string[]> = {
  restroom: ['nwr["amenity"="toilets"]', 'nwr["building"="toilets"]', 'nwr["toilets"="yes"]', 'nwr["toilets:access"="public"]'],
  accessible_restroom: ['nwr["amenity"="toilets"]["wheelchair"="yes"]', 'nwr["toilets:wheelchair"="yes"]'],
  wheelchair: ['nwr["wheelchair"="yes"]'],
  drinking_water: ['nwr["amenity"="drinking_water"]', 'nwr["drinking_water"="yes"]'],
  baby_changing: ['nwr["changing_table"="yes"]', 'nwr["amenity"="toilets"]["changing_table"="yes"]'],
  shower: ['nwr["amenity"="shower"]', 'nwr["shower"="yes"]'],
  handwashing: ['nwr["handwashing"="yes"]'],
  seating: ['nwr["amenity"="bench"]', 'nwr["seats"]'],
  parking: ['nwr["amenity"="parking"]'],
  ev_charging: ['nwr["amenity"="charging_station"]', 'nwr["amenity"="fuel"]["fuel:electricity"="yes"]'],
  wifi: ['nwr["internet_access"="wlan"]', 'nwr["internet_access"="yes"]'],
  atm: ['nwr["amenity"="atm"]'],
};

const AMENITY_LABELS: Record<string, string> = {
  restroom: "Restroom", accessible_restroom: "Accessible restroom", wheelchair: "Wheelchair accessible", drinking_water: "Drinking water", baby_changing: "Baby changing", shower: "Shower", handwashing: "Handwashing", seating: "Seating", parking: "Parking", ev_charging: "EV charging", wifi: "Wi-Fi", atm: "ATM",
};

function category(t: any) {
  if (t.amenity === "toilets" || t.building === "toilets" || t.toilets === "yes" || t["toilets:access"] === "public") return "restroom";
  if (t.amenity === "fuel") return "gas_station";
  if (t.amenity === "restaurant" || t.amenity === "fast_food") return "restaurant";
  if (t.amenity === "cafe") return "cafe";
  if (["hospital", "clinic", "doctors", "dentist", "pharmacy"].includes(t.amenity)) return "health";
  if (["park", "nature_reserve", "playground", "sports_centre"].includes(t.leisure)) return "park";
  if (["supermarket", "convenience", "mall", "department_store", "bakery", "pharmacy"].includes(t.shop)) return "shopping";
  if (["townhall", "courthouse", "police", "fire_station"].includes(t.amenity) || t.office === "government") return "public_safety";
  return "service";
}

function amenityState(t: any) {
  const enabled: Record<string, boolean> = {};
  const yes = (v: unknown) => ["yes", "true", "public", "customers", "accessible"].includes(String(v ?? "").toLowerCase());
  if (t.amenity === "toilets" || t.building === "toilets" || yes(t.toilets) || t["toilets:access"] === "public") enabled.restroom = true;
  if (t.wheelchair === "yes" || t["toilets:wheelchair"] === "yes") enabled.wheelchair = true;
  if (t.amenity === "drinking_water" || yes(t.drinking_water)) enabled.drinking_water = true;
  if (yes(t.changing_table) || t.amenity === "changing_table") enabled.baby_changing = true;
  if (t.amenity === "shower" || yes(t.shower)) enabled.shower = true;
  if (yes(t.handwashing)) enabled.handwashing = true;
  if (t.amenity === "bench" || t.seats != null) enabled.seating = true;
  if (t.amenity === "parking") enabled.parking = true;
  if (t.amenity === "charging_station" || t["fuel:electricity"] === "yes") enabled.ev_charging = true;
  if (["wlan", "yes"].includes(String(t.internet_access ?? "").toLowerCase())) enabled.wifi = true;
  if (t.amenity === "atm") enabled.atm = true;
  if (enabled.restroom && enabled.wheelchair) enabled.accessible_restroom = true;
  return enabled;
}

function matchesAmenity(t: any, requested: string[]) {
  if (!requested.length) return true;
  const enabled = amenityState(t);
  return requested.every(name => Boolean(enabled[name]));
}

function rows(es: any[]) {
  return es.map(e => {
    const t = e.tags || {}, lat = Number(e.lat ?? e.center?.lat), lng = Number(e.lon ?? e.center?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const c = category(t), id = `osm:${e.type}:${e.id}`, amenities = amenityState(t);
    const address = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ") || t["addr:full"] || t["addr:place"] || "";
    return { id, location_id: id, source_id: id, latitude: lat, longitude: lng, name: t.name || t.brand || t.operator || (c === "restroom" ? "Public Restroom" : `Unnamed ${c.replaceAll("_", " ")}`), category: c, place_type: c, address, city: t["addr:city"] || t["addr:town"] || t["addr:village"] || "", state: t["addr:state"] || "", postal_code: t["addr:postcode"] || "", brand: t.brand || null, operator_name: t.operator || null, source: "live_osm", source_dataset: "openstreetmap_live", source_external_id: id, osm_tags: t, amenities, amenity_labels: Object.keys(amenities).map(k => AMENITY_LABELS[k] || k), is_verified: false };
  }).filter(Boolean);
}

function baseQueries(lat: number, lng: number, r: number) {
  const dlat = r / 111320, dlng = r / (111320 * Math.max(Math.cos(lat * Math.PI / 180), .2));
  const box = `(${lat-dlat},${lng-dlng},${lat+dlat},${lng+dlng})`;
  return [
    `nwr[amenity~"restaurant|fast_food|cafe|fuel|toilets|hospital|clinic|doctors|dentist|pharmacy|library|bus_station|townhall|courthouse|police|fire_station"]${box}`,
    `nwr[building="toilets"]${box}`,
    `nwr[toilets="yes"]${box}`,
    `nwr["toilets:access"="public"]${box}`,
    `nwr[shop~"supermarket|convenience|mall|department_store|bakery|pharmacy"]${box}`,
    `nwr[leisure~"park|nature_reserve|playground|sports_centre"]${box}`,
    `nwr[railway="station"]${box}`,
    `nwr[tourism~"hotel|motel|hostel|museum|gallery"]${box}`,
  ];
}

function query(lat: number, lng: number, r: number, requested: string[]) {
  const dlat = r / 111320, dlng = r / (111320 * Math.max(Math.cos(lat * Math.PI / 180), .2));
  const box = `(${lat-dlat},${lng-dlng},${lat+dlat},${lng+dlng})`;
  const selected = [...new Set(requested.flatMap(name => AMENITY_QUERIES[name] || []))];
  const clauses = selected.length ? selected : baseQueries(lat, lng, r);
  return `[out:json][timeout:15];(${clauses.join(";")};);out center tags;`;
}

async function one(endpoint: string, q: string) { const c = new AbortController(), timer = setTimeout(() => c.abort(), 16000); try { const r = await fetch(endpoint, { method: "POST", headers: { "content-type": "text/plain", "user-agent": "KleenestApp/1.0" }, body: q, signal: c.signal }); if (!r.ok) throw new Error(`HTTP ${r.status}`); const p = await r.json(); return Array.isArray(p.elements) ? p.elements : []; } finally { clearTimeout(timer); } }
async function live(q: string) { const results = await Promise.allSettled(ENDPOINTS.map(ep => one(ep, q))); const usable = results.filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled"); if (!usable.length) throw new Error("All map discovery providers failed"); const merged = usable.flatMap(r => r.value); const seen = new Set<string>(); const elements = merged.filter(e => { const id = `${e.type}:${e.id}`; if (seen.has(id)) return false; seen.add(id); return true; }); return { elements, providers_succeeded: usable.length, providers_attempted: ENDPOINTS.length }; }

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: { code: "METHOD_NOT_ALLOWED", message: "POST required" } }, 405);
  try {
    const b = await req.json(), lat = Number(b.latitude ?? b.lat), lng = Number(b.longitude ?? b.lng), radius = Math.min(Math.max(Number(b.radius_km || 8), 1), 20);
    const requested = Array.isArray(b.amenity_names) ? [...new Set(b.amenity_names.map((x: unknown) => String(x).trim().toLowerCase()).filter(x => x in AMENITY_QUERIES))] : [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return json({ ok: false, error: { code: "INVALID_COORDINATES", message: "valid lat/lng required" } }, 400);
    const acquired = await live(query(lat, lng, radius * 1000, requested));
    const locations = rows(acquired.elements).filter((row: any) => matchesAmenity(row.osm_tags || {}, requested));
    return json({ ok: true, contract: "interactive-discovery-only", canonical_persistence: "scheduled-maps-ingest", acquisition_status: locations.length ? "success" : "empty", cached: false, discovered: locations.length, radius_km: radius, amenity_names: requested, providers_succeeded: acquired.providers_succeeded, providers_attempted: acquired.providers_attempted, locations });
  } catch (e) {
    return json({ ok: false, contract: "interactive-discovery-only", error: { code: "DISCOVERY_FAILED", stage: "acquisition", message: e instanceof Error ? e.message : String(e), retryable: true }, locations: [] }, 502);
  }
});
