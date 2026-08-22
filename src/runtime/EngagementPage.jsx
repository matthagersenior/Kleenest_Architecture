import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import CapabilityPanel, { MetricGrid, ActionForm } from './CapabilityPanel.jsx';

export default function EngagementPage() {
  const { services } = useAppContext();
  return <WorkspaceShell><section className="page-heading"><span className="eyebrow">Kleenest</span><h1>Engage</h1><p>Save places, discover events and contests, and redeem offers.</p></section>
    <CapabilityPanel title="Active events" load={() => services.engagement.events.active(10)} renderData={data => <MetricGrid items={data} />} />
    <CapabilityPanel title="Active contests" load={() => services.engagement.contests.active(10)} renderData={data => <MetricGrid items={data} />} />
    <ActionForm title="Preferred location" submitLabel="Check eligibility" fields={[{name:'locationId',label:'Location ID'}]} onSubmit={v => services.engagement.preferred.eligibility(v.locationId)} />
    <ActionForm title="Activate preferred location" submitLabel="Activate" fields={[{name:'locationId',label:'Location ID'}]} onSubmit={v => services.engagement.preferred.activate(v.locationId)} />
    <ActionForm title="Deactivate preferred location" submitLabel="Deactivate" fields={[{name:'locationId',label:'Location ID'}]} onSubmit={v => services.engagement.preferred.deactivate(v.locationId)} />
    <ActionForm title="Record preferred-location use" submitLabel="Record use" fields={[{name:'locationId',label:'Location ID'}]} onSubmit={v => services.engagement.preferred.use(v.locationId)} />
    <ActionForm title="Redeem promotion" submitLabel="Redeem" fields={[{name:'promotionId',label:'Promotion ID'},{name:'locationId',label:'Location ID'}]} onSubmit={v => services.engagement.promotions.redeem(v.promotionId,v.locationId)} />
    <ActionForm title="Join contest" submitLabel="Join" fields={[{name:'contestId',label:'Contest ID'}]} onSubmit={v => services.engagement.contests.join(v.contestId)} />
    <ActionForm title="Submit contest entry" submitLabel="Submit entry" fields={[{name:'contestId',label:'Contest ID'},{name:'entry',label:'Entry JSON',type:'textarea',rows:6}]} onSubmit={v => { let entry; try { entry = JSON.parse(v.entry || '{}'); } catch { throw new Error('Entry must be valid JSON.'); } return services.engagement.contests.submitEntry(v.contestId, entry); }} />
  </WorkspaceShell>;
}
