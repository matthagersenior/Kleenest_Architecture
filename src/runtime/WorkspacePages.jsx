import BusinessIntelligencePage from './BusinessIntelligencePage.jsx';
import BusinessAnalyticsPage from './BusinessAnalyticsPage.jsx';
import BusinessManagePage from './BusinessManagePage.jsx';
import EnterpriseCommandCenterPage from './EnterpriseCommandCenterPage.jsx';
import EnterpriseOperationsPage from './EnterpriseOperationsPage.jsx';
import FleetOperationsPage from './FleetOperationsPage.jsx';
import CommunitySurface from './CommunitySurface.jsx';
import ActivitySurface from './ActivitySurface.jsx';
import ProgressionPage from './ProgressionPage.jsx';
import FamilyPage from './FamilyPage.jsx';
import OwnerControlCenter from './OwnerControlCenter.jsx';

/** Compatibility exports for legacy imports. Product workspaces terminate in canonical migrated surfaces. */
export function BusinessPage({ section = 'overview' }) {
  if (section === 'intelligence') return <BusinessIntelligencePage />;
  if (section === 'reviews') return <BusinessAnalyticsPage mode="reviews" />;
  if (['analytics', 'performance'].includes(section)) return <BusinessAnalyticsPage />;
  if (section === 'engage') return <BusinessManagePage />;
  return <BusinessManagePage />;
}
export function FleetPage() { return <FleetOperationsPage />; }
export function EnterprisePage({ section = 'command' }) {
  if (section === 'partners') return <EnterpriseOperationsPage mode="partners" />;
  if (section === 'campaigns') return <EnterpriseOperationsPage mode="campaigns" />;
  if (section === 'performance') return <EnterpriseOperationsPage mode="performance" />;
  return <EnterpriseCommandCenterPage />;
}
export function ActivityPage() { return <ActivitySurface />; }
export function CommunityPage() { return <CommunitySurface />; }
export function PlayPage() { return <ProgressionPage />; }
export { FamilyPage };

/** Legacy Admin route now terminates in the real owner/admin control surface. */
export function AdminPage() { return <OwnerControlCenter />; }
