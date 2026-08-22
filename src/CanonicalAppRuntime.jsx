import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './runtime/Home.jsx';
import MapSurface from './runtime/MapSurface.jsx';
import RouteSurface from './runtime/RouteSurface.jsx';
export default function CanonicalAppRuntime() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/map" element={<MapSurface />} /><Route path="/route" element={<RouteSurface />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
