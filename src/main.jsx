import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppProvider } from './AppContext.jsx';
import RuntimeErrorBoundary from './runtime/RuntimeErrorBoundary.jsx';
import UniversalNetworkEventBridge from './runtime/UniversalNetworkEventBridge.jsx';
import CanonicalAppRuntime from './runtime/CanonicalAppRuntime.jsx';
import './styles.css';
import './tier-experience.css';
import './runtime/designSystem.css';
import './runtime/visualOverrides.css';
import './runtime/mobileWorkspaceFix.css';
import './runtime/role-crud.css';
import './runtime/detailPages.css';

// Keep the application bootstrap deterministic; map discovery is owned by MapSurfaceV3.
const root = document.getElementById('root');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HashRouter>
      <RuntimeErrorBoundary>
        <AppProvider>
          <UniversalNetworkEventBridge />
          <CanonicalAppRuntime />
        </AppProvider>
      </RuntimeErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);