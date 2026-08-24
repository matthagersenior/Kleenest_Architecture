import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext.jsx';

export default function UniversalDiscoveryBootstrap() {
  const { configured, services, user } = useAppContext();
  const started = useRef(false);
  useEffect(() => {
    if (!configured || !services?.maps || started.current) return;
    started.current = true;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        await services.maps.prepareNearby({ latitude: coords.latitude, longitude: coords.longitude, radiusKm: 8, userId: user?.id ?? null });
      } catch {}
    }, () => {}, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }, [configured, services, user?.id]);
  return null;
}
