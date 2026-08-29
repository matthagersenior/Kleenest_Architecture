import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './AppContext.jsx';
import RuntimeErrorBoundary from './runtime/RuntimeErrorBoundary.jsx';
import UniversalNetworkEventBridge from './runtime/UniversalNetworkEventBridge.jsx';
import CanonicalAppRuntime from './runtime/CanonicalAppRuntime.jsx';
import ScrollToTop from './runtime/ScrollToTop.jsx';
import './styles.css';
import './tier-experience.css';
import './runtime/designSystem.css';
import './runtime/visualOverrides.css';
import './runtime/mobileWorkspaceFix.css';
import './runtime/role-crud.css';
import './runtime/detailPages.css';
import './runtime/productionSurfaceFixes.css';

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter basename="/Kleenest_Architecture">
      <RuntimeErrorBoundary>
        <AppProvider>
          <ScrollToTop />
          <UniversalNetworkEventBridge />
          <CanonicalAppRuntime />
        </AppProvider>
      </RuntimeErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);