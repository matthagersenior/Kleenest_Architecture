import { useLocation } from 'react-router-dom';
import CanonicalAppRuntime from './CanonicalAppRuntime.jsx';
import MapSurfaceV2 from './MapSurfaceV2.jsx';

export default function MapRouteOverride(){
  const { pathname } = useLocation();
  if(pathname==='/map'||pathname==='/discover') return <MapSurfaceV2/>;
  return <CanonicalAppRuntime/>;
}
