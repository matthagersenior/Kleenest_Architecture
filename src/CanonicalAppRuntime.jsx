import { Navigate, Route, Routes } from 'react-router-dom';
export default function CanonicalAppRuntime() { return <Routes><Route path="*" element={<Navigate to="/" replace />} /></Routes>; }
