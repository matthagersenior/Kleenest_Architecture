/**
 * Shared Location Authority projection.
 *
 * Downstream surfaces must preserve canonical identity and source evidence rather
 * than inventing a second location model. This projection is deliberately tolerant
 * of both authority-bundle and already-normalized service payloads.
 */
export function locationAuthorityId(value) {
  return String(value?.location_id ?? value?.locationId ?? value?.canonical_location_id ?? value?.id ?? '');
}

export function locationAuthorityCoordinates(value) {
  const latitude = Number(value?.latitude ?? value?.lat ?? value?.geometry?.latitude);
  const longitude = Number(value?.longitude ?? value?.lng ?? value?.lon ?? value?.geometry?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

export function projectLocationAuthority(value) {
  if (!value) return null;
  const root = value?.location || value;
  const place = value?.place || {};
  const external = Array.isArray(value?.external_records) ? value.external_records : [];
  const latest = external[0] || value?.external_record || {};
  const raw = latest?.raw_data ?? latest?.rawData ?? value?.raw_data ?? value?.rawData ?? null;
  const tags = latest?.tags ?? latest?.osm_tags ?? raw?.osm_tags ?? raw?.tags ?? raw?.source_metadata?.tags ?? value?.osm_tags ?? value?.raw_tags ?? root?.source_metadata?.tags ?? null;
  const coords = locationAuthorityCoordinates({ ...place, ...root });
  const id = locationAuthorityId({ ...place, ...root });
  const sourceMetadata=root?.source_metadata??place?.source_metadata??raw?.source_metadata??value?.source_metadata??null;

  return {
    ...place,
    ...root,
    id,
    location_id: id,
    locationId: id,
    latitude: coords?.latitude ?? root?.latitude ?? place?.latitude ?? null,
    longitude: coords?.longitude ?? root?.longitude ?? place?.longitude ?? null,
    address: root?.address ?? place?.address ?? root?.formatted_address ?? place?.formatted_address ?? '',
    source: root?.source ?? raw?.source ?? latest?.source ?? latest?.source_system ?? place?.source ?? null,
    source_dataset: root?.source_dataset ?? raw?.source_dataset ?? latest?.source_dataset ?? place?.source_dataset ?? null,
    external_location_id: latest?.external_location_id ?? latest?.external_id ?? latest?.osm_id ?? root?.external_location_id ?? null,
    external_records: external.length ? external : value?.external_records ?? [],
    raw_data: raw,
    raw_tags: tags,
    osm_tags: tags,
    source_metadata: sourceMetadata,
    source_provenance: value?.source_provenance ?? (latest && Object.keys(latest).length ? {
      source: raw?.source ?? latest.source ?? latest.source_system ?? null,
      dataset: raw?.source_dataset ?? latest.source_dataset ?? null,
      external_id: latest.external_location_id ?? latest.external_id ?? latest.osm_id ?? null,
      captured_at: raw?.source_metadata?.captured_at ?? latest.last_seen_at ?? latest.source_updated_at ?? latest.captured_at ?? latest.ingested_at ?? latest.created_at ?? null,
    } : null),
    amenities: value?.amenities ?? root?.amenities ?? place?.amenities ?? sourceMetadata?.amenities ?? raw?.amenities ?? [],
    trust: value?.trust ?? root?.trust ?? null,
    intelligence: value?.intelligence ?? root?.intelligence ?? null,
  };
}

const tagValue=(tags,...keys)=>{for(const key of keys){const value=tags?.[key];if(value!=null&&String(value).trim())return value;}return null;};
const canonicalAddress=(place,tags)=>place.address||tagValue(tags,'addr:full')||[tagValue(tags,'addr:housenumber'),tagValue(tags,'addr:street')].filter(Boolean).join(' ')||'';
const canonicalAmenities=(place,tags)=>{
  if(Array.isArray(place.amenities)&&place.amenities.length)return place.amenities;
  if(place.amenities&&typeof place.amenities==='object')return Object.entries(place.amenities).filter(([,v])=>v===true||['yes','public','customers','accessible'].includes(String(v).toLowerCase())).map(([k])=>k);
  const candidates=['toilets','wheelchair','toilets:wheelchair','changing_table','drinking_water','shower','handwashing','internet_access','atm','parking'];
  return candidates.filter(key=>{const v=tags?.[key];return v===true||['yes','public','customers','accessible','wlan'].includes(String(v??'').toLowerCase())});
};

export function locationAuthorityRoutePoint(value) {
  const place = projectLocationAuthority(value);
  if (!place) return null;
  const coords = locationAuthorityCoordinates(place);
  const tags = place.raw_tags ?? place.osm_tags ?? {};
  const trust = place.trust ?? {};
  const provenance = place.source_provenance ?? {};
  const name = place.name ?? place.brand ?? place.operator_name ?? tagValue(tags,'name','brand','operator') ?? 'Location';
  return {
    locationId: place.location_id,
    id: place.location_id,
    name,
    address: canonicalAddress(place,tags),
    phone: place.phone ?? place.phone_number ?? place.source_metadata?.phone ?? tagValue(tags,'phone','contact:phone') ?? null,
    openingHours: place.opening_hours ?? place.openingHours ?? place.source_metadata?.opening_hours ?? tagValue(tags,'opening_hours') ?? null,
    website: place.website ?? place.source_metadata?.website ?? tagValue(tags,'website','contact:website') ?? null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    amenities: canonicalAmenities(place,tags),
    bathroomStatus: place.bathroom_verification_status ?? place.bathroomStatus ?? (['toilets','restroom','bathroom'].includes(String(tags.amenity??'').toLowerCase())||['yes','public','customers'].includes(String(tags.toilets??'').toLowerCase())?'has_bathroom':null),
    bathroomAccess: place.bathroom_access ?? place.bathroomAccess ?? tagValue(tags,'toilets:access','access') ?? null,
    bathroomConfidence: place.bathroom_confidence ?? place.bathroomConfidence ?? place.verification_confidence ?? place.location_confidence_score ?? null,
    bathroomEvidenceCount: place.bathroom_evidence_count ?? place.bathroomEvidenceCount ?? place.bathroom_verification_count ?? trust.evidenceCount ?? null,
    trustScore: place.trust_score ?? trust.score ?? null,
    freshnessScore: place.trust_freshness_score ?? trust.freshness ?? null,
    stalenessStatus: place.trust_staleness_status ?? trust.staleness ?? null,
    lastVerifiedAt: place.trust_last_verified_at ?? trust.lastVerifiedAt ?? null,
    reverificationDueAt: place.trust_reverification_due_at ?? trust.reverificationDueAt ?? null,
    sourceCapturedAt: provenance.captured_at ?? place.source_metadata?.captured_at ?? null,
    source: place.source ?? null,
    source_dataset: place.source_dataset ?? null,
    external_location_id: place.external_location_id ?? null,
    raw_tags: tags,
    validation: coords ? 'valid' : 'pending',
  };
}
