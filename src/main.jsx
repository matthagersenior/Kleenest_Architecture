import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CanonicalAppRuntime from './CanonicalAppRuntime.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CanonicalAppRuntime />
    </BrowserRouter>
  </React.StrictMode>
);
