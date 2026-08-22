export function normalizePlace(row = {}) {
  return Object.freeze({
    ...row,
    id: row.id ?? row.location_id ?? null,
    location_id: row.location_id ?? row.id ?? null,
    name: row.name ?? 'Unknown location',
    latitude: Number(row.latitude),
    longitude: Number(row.longitude)
  });
}
