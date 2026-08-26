import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext.jsx';

export default function UniversalDiscoveryBootstrap() {
  const { configured, loading, user, services } = useAppContext();
  const started = useRef(false);

  useEffect(() => {
    // Canonical map discovery is authenticated. Do not race the initial
    // auth/profile load or request a second browser location from bootstrap.
    if (!configured || loading || !user || !services?.maps || started.current) return;
    started.current = true;

    let active = true;
    try {
      const raw = window.localStorage.getItem('kleenest.lastLocation');
      if (!raw) return;
      const saved = JSON.parse(raw);
      const latitude = Number(saved?.latitude);
      const longitude = Number(saved?.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      services.maps.nearby({
        latitude,
        longitude,
        radiusKm: 8,
        category: 'all',
        limit: 500,
        discover: true
      }).catch(() => {
        // Bootstrap is opportunistic. The active map owns user-visible errors.
      });
    } catch {
      // Ignore malformed local state; the active map owns location acquisition.
    }

    return () => { active = false; };
  }, [configured, loading, user, services]);

  return null;
}
