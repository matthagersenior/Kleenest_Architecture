import BusinessIntelligencePage from './BusinessIntelligencePage.jsx';
import BusinessManagePage from './BusinessManagePage.jsx';
import EnterpriseCommandCenterPage from './EnterpriseCommandCenterPage.jsx';
import FleetOperationsPage from './FleetOperationsPage.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import CapabilityPanel, { MetricGrid, ActionForm } from './CapabilityPanel.jsx';
import { useAppContext } from '../AppContext.jsx';

/**
 * Compatibility exports for legacy route imports.
 *
 * The old implementation rendered generic CapabilityPanel/MetricGrid views for
 * Business, Fleet, and Enterprise. Those panels are retained only for the
 * genuinely administrative surface below. Product workspaces now terminate in
 * the migrated canonical runtime pages.
 */
export function BusinessPage({ section = 'overview' }) {
  if (section === 'intelligence') return <BusinessIntelligencePage />;
  return <BusinessManagePage />;
}

export function FleetPage() {
  return <FleetOperationsPage />;
}

export function EnterprisePage() {
  return <EnterpriseCommandCenterPage />;
}

export function ActivityPage() {
  const { services } = useAppContext();
  return (
    <WorkspaceShell workspace="consumer">
      <section className="page">
        <div className="page-header">
          <div><span className="eyebrow">ACTIVITY</span><h1>Activity</h1></div>
          <a className="secondary" href="/notifications">Open notifications</a>
        </div>
        <CapabilityPanel title="Notifications" load={() => services.notifications.list()} renderData={(data) => <MetricGrid items={data} />} />
        <CapabilityPanel title="Live network" load={() => services.live.list()} renderData={(data) => <MetricGrid items={data} />} />
      </section>
    </WorkspaceShell>
  );
}

export function PlayPage() {
  const { services } = useAppContext();
  return (
    <WorkspaceShell workspace="consumer">
      <section className="page">
        <div className="page-header"><div><span className="eyebrow">PLAY</span><h1>Play</h1></div><a className="primary" href="/rewards">Rewards</a></div>
        <CapabilityPanel title="Progression" load={() => services.progression.dashboard()} renderData={(data) => <MetricGrid items={data} />} />
        <CapabilityPanel title="Leaderboard" load={() => services.progression.platformLeaderboard('users:points', 25)} renderData={(data) => <MetricGrid items={data} />} />
        <CapabilityPanel title="Challenges" load={() => services.progression.challenges(25)} renderData={(data) => <MetricGrid items={data} />} />
      </section>
    </WorkspaceShell>
  );
}

export function CommunityPage() { return <EnterpriseCommandCenterPage />; }
export function FamilyPage() {
  const { services } = useAppContext();
  return (
    <WorkspaceShell workspace="consumer">
      <section className="page">
        <div className="page-header"><div><span className="eyebrow">FAMILY</span><h1>Family</h1></div></div>
        <CapabilityPanel title="Premium access" load={() => services.family.hasPremiumAccess()} renderData={(data) => <MetricGrid items={data} />} />
        <ActionForm title="Create family" submitLabel="Create family" fields={[{ name: 'name', label: 'Family name' }]} onSubmit={(value) => services.family.create(value.name)} />
        <ActionForm title="Invite family member" submitLabel="Send invite" fields={[{ name: 'familyId', label: 'Family ID' }, { name: 'email', label: 'Member email' }]} onSubmit={(value) => services.family.invite(value.familyId, value.email)} />
      </section>
    </WorkspaceShell>
  );
}

export function AdminPage() {
  const { services, profile } = useAppContext();
  return (
    <WorkspaceShell workspace="admin">
      <section className="page">
        <div className="page-header"><div><span className="eyebrow">OWNER / ADMIN</span><h1>Platform command</h1></div><a className="primary" href="/admin/maintenance">Maintenance</a></div>
        <CapabilityPanel title="System overview" load={() => services.admin.overview(profile)} renderData={(data) => <MetricGrid items={data} />} />
        <CapabilityPanel title="Data integrity" load={() => services.admin.integrity(profile)} renderData={(data) => <MetricGrid items={data} />} />
        <CapabilityPanel title="Pending businesses" load={() => services.admin.pendingBusinesses(profile)} renderData={(data) => <MetricGrid items={data} />} />
        <CapabilityPanel title="Reports" load={() => services.admin.reports(profile)} renderData={(data) => <MetricGrid items={data} />} />
        <ActionForm title="Search users" submitLabel="Search" fields={[{ name: 'query', label: 'Search query' }]} onSubmit={(value) => services.admin.searchUsers(profile, value.query)} />
      </section>
    </WorkspaceShell>
  );
}
