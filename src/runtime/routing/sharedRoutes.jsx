import { Navigate, Route } from 'react-router-dom';
import CapabilityHubPage from '../CapabilityHubPage.jsx';
import IntegrationHub from '../IntegrationHub.jsx';
import VisitSurface from '../VisitSurface.jsx';
import LocationDetailsPage from '../LocationDetailsPage.jsx';
import AuthPage from '../AuthPage.jsx';
import ProfilePage from '../ProfilePage.jsx';
import ProfilePreferencesPage from '../ProfilePreferencesPage.jsx';
import AccountLifecyclePage from '../AccountLifecyclePage.jsx';
import NotificationsPage from '../NotificationsPage.jsx';
import NotificationPreferencesPage from '../NotificationPreferencesPage.jsx';
import PushNotificationRegistration from '../PushNotificationRegistration.jsx';
import PricingPage from '../PricingPage.jsx';
import SupportPage from '../SupportPage.jsx';
import FeedbackPanel from '../FeedbackPanel.jsx';
import AboutPage from '../AboutPage.jsx';
import IntelligenceActionPanel from '../IntelligenceActionPanel.jsx';
import NetworkIntelligenceSurface from '../NetworkIntelligenceSurface.jsx';

export const sharedRoutes = [
  <Route key="capabilities" path="/capabilities" element={<CapabilityHubPage />} />,
  <Route key="integration" path="/integration" element={<IntegrationHub />} />,
  <Route key="interaction" path="/interaction" element={<VisitSurface />} />,
  <Route key="interactions" path="/interactions" element={<VisitSurface />} />,
  <Route key="visit" path="/visit" element={<VisitSurface />} />,
  <Route key="check-in" path="/check-in" element={<VisitSurface />} />,
  <Route key="check-in-location" path="/check-in/:locationId" element={<VisitSurface />} />,
  <Route key="place" path="/place/:id" element={<LocationDetailsPage />} />,
  <Route key="location" path="/location/:id" element={<LocationDetailsPage />} />,
  <Route key="auth" path="/auth" element={<AuthPage />} />,
  <Route key="profile" path="/profile" element={<ProfilePage />} />,
  <Route key="profile-preferences" path="/profile/preferences" element={<ProfilePreferencesPage />} />,
  <Route key="account-lifecycle" path="/account/lifecycle" element={<AccountLifecyclePage />} />,
  <Route key="notifications" path="/notifications" element={<NotificationsPage />} />,
  <Route key="notification-preferences" path="/notifications/preferences" element={<NotificationPreferencesPage />} />,
  <Route key="notification-push" path="/notifications/push" element={<PushNotificationRegistration />} />,
  <Route key="pricing" path="/pricing" element={<PricingPage />} />,
  <Route key="support" path="/support" element={<SupportPage />} />,
  <Route key="feedback" path="/feedback" element={<FeedbackPanel />} />,
  <Route key="about" path="/about" element={<AboutPage />} />,
  <Route key="intelligence" path="/intelligence" element={<NetworkIntelligenceSurface />} />,
  <Route key="enterprise-intelligence" path="/enterprise/intelligence" element={<NetworkIntelligenceSurface />} />,
  <Route key="intelligence-actions" path="/intelligence/actions" element={<IntelligenceActionPanel />} />,
  <Route key="intelligence-action" path="/intelligence/actions/:actionId" element={<IntelligenceActionPanel />} />,
];

export const fallbackRoute = <Route key="fallback" path="*" element={<Navigate to="/" replace />} />;
