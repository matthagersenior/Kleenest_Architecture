import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import CanonicalAppRuntime from './CanonicalAppRuntime.jsx';
import { AppProvider } from './AppContext.jsx';
import RuntimeErrorBoundary from './runtime/RuntimeErrorBoundary.jsx';
import UniversalDiscoveryBootstrap from './runtime/UniversalDiscoveryBootstrap.jsx';
import UniversalNetworkEventBridge from './runtime/UniversalNetworkEventBridge.jsx';
import './styles.css';
import './tier-experience.css';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HashRouter>
      <RuntimeErrorBoundary>
        <AppProvider>
          <UniversalDiscoveryBootstrap />
          <UniversalNetworkEventBridge />
          <CanonicalAppRuntime />
        </AppProvider>
      </RuntimeErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);
