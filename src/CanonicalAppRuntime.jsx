import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './runtime/Home.jsx';
export default function CanonicalAppRuntime(){return <Routes><Route path="/" element={<Home/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>;}
