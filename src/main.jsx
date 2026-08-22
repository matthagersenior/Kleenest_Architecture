import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CanonicalAppRuntime from './CanonicalAppRuntime.jsx';
import { AppProvider } from './AppContext.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <CanonicalAppRuntime />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
