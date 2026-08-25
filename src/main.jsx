import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import MapRouteOverride from './runtime/MapRouteOverride.jsx';
import { AppProvider } from './AppContext.jsx';
import RuntimeErrorBoundary from './runtime/RuntimeErrorBoundary.jsx';
import UniversalDiscoveryBootstrap from './runtime/UniversalDiscoveryBootstrap.jsx';
import UniversalNetworkEventBridge from './runtime/UniversalNetworkEventBridge.jsx';
import './styles.css';
import './tier-experience.css';
import './runtime/designSystem.css';
import './runtime/visualOverrides.css';

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HashRouter>
      <RuntimeErrorBoundary>
        <AppProvider>
          <UniversalDiscoveryBootstrap />
          <UniversalNetworkEventBridge />
          <MapRouteOverride />
        </AppProvider>
      </RuntimeErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);
