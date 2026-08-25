import L from 'leaflet';

export const MAP_ICON_OPTIONS = [
  { id: 'auto', label: 'Automatic', glyph: '✦' },
  { id: 'restroom', label: 'Restroom', glyph: '🚻' },
  { id: 'restaurant', label: 'Restaurant', glyph: '🍽️' },
  { id: 'cafe', label: 'Cafe', glyph: '☕' },
  { id: 'hotel', label: 'Hotel', glyph: '🏨' },
  { id: 'retail', label: 'Retail', glyph: '🛍️' },
  { id: 'gas_station', label: 'Gas station', glyph: '⛽' },
  { id: 'health', label: 'Health', glyph: '⚕️' },
  { id: 'government', label: 'Government', glyph: '🏛️' },
  { id: 'park', label: 'Park', glyph: '🌳' },
  { id: 'service', label: 'Service', glyph: '🔧' },
  { id: 'brand', label: 'Brand', glyph: '🏷️' }
];
export const CATEGORY_GLYPHS = Object.fromEntries(MAP_ICON_OPTIONS.map(item => [item.id, item.glyph]));
export function safeText(value) { return String(value ?? '').replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char])); }
export function placeBrand(place) { return place.brand || place.operator_name || place.business_name || ''; }
function businessIdentity(place) { const id = place.business_id || place.businessId; if (!id) return null; try { const raw = window.localStorage.getItem(`kleenest.map.identity.${id}`); return raw ? JSON.parse(raw) : null; } catch { return null; } }
export function placeLogo(place) { const identity = businessIdentity(place); return identity?.logoUrl || place.logo_url || place.logoUrl || place.business_logo_url || place.businessLogoUrl || place.image_url || place.imageUrl || ''; }
export function placeIconKey(place) { const identity = businessIdentity(place); const explicit = identity?.iconKey || place.map_icon || place.map_icon_key || place.business_icon || place.icon_key; if (explicit && CATEGORY_GLYPHS[explicit]) return explicit; if (place.category && CATEGORY_GLYPHS[place.category]) return place.category; return 'auto'; }
export function placeStatus(place) { const raw = String(place.bathroom_verification_status || place.bathroom_status || place.verification_status || '').toLowerCase(); if (place.is_verified === true || raw === 'verified') return { key: 'verified', label: 'Verified', glyph: '✓' }; if (place.sponsored === true || place.is_sponsored === true || place.premium === true) return { key: 'premium', label: 'Premium', glyph: '◆' }; if (place.open_now === true || place.is_open === true) return { key: 'open', label: 'Open', glyph: '●' }; if (place.bathroom_reported === true || place.category === 'restroom' || raw) return { key: 'reported', label: 'Community reported', glyph: '•' }; return { key: 'unknown', label: 'Location signal', glyph: '•' }; }
export function markerIcon(place, { selected = false, favorite = false } = {}) { const iconKey = placeIconKey(place); const glyph = CATEGORY_GLYPHS[iconKey] || '✦'; const logo = placeLogo(place); const status = placeStatus(place); const brand = placeBrand(place); const identity = logo ? `<img class="marker-logo" src="${safeText(logo)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'"/><span class="marker-fallback">${glyph}</span>` : `<span class="marker-fallback">${glyph}</span>`; return L.divIcon({ className: 'kleenest-marker-wrapper', html: `<div class="map-marker ${status.key} ${selected ? 'selected' : ''} ${favorite ? 'favorite' : ''}" aria-label="${safeText(place.name || brand || 'Kleenest location')}"><span class="marker-identity">${identity}</span><span class="marker-status" title="${safeText(status.label)}">${status.glyph}</span>${brand ? `<small>${safeText(brand)}</small>` : ''}</div>`, iconSize: [58, 54], iconAnchor: [29, 50], popupAnchor: [0, -46] }); }
export function clusterIcon(count, category = 'all') { const glyph = CATEGORY_GLYPHS[category] || '✦'; return L.divIcon({ className: 'kleenest-cluster-wrapper', html: `<div class="map-cluster"><span>${glyph}</span><strong>${count}</strong></div>`, iconSize: [52, 52], iconAnchor: [26, 26] }); }

// Dense clustering is intentionally limited to broad-area views. Normal discovery
// zooms (13+) always render each business as its own branded/category marker so
// users can choose an individual business directly from the map.
export function clusterPlaces(places, zoom) {
  if (zoom >= 13) return places.map(place => ({ type: 'place', place }));
  const cellSize = zoom <= 10 ? 0.12 : 0.035;
  const groups = new Map();
  for (const place of places) {
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const key = `${Math.floor(lat / cellSize)}:${Math.floor(lng / cellSize)}`;
    const group = groups.get(key) || [];
    group.push(place);
    groups.set(key, group);
  }
  return Array.from(groups.values()).map(group => {
    if (group.length === 1) return { type: 'place', place: group[0] };
    const lat = group.reduce((sum, p) => sum + Number(p.latitude), 0) / group.length;
    const lng = group.reduce((sum, p) => sum + Number(p.longitude), 0) / group.length;
    const categories = group.map(p => p.category).filter(Boolean);
    const category = categories.length ? categories.sort()[0] : 'all';
    return { type: 'cluster', places: group, latitude: lat, longitude: lng, category };
  });
}
