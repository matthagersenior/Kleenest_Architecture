import { useMemo } from 'react';
import { useAppContext, AppContext } from '../AppContext.jsx';
import MapSurfaceV3 from './MapSurfaceV3.jsx';

// Discovery is a public product capability. MapSurfaceV3 historically used the
// presence of `user` as its bootstrap gate, which prevented unauthenticated users
// from ever reaching canonical nearby discovery. Preserve the existing map
// implementation while supplying a bootstrap-only anonymous identity; all
// mutations still resolve authentication through Supabase inside their services.
export default function MapSurface() {
  const context = useAppContext();
  const publicContext = useMemo(() => {
    if (context.user) return context;
    return { ...context, user: { id: 'anonymous-map-bootstrap', isAnonymous: true } };
  }, [context]);
  return <AppContext.Provider value={publicContext}><MapSurfaceV3 /></AppContext.Provider>;
}
