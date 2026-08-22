import { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import CapabilityPanel, { MetricGrid, ActionForm } from './CapabilityPanel.jsx';

function businessIdFrom(data) { const first = Array.isArray(data) ? data[0] : data?.businesses?.[0] || data?.data?.[0]; return first?.business_id || first?.id || null; }
function Page({ workspace, title, children }) { return <WorkspaceShell workspace={workspace}><section className="page-heading"><span className="eyebrow">Kleenest</span><h1>{title}</h1></section>{children}</WorkspaceShell>; }

export function ActivityPage() { const { services } = useAppContext(); return <Page title="Activity"><CapabilityPanel title="Your activity" description="Notifications and live events from the canonical user experience." load={() => services.notifications.list()} renderData={data => <MetricGrid items={data} />} /></Page>; }
export function PlayPage() { const { services } = useAppContext(); return <Page title="Play"><CapabilityPanel title="Progression activity" description="Your live contribution and reward activity." load={() => services.analytics.list({ limit: 20 })} renderData={data => <MetricGrid items={data} />} /><CapabilityPanel title="Recent check-in activity" description="Verified place activity from the canonical check-in system." load={() => services.live.list({ types: ['user.qr_check_in', 'user.arrived'] })} renderData={data => <MetricGrid items={data} />} /></Page>; }
export function CommunityPage() { const { services } = useAppContext(); return <Page title="Community"><CapabilityPanel title="Live community activity" load={() => services.live.list()} renderData={data => <MetricGrid items={data} />} /></Page>; }

export function BusinessPage({ section = 'overview' }) {
  const { services } = useAppContext(); const [businesses, setBusinesses] = useState(null); const [refresh, setRefresh] = useState(0);
  useEffect(() => { void services.business.listBusinesses().then(setBusinesses).catch(() => setBusinesses([])); }, [services, refresh]);
  const id = businessIdFrom(businesses); const title = section === 'intelligence' ? 'Business Intelligence' : section === 'engage' ? 'Engage' : section === 'analytics' ? 'Business Analytics' : 'Business Overview';
  const load = async () => { if (section === 'overview') return services.business.listBusinesses(); if (!id) return []; if (section === 'intelligence') return services.business.locationIntelligence(id); if (section === 'engage') return Promise.all([services.business.listCampaigns(id), services.business.listPromotions(id), services.business.listEvents(id), services.business.listContests(id)]); return Promise.all([services.business.analytics(id), services.business.reviewAnalytics(id)]); };
  return <Page workspace="business" title={title}>
    <CapabilityPanel title={title} description="Live data and authorized operations from the canonical Business service." load={load} renderData={data => <MetricGrid items={data} />} />
    {id && section === 'engage' && <ActionForm title="Create campaign" submitLabel="Create campaign" fields={[{ name: 'name', label: 'Campaign name' }, { name: 'goal', label: 'Goal', required: false }, { name: 'type', label: 'Type', defaultValue: 'general', required: false }]} onSubmit={async values => { await services.business.createCampaign(id, values); setRefresh(v => v + 1); }} />}
    {id && section === 'overview' && <CapabilityPanel title="Business locations" description="Manage the locations represented by this business." load={() => services.business.listLocations(id)} renderData={data => <MetricGrid items={data} />} />}
  </Page>;
}

export function FleetPage({ section = 'operations' }) {
  const { services } = useAppContext(); const [businesses, setBusinesses] = useState(null); const [refresh, setRefresh] = useState(0); const [selected, setSelected] = useState(null);
  useEffect(() => { void services.business.listBusinesses().then(setBusinesses).catch(() => setBusinesses([])); }, [services, refresh]);
  const id = businessIdFrom(businesses); const title = ({ performance: 'Performance', opportunities: 'Opportunities', goals: 'Goals', routes: 'Routes' })[section] || 'Fleet Operations';
  const load = async () => { if (!id) return []; if (section === 'opportunities') return services.fleet.opportunities(id); return services.fleet.dashboard(id); };
  return <Page workspace="fleet" title={title}>
    <CapabilityPanel title={title} description="Fleet data and authorized operational actions." load={load} renderData={data => <MetricGrid items={data} />} />
    {id && section === 'operations' && <ActionForm title="Resolve fleet alert" submitLabel="Resolve alert" fields={[{ name: 'alertId', label: 'Alert ID' }, { name: 'resolution', label: 'Resolution' }]} onSubmit={async values => { await services.fleet.resolveAlert(id, values.alertId, values.resolution); setRefresh(v => v + 1); }} />}
    {id && section === 'operations' && <ActionForm title="Update vehicle status" submitLabel="Update vehicle" fields={[{ name: 'vehicleId', label: 'Vehicle ID' }, { name: 'status', label: 'Status' }]} onSubmit={async values => { await services.fleet.vehicleStatus(id, values.vehicleId, values.status); setRefresh(v => v + 1); }} />}
    {id && section === 'routes' && <ActionForm title="Update route status" submitLabel="Update route" fields={[{ name: 'routeId', label: 'Route ID' }, { name: 'status', label: 'Status' }]} onSubmit={async values => { await services.fleet.routeStatus(id, values.routeId, values.status); setRefresh(v => v + 1); }} />}
  </Page>;
}

export function EnterprisePage({ section = 'command' }) {
  const { services } = useAppContext(); const [refresh, setRefresh] = useState(0); const title = section === 'partners' ? 'Partners' : section === 'campaigns' ? 'Campaigns' : section === 'performance' ? 'Performance' : section === 'fleet' ? 'Fleet' : 'Enterprise Command';
  return <Page workspace="enterprise" title={title}>
    <CapabilityPanel title="Partner network" description="Existing partner-program capabilities exposed through the canonical service." load={() => services.partners.list()} renderData={data => <MetricGrid items={data} />} />
    {section === 'partners' && <ActionForm title="Join partner program" submitLabel="Join program" fields={[{ name: 'programId', label: 'Program ID' }]} onSubmit={async values => { await services.partners.join(values.programId); setRefresh(v => v + 1); }} />}
    {section === 'partners' && <CapabilityPanel title="My memberships" description="Partner memberships available to the current enterprise identity." load={() => services.partners.memberships()} renderData={data => <MetricGrid items={data} />} />}
    {section !== 'partners' && <CapabilityPanel title={title} description="Enterprise capability data from the canonical partner boundary." load={() => services.partners.list()} renderData={data => <MetricGrid items={data} />} />}
  </Page>;
}