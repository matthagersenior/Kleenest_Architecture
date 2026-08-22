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
import WorkspaceShell from './WorkspaceShell.jsx';
import CapabilityPanel, { MetricGrid, ActionForm } from './CapabilityPanel.jsx';
import { useAppContext } from '../AppContext.jsx';

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

export function AdminPage() {
  const { services, profile } = useAppContext();
  return <WorkspaceShell workspace="admin"><section className="page"><div className="page-header"><div><span className="eyebrow">OWNER / ADMIN</span><h1>Platform command</h1></div><a className="primary" href="/admin/maintenance">Maintenance</a></div><CapabilityPanel title="System overview" load={() => services.admin.overview(profile)} renderData={(data) => <MetricGrid items={data} />} /><CapabilityPanel title="Data integrity" load={() => services.admin.integrity(profile)} renderData={(data) => <MetricGrid items={data} />} /><CapabilityPanel title="Pending businesses" load={() => services.admin.pendingBusinesses(profile)} renderData={(data) => <MetricGrid items={data} />} /><CapabilityPanel title="Reports" load={() => services.admin.reports(profile)} renderData={(data) => <MetricGrid items={data} />} /><ActionForm title="Search users" submitLabel="Search" fields={[{ name: 'query', label: 'Search query' }]} onSubmit={(value) => services.admin.searchUsers(profile, value.query)} /></section></WorkspaceShell>;
}
