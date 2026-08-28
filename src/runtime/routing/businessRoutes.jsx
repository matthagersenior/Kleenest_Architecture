import { Route } from 'react-router-dom';
import BusinessIntelligencePage from '../BusinessIntelligencePage.jsx';
import BusinessManagePage from '../BusinessManagePage.jsx';
import BusinessQrStudioPage from '../BusinessQrStudioPage.jsx';
import BusinessMapIdentityPage from '../BusinessMapIdentityPage.jsx';
import BusinessAssetLifecyclePage from '../BusinessAssetLifecyclePage.jsx';
import BusinessAnalyticsPage from '../BusinessAnalyticsPage.jsx';
import BusinessEngagementPage from '../BusinessEngagementPage.jsx';
import BusinessNotificationsPage from '../BusinessNotificationsPage.jsx';
import BusinessPartnershipsPage from '../BusinessPartnershipsPage.jsx';
import ReportingSettingsPage from '../ReportingSettingsPage.jsx';
import ReportingHistoryPage from '../ReportingHistoryPage.jsx';

export const businessRoutes = [
  <Route key="business" path="/business" element={<BusinessManagePage />} />,
  <Route key="business-dashboard" path="/business/dashboard" element={<BusinessAnalyticsPage />} />,
  <Route key="business-manage" path="/business/manage" element={<BusinessManagePage />} />,
  <Route key="business-map-identity" path="/business/map-identity" element={<BusinessMapIdentityPage />} />,
  <Route key="business-assets" path="/business/assets" element={<BusinessAssetLifecyclePage />} />,
  <Route key="business-qr" path="/business/qr" element={<BusinessQrStudioPage />} />,
  <Route key="business-qr-studio" path="/business/qr-studio" element={<BusinessQrStudioPage />} />,
  <Route key="business-promotions" path="/business/promotions" element={<BusinessManagePage />} />,
  <Route key="business-campaigns" path="/business/campaigns" element={<BusinessManagePage />} />,
  <Route key="business-events" path="/business/events" element={<BusinessManagePage />} />,
  <Route key="business-contests" path="/business/contests" element={<BusinessManagePage />} />,
  <Route key="business-customers" path="/business/customers" element={<BusinessAnalyticsPage />} />,
  <Route key="business-reviews" path="/business/reviews" element={<BusinessAnalyticsPage mode="reviews" />} />,
  <Route key="business-intelligence" path="/business/intelligence" element={<BusinessIntelligencePage />} />,
  <Route key="business-engage" path="/business/engage" element={<BusinessEngagementPage />} />,
  <Route key="business-notifications" path="/business/notifications" element={<BusinessNotificationsPage />} />,
  <Route key="business-partnerships" path="/business/partnerships" element={<BusinessPartnershipsPage />} />,
  <Route key="business-analytics" path="/business/analytics" element={<BusinessAnalyticsPage />} />,
  <Route key="business-performance" path="/business/performance" element={<BusinessAnalyticsPage />} />,
  <Route key="business-entitlements" path="/business/entitlements" element={<BusinessManagePage />} />,
  <Route key="business-reports" path="/business/reports" element={<ReportingSettingsPage />} />,
  <Route key="business-report-history" path="/business/reports/history" element={<ReportingHistoryPage />} />,
];
