import { Navigate, Route } from 'react-router-dom';
import { useAppContext } from '../../AppContext.jsx';
import { isPlatformOwner } from '../../domains/entitlements/access.js';
import OwnerControlCenter from '../OwnerControlCenter.jsx';
import OwnerCrudWorkbench from '../OwnerCrudWorkbench.jsx';
import OwnerTierPreview from '../OwnerTierPreview.jsx';
import OwnerAuditPage from '../OwnerAuditPage.jsx';
import AdminMaintenancePage from '../AdminMaintenancePage.jsx';
import CapabilityHubPage from '../CapabilityHubPage.jsx';
import OperationalCapabilityPage from '../OperationalCapabilityPage.jsx';
import NetworkIntelligenceSurface from '../NetworkIntelligenceSurface.jsx';
import OwnerIntelligenceLab from '../OwnerIntelligenceLab.jsx';
import ReportingSettingsPage from '../ReportingSettingsPage.jsx';
import ReportingHistoryPage from '../ReportingHistoryPage.jsx';

function OwnerRoute({ children }) {
  const { profile, loading, isPlatformOwner: contextOwner } = useAppContext();
  if (loading) return null;
  return (contextOwner || isPlatformOwner(profile)) ? children : <Navigate to="/" replace />;
}

export const ownerRoutes = [
  <Route key="admin" path="/admin" element={<OwnerRoute><OwnerControlCenter /></OwnerRoute>} />,
  <Route key="admin-capabilities" path="/admin/capabilities" element={<OwnerRoute><CapabilityHubPage /></OwnerRoute>} />,
  <Route key="admin-maintenance" path="/admin/maintenance" element={<OwnerRoute><AdminMaintenancePage /></OwnerRoute>} />,
  <Route key="admin-crud" path="/admin/crud" element={<OwnerRoute><OwnerCrudWorkbench /></OwnerRoute>} />,
  <Route key="admin-operational-capabilities" path="/admin/operational-capabilities" element={<OwnerRoute><OperationalCapabilityPage /></OwnerRoute>} />,
  <Route key="admin-intelligence" path="/admin/intelligence" element={<OwnerRoute><NetworkIntelligenceSurface /></OwnerRoute>} />,
  <Route key="admin-reports" path="/admin/reports" element={<OwnerRoute><ReportingSettingsPage /></OwnerRoute>} />,
  <Route key="admin-report-history" path="/admin/reports/history" element={<OwnerRoute><ReportingHistoryPage /></OwnerRoute>} />,
  <Route key="owner" path="/owner" element={<OwnerRoute><OwnerControlCenter /></OwnerRoute>} />,
  <Route key="owner-data" path="/owner/data" element={<OwnerRoute><OwnerCrudWorkbench /></OwnerRoute>} />,
  <Route key="owner-preview" path="/owner/preview" element={<OwnerRoute><OwnerTierPreview /></OwnerRoute>} />,
  <Route key="owner-audit" path="/owner/audit" element={<OwnerRoute><OwnerAuditPage /></OwnerRoute>} />,
  <Route key="owner-operational-capabilities" path="/owner/operational-capabilities" element={<OwnerRoute><OperationalCapabilityPage /></OwnerRoute>} />,
  <Route key="owner-intelligence" path="/owner/intelligence" element={<OwnerRoute><OwnerIntelligenceLab /></OwnerRoute>} />,
  <Route key="owner-reports" path="/owner/reports" element={<OwnerRoute><ReportingSettingsPage /></OwnerRoute>} />,
  <Route key="owner-report-history" path="/owner/reports/history" element={<OwnerRoute><ReportingHistoryPage /></OwnerRoute>} />,
];
