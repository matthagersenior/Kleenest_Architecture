import MapSurfaceProductionFixed from './MapSurfaceProductionFixed.jsx';

// MapSurfaceProduction remains the canonical production surface; the fixed renderer
// preserves services.maps.nearby, discover:true, category=all, amenity-first discovery,
// DEFAULT_CENTER, ready/visible state, AMENITIES and the MapSurfaceV3.css contract.
export default function MapSurface() {
  return <MapSurfaceProductionFixed />;
}
