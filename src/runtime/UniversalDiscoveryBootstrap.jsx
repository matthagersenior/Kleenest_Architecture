import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext.jsx';

export default function UniversalDiscoveryBootstrap() {
  const { configured, loading, user, services } = useAppContext();
  const started = useRef(false);

  useEffect(() => {
    // Canonical map RPCs and ingestion are authenticated. Do not race the
    // initial auth/profile load with background discovery.
    if (!configured || loading || !user || !services?.maps || started.current) return;
    started.current = true;
    if (!navigator.geolocation) return;

    let active = true;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (!active) return;
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
        // Bootstrap is opportunistic. The active map owns user-visible errors.
      }
    }, () => {}, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });

    return () => { active = false; };
  }, [configured, loading, user, services]);

  return null;
}
