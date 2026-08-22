import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CanonicalAppRuntime from './CanonicalAppRuntime.jsx';
import { AppProvider } from './AppContext.jsx';
import RuntimeErrorBoundary from './runtime/RuntimeErrorBoundary.jsx';
import './styles.css';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter basename="/Kleenest_Architecture">
      <RuntimeErrorBoundary>
        <AppProvider>
          <CanonicalAppRuntime />
        </AppProvider>
      </RuntimeErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
