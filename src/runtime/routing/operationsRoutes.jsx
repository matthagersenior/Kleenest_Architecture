import { Route } from 'react-router-dom';
import FleetOperationsPage from '../FleetOperationsPage.jsx';
import FleetRoutesPage from '../FleetRoutesPage.jsx';
import FleetPerformancePage from '../FleetPerformancePage.jsx';
import FleetIntelligenceSurface from '../FleetIntelligenceSurface.jsx';
import EnterpriseCommandCenterPage from '../EnterpriseCommandCenterPage.jsx';
import EnterpriseOperationsPage from '../EnterpriseOperationsPage.jsx';
import EnterpriseLifecyclePanel from '../EnterpriseLifecyclePanel.jsx';
import NetworkIntelligenceSurface from '../NetworkIntelligenceSurface.jsx';
import ReportingSettingsPage from '../ReportingSettingsPage.jsx';
import ReportingHistoryPage from '../ReportingHistoryPage.jsx';

export const operationsRoutes = [
  <Route key="fleet" path="/fleet" element={<FleetOperationsPage />} />,
  <Route key="fleet-routes" path="/fleet/routes" element={<FleetRoutesPage />} />,
  <Route key="fleet-performance" path="/fleet/performance" element={<FleetPerformancePage />} />,
  <Route key="fleet-opportunities" path="/fleet/opportunities" element={<FleetOperationsPage />} />,
  <Route key="fleet-goals" path="/fleet/goals" element={<FleetPerformancePage />} />,
  <Route key="fleet-intelligence" path="/fleet/intelligence" element={<FleetIntelligenceSurface />} />,
  <Route key="fleet-reports" path="/fleet/reports" element={<ReportingSettingsPage />} />,
  <Route key="fleet-report-history" path="/fleet/reports/history" element={<ReportingHistoryPage />} />,
  <Route key="enterprise" path="/enterprise" element={<EnterpriseCommandCenterPage />} />,
  <Route key="enterprise-partners" path="/enterprise/partners" element={<EnterpriseOperationsPage mode="partners" />} />,
  <Route key="enterprise-campaigns" path="/enterprise/campaigns" element={<EnterpriseOperationsPage mode="campaigns" />} />,
  <Route key="enterprise-performance" path="/enterprise/performance" element={<EnterpriseOperationsPage mode="performance" />} />,
  <Route key="enterprise-lifecycle" path="/enterprise/lifecycle" element={<EnterpriseLifecyclePanel />} />,
  <Route key="enterprise-fleet" path="/enterprise/fleet" element={<FleetOperationsPage />} />,
  <Route key="enterprise-reports" path="/enterprise/reports" element={<ReportingSettingsPage />} />,
  <Route key="enterprise-report-history" path="/enterprise/reports/history" element={<ReportingHistoryPage />} />,
  <Route key="enterprise-network-intelligence" path="/enterprise/network-intelligence" element={<NetworkIntelligenceSurface />} />,
];
