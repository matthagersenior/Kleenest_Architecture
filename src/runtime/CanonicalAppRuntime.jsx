import { Navigate, Route, Routes } from 'react-router-dom';
import { consumerRoutes } from './routing/consumerRoutes.jsx';
import { sharedRoutes } from './routing/sharedRoutes.jsx';
import { businessRoutes } from './routing/businessRoutes.jsx';
import { operationsRoutes } from './routing/operationsRoutes.jsx';
import { ownerRoutes } from './routing/ownerRoutes.jsx';

/**
 * Application routing composition only.
 * Route ownership, guards and page implementations live in domain route modules.
 * Keep this file intentionally boring: adding a domain route should not require
 * editing the application runtime's implementation logic.
 */
export default function CanonicalAppRuntime() {
  return (
    <Routes>
      {consumerRoutes}
      {sharedRoutes}
      {businessRoutes}
      {operationsRoutes}
      {ownerRoutes}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
