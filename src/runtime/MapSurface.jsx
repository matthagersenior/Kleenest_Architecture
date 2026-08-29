import { useEffect, useMemo, useState } from 'react';
import { useAppContext, AppContext } from '../AppContext.jsx';
import MapSurfaceV3 from './MapSurfaceV3.jsx';

// Discovery is a public product capability. MapSurfaceV3 historically used the
// presence of `user` as its bootstrap gate, which prevented unauthenticated users
// from ever reaching canonical nearby discovery. Preserve the existing map
// implementation while supplying a bootstrap-only anonymous identity; all
// mutations still resolve authentication through Supabase inside their services.
export default function MapSurface() {
  const context = useAppContext();
  const [refreshGeneration, setRefreshGeneration] = useState(0);
  const [layoutReady, setLayoutReady] = useState(false);
  const publicContext = useMemo(() => {
    if (context.user) return context;
    return { ...context, user: { id: 'anonymous-map-bootstrap', isAnonymous: true } };
  }, [context]);

  useEffect(() => {
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    const mountAfterLayout = () => {
      if (cancelled) return;
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          if (!cancelled) setLayoutReady(true);
        });
      });
    };
    mountAfterLayout();
    const onPageShow = () => {
      if (!cancelled) setLayoutReady(false);
      mountAfterLayout();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  useEffect(() => {
    const onLocationRefresh = event => {
      if (!event?.detail?.locationId) return;
      setRefreshGeneration(value => value + 1);
    };
    window.addEventListener('kleenest:location-intelligence-refresh-requested', onLocationRefresh);
    return () => window.removeEventListener('kleenest:location-intelligence-refresh-requested', onLocationRefresh);
  }, []);

  return (
    <AppContext.Provider value={publicContext}>
      {layoutReady ? <MapSurfaceV3 key={refreshGeneration} /> : null}
    </AppContext.Provider>
  );
}
