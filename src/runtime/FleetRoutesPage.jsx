import { Route as RouteIcon } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import FleetRouteCrudPanel from './FleetRouteCrudPanel.jsx';

export default function FleetRoutesPage() {
  const { selectedBusinessId, selectedBusiness, isPlatformOwner } = useAppContext();
  const businessId = selectedBusinessId || selectedBusiness?.business_id || selectedBusiness?.id || '';

  if (!businessId) {
    return (
      <WorkspaceShell workspace="fleet">
        <section className="empty-state">
          <RouteIcon size={36} />
          <h2>No Fleet business selected</h2>
          <p>{isPlatformOwner ? 'Select an owner/demo Fleet business to manage routes.' : 'A Fleet business membership is required to manage routes.'}</p>
        </section>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell workspace="fleet">
      <section className="page business-page">
        <section className="page-header">
          <div>
            <span className="eyebrow">FLEET · ROUTE DISPATCH</span>
            <h1>Routes</h1>
            <p>Create and manage operational routes, assign drivers and vehicles, schedule work, and control route status from one workspace.</p>
          </div>
        </section>
        <FleetRouteCrudPanel businessId={businessId} />
      </section>
    </WorkspaceShell>
  );
}
