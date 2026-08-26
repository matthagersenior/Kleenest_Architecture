import { useLocation } from 'react-router-dom';
import CanonicalAppRuntime from './CanonicalAppRuntime.jsx';
import MapSurfaceV3 from './MapSurfaceV3.jsx';

export default function MapRouteOverride(){
  const { pathname } = useLocation();
  if(pathname==='/map'||pathname==='/discover') return <MapSurfaceV3/>;
  return <CanonicalAppRuntime/>;
}
