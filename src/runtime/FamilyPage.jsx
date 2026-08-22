import { useState } from 'react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import CapabilityPanel, { ActionForm, MetricGrid } from './CapabilityPanel.jsx';

export default function FamilyPage() {
  const { services } = useAppContext();
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh(value => value + 1);
  return <WorkspaceShell workspace="family">
    <section className="page-heading"><span className="eyebrow">Kleenest Family</span><h1>Family</h1></section>
    <CapabilityPanel key={`access-${refresh}`} title="Family access" description="Manage family access using the canonical Supabase family contract." load={() => services.family.hasPremiumAccess()} renderData={data => <MetricGrid items={[{ premiumAccess: data }]} />} />
    <ActionForm title="Create family group" submitLabel="Create family" fields={[{ name: 'name', label: 'Family name' }]} onSubmit={async values => { const result = await services.family.createGroup(values.name); bump(); return result; }} />
    <ActionForm title="Invite family member" submitLabel="Send invite" fields={[{ name: 'email', label: 'Member email' }]} onSubmit={async values => { const result = await services.family.inviteMember(values.email); bump(); return result; }} />
    <ActionForm title="Accept pending invite" submitLabel="Accept invite" fields={[]} onSubmit={async () => { const result = await services.family.acceptInvite(); bump(); return result; }} />
  </WorkspaceShell>;
}
