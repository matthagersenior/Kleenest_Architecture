import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext.jsx';

export default function UniversalDiscoveryBootstrap() {
  const { configured, services } = useAppContext();
  const started = useRef(false);

  useEffect(() => {
    if (!configured || !services?.maps || started.current) return;
    started.current = true;
    if (!navigator.geolocation) return;

    let active = true;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (!active) return;
      // Warm the canonical discovery path once. MapSurfaceV3 already performs
      // bounded discovery when its canonical query is empty, so do not run the
      // older ingest and prepare calls back-to-back and race the active map.
      try {
        await services.maps.nearby({
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusKm: 8,
          category: 'all',
          limit: 500,
          discover: true
        });
      } catch {
        // Bootstrap is opportunistic. The active map owns user-visible errors
        // and must never depend on this background warm-up succeeding.
      }
    }, () => {}, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });

    return () => { active = false; };
  }, [configured, services]);

  return null;
}
