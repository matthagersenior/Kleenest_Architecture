import { Link } from 'react-router-dom';
import { BadgeDollarSign, Building2, Car, CheckCircle2, Compass, Crown, ShieldCheck, Users, Workflow, ArrowRight, Eye } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { PRODUCT_TIERS, capabilityState } from '../architecture/productModel.js';
import WorkspaceShell from './WorkspaceShell.jsx';

const ICONS = { free: Compass, premium: Crown, family: Users, fleet: Car, enterprise: ShieldCheck, standard: Building2, growth: Workflow };
const HEADLINES = {
  free: 'Complete consumer product', premium: 'Complete consumer product · ad-free', family: 'Household participation', fleet: 'Fleet operations', enterprise: 'Network operations', standard: 'Core business operations', growth: 'Growth & engagement',
};
const DESCRIPTIONS = {
  free: 'Discovery, maps, check-ins, reviews, evidence, quests, rewards, games, community, and challenges.',
  premium: 'Same complete consumer product and capabilities, with advertising removed.',
  family: 'Shared discovery, household participation, and safer social progression.',
  fleet: 'Consumer account with Fleet workspace access and operational capabilities.',
  enterprise: 'Consumer account with Enterprise and Fleet workspace access.',
  standard: 'Locations, QR acquisition, campaigns, events, customer signals, and core analytics.',
  growth: 'Expanded business engagement, intelligence, campaigns, events, and analytics.',
};
const DETAILS = {
  free: 'Ad-supported access to the full consumer capability set.', premium: 'Nothing is taken away when upgrading; the ad layer disappears.', family: 'Full consumer capabilities remain available.', fleet: 'Fleet workspace access is derived from the canonical product tier.', enterprise: 'Enterprise membership includes Fleet and Enterprise workspace access.', standard: 'Base business membership; Fleet and Enterprise capabilities remain locked.', growth: 'Growth membership; Fleet remains the explicit upgrade path.',
};

function buildTiers() {
  return Object.entries(PRODUCT_TIERS).flatMap(([family, familyTiers]) => Object.entries(familyTiers).map(([key, tier]) => ({
    ...tier,
    key,
    family,
    previewKey: tier.id.replace(/^user_/, '').replace(/^business_/, 'business_'),
    Icon: ICONS[key] || Building2,
    headline: HEADLINES[key] || tier.label,
    description: DESCRIPTIONS[key] || `${tier.label} capabilities from the canonical product model.`,
    detail: DETAILS[key] || `${tier.label} exposes ${tier.workspaces.length} workspace${tier.workspaces.length === 1 ? '' : 's'} through the canonical entitlement model.`,
  })));
}

const tiers = buildTiers();
const groups = [
  ['CONSUMER MEMBERSHIP', 'Test the customer-facing membership ladder.', tiers.filter(t => t.family === 'user' && t.key !== 'fleet' && t.key !== 'enterprise')],
  ['OPERATING ACCESS', 'Test Fleet and Enterprise operating identities.', tiers.filter(t => t.family === 'user' && ['fleet', 'enterprise'].includes(t.key))],
  ['BUSINESS MEMBERSHIP', 'Test the commercial operating tiers.', tiers.filter(t => t.family === 'business')],
];

export default function OwnerTierPreview() {
  const { isPlatformOwner, membershipTier, profile } = useAppContext();
  return <WorkspaceShell workspace="owner"><main className="page">
    <div className="page-header"><div><span className="eyebrow">OWNER PRODUCT LAB · MEMBERSHIP</span><h1>Membership Experience Lab</h1><p>Test the real application as every canonical consumer, Fleet, Enterprise, and Business tier. Preview mode changes presentation only; it never mutates your authenticated account.</p></div><BadgeDollarSign size={34}/></div>
    <section className="detail-panel" style={{ marginBottom: 18 }}><div className="panel-heading"><div><span className="eyebrow">HOW TO USE THE LAB</span><h2>Preview the product, not a mockup</h2></div><Eye size={24}/></div><div className="dashboard-grid"><div><strong>1. Choose a tier</strong><p className="form-note">Open the actual application with that canonical membership context.</p></div><div><strong>2. Inspect the workspace</strong><p className="form-note">Verify navigation, capabilities, locked surfaces, and tier presentation.</p></div><div><strong>3. Return to the lab</strong><p className="form-note">Use the owner navigation to compare another tier without changing your account.</p></div><div><strong>4. Record gaps</strong><p className="form-note">Use the lab as the acceptance surface for membership UX and entitlement QA.</p></div></div></section>
    {groups.map(([heading, description, group]) => <section className="detail-panel" key={heading} style={{ marginBottom: 18 }}><div className="panel-heading"><div><span className="eyebrow">{heading}</span><h2>{description}</h2></div></div><div className="dashboard-grid">{group.map(tier => { const Icon = tier.Icon; const enabled = tier.capabilities.length; const locked = tier.lockedCapabilities.length; const preview = tier.id; return <article className="result-card" key={tier.id}><div className="panel-heading"><div><span className="eyebrow">{tier.id.replaceAll('_', ' ')}</span><h3>{tier.label}</h3></div><Icon size={22}/></div><strong>{tier.headline}</strong><p>{tier.description}</p><p className="form-note">{tier.detail}</p><div className="reward-stats"><div className="reward-stat"><strong>{tier.workspaces.length}</strong><span>workspaces</span></div><div className="reward-stat"><strong>{enabled}</strong><span>enabled</span></div><div className="reward-stat"><strong>{locked}</strong><span>locked</span></div><div className="reward-stat"><strong>{tier.ads ? 'On' : 'Off'}</strong><span>ads</span></div></div><div className="hero-actions"><Link className="button primary" to={`/?preview=${encodeURIComponent(preview)}`}><Eye size={15}/>Preview experience <ArrowRight size={15}/></Link><Link className="button secondary" to={`/capabilities?preview=${encodeURIComponent(preview)}`}>Capabilities</Link></div></article>; })}</div></section>)}
    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CANONICAL MODEL</span><h2>Tier entitlement verification</h2></div><CheckCircle2 size={22}/></div><div className="dashboard-grid">{tiers.map(tier => { const states = tier.capabilities.map(capability => capabilityState(tier, capability)); return <div className="result-card" key={`verify-${tier.id}`}><strong>{tier.label}</strong><p>{tier.workspaces.join(' · ')}</p><p className="form-note">{states.filter(s => s === 'enabled').length} enabled capability states · {tier.lockedCapabilities.length} explicit locks.</p></div>; })}</div></section>
    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PREVIEW SAFETY</span><h2>Authenticated identity stays unchanged</h2></div><ShieldCheck size={22}/></div><p><strong>{profile?.display_name || profile?.username || 'Your profile'}</strong> remains the authenticated identity while you preview every tier.</p><p className="form-note">Current membership: {membershipTier || 'unknown'} · Preview presentation does not change profile, role, membership, entitlement, or billing state.</p><div className="hero-actions"><Link className="button secondary" to="/pricing">Membership & pricing</Link><Link className="button secondary" to="/capabilities">Capability Hub</Link><Link className="button secondary" to="/owner">Owner Command Center</Link></div></section>
    {!isPlatformOwner && <div className="state error">Owner access required.</div>}
  </main></WorkspaceShell>;
}
