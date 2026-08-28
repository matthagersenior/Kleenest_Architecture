import { Link } from 'react-router-dom';
import { BadgeDollarSign, Building2, Car, CheckCircle2, Compass, Crown, Eye, ShieldCheck, Users, Workflow } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import { PRODUCT_TIERS, capabilityState } from '../architecture/productModel.js';
import WorkspaceShell from './WorkspaceShell.jsx';

const ICONS = { free: Compass, premium: Crown, family: Users, fleet: Car, enterprise: ShieldCheck, standard: Building2, growth: Workflow };
const CANONICAL_PREVIEW_KEYS = { user_free: 'free', user_premium: 'premium', user_family: 'family', user_fleet: 'fleet', user_enterprise: 'enterprise', business_standard: 'business_standard', business_growth: 'business_growth', business_fleet: 'business_fleet', business_enterprise: 'business_enterprise' };
const PRESENTATION = {
  free: { headline: 'Complete consumer product', description: 'Discovery, maps, check-ins, reviews, evidence, quests, rewards, games, community, and challenges.', detail: 'Ad-supported access to the full consumer capability set.' },
  premium: { headline: 'Complete consumer product · ad-free', description: 'Same complete consumer product and capabilities, with advertising removed.', detail: 'Nothing is taken away when upgrading; the ad layer disappears.' },
  family: { headline: 'Household participation', description: 'Shared discovery, household participation, and safer social progression.', detail: 'Full consumer capabilities remain available.' },
  fleet: { headline: 'Fleet operations', description: 'Consumer account with Fleet workspace access and operational capabilities.', detail: 'Fleet workspace access is derived from the canonical product tier.' },
  enterprise: { headline: 'Network operations', description: 'Consumer account with Enterprise and Fleet workspace access.', detail: 'Enterprise membership includes Fleet and Enterprise workspace access.' },
  standard: { headline: 'Core business operations', description: 'Locations, QR acquisition, campaigns, events, customer signals, and core analytics.', detail: 'Base business membership; Fleet and Enterprise capabilities remain locked.' },
  growth: { headline: 'Growth & engagement', description: 'Expanded business engagement, intelligence, campaigns, events, and analytics.', detail: 'Growth membership; Fleet remains the explicit upgrade path.' },
};

function buildTiers() {
  return Object.entries(PRODUCT_TIERS).flatMap(([family, familyTiers]) => Object.entries(familyTiers).map(([key, tier]) => ({
    ...tier,
    key,
    family,
    previewKey: CANONICAL_PREVIEW_KEYS[tier.id] || tier.id.replace(/^user_/, ''),
    Icon: ICONS[key] || Building2,
    ...(PRESENTATION[key] || { headline: tier.label, description: `${tier.label} capabilities from the canonical product model.`, detail: `${tier.label} exposes ${tier.workspaces.length} workspace${tier.workspaces.length === 1 ? '' : 's'} through the canonical entitlement model.` }),
  })));
}

const groups = [
  ['CONSUMER MEMBERSHIP', 'Test the customer-facing membership ladder.', (tiers) => tiers.filter((tier) => tier.family === 'user' && !['fleet', 'enterprise'].includes(tier.key))],
  ['OPERATING ACCESS', 'Test Fleet and Enterprise operating identities.', (tiers) => tiers.filter((tier) => tier.family === 'user' && ['fleet', 'enterprise'].includes(tier.key))],
  ['BUSINESS MEMBERSHIP', 'Test the commercial operating tiers.', (tiers) => tiers.filter((tier) => tier.family === 'business')],
];
const tiers = buildTiers();

const previewHref = (tier, workspace) => `/?preview=${encodeURIComponent(tier.previewKey)}&workspace=${encodeURIComponent(workspace)}`;

function LabInstructions() {
  return <section className="detail-panel" style={{ marginBottom: 18 }}><div className="panel-heading"><div><span className="eyebrow">HOW TO USE THE LAB</span><h2>Preview the product, not a mockup</h2></div><Eye size={24} /></div><div className="dashboard-grid"><div><strong>1. Choose a tier</strong><p className="form-note">Open the actual application with that canonical membership context.</p></div><div><strong>2. Inspect the workspace</strong><p className="form-note">Verify navigation, capabilities, locked surfaces, and tier presentation.</p></div><div><strong>3. Return to the lab</strong><p className="form-note">Use the owner navigation to compare another tier without changing your account.</p></div><div><strong>4. Record gaps</strong><p className="form-note">Use the lab as the acceptance surface for membership UX and entitlement QA.</p></div></div></section>;
}

function TierCard({ tier }) {
  const Icon = tier.Icon;
  return <article className="result-card"><div className="panel-heading"><div><span className="eyebrow">{tier.id.replaceAll('_', ' ')}</span><h3>{tier.label}</h3></div><Icon size={22} /></div><strong>{tier.headline}</strong><p>{tier.description}</p><p className="form-note">{tier.detail}</p><div className="reward-stats"><div className="reward-stat"><strong>{tier.workspaces.length}</strong><span>workspaces</span></div><div className="reward-stat"><strong>{tier.capabilities.length}</strong><span>enabled</span></div><div className="reward-stat"><strong>{tier.lockedCapabilities.length}</strong><span>locked</span></div><div className="reward-stat"><strong>{tier.ads ? 'On' : 'Off'}</strong><span>ads</span></div></div><div className="hero-actions">{tier.workspaces.map((workspace) => <Link className="button primary" key={workspace} to={previewHref(tier, workspace)}><Eye size={15} />{workspace}<span className="sr-only"> preview</span></Link>)}<Link className="button secondary" to={`/capabilities?preview=${encodeURIComponent(tier.previewKey)}`}>Capabilities</Link></div></article>;
}

function TierGroup({ heading, description, select }) {
  return <section className="detail-panel" style={{ marginBottom: 18 }}><div className="panel-heading"><div><span className="eyebrow">{heading}</span><h2>{description}</h2></div></div><div className="dashboard-grid">{select(tiers).map((tier) => <TierCard tier={tier} key={tier.id} />)}</div></section>;
}

function VerificationGrid() {
  return <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CANONICAL MODEL</span><h2>Tier entitlement verification</h2></div><CheckCircle2 size={22} /></div><div className="dashboard-grid">{tiers.map((tier) => { const states = tier.capabilities.map((capability) => capabilityState(tier, capability)); return <div className="result-card" key={`verify-${tier.id}`}><strong>{tier.label}</strong><p>{tier.workspaces.join(' · ')}</p><p className="form-note">{states.filter((state) => state === 'enabled').length} enabled capability states · {tier.lockedCapabilities.length} explicit locks.</p></div>; })}</div></section>;
}

function PreviewSafety({ profile, membershipTier }) {
  return <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PREVIEW SAFETY</span><h2>Authenticated identity stays unchanged</h2></div><ShieldCheck size={22} /></div><p><strong>{profile?.display_name || profile?.username || 'Your profile'}</strong> remains the authenticated identity while you preview every tier.</p><p className="form-note">Current membership: {membershipTier || 'unknown'} · Preview presentation does not change profile, role, membership, entitlement, or billing state.</p><div className="hero-actions"><Link className="button secondary" to="/pricing">Membership & pricing</Link><Link className="button secondary" to="/capabilities">Capability Hub</Link><Link className="button secondary" to="/owner">Owner Command Center</Link></div></section>;
}

export default function OwnerTierPreview() {
  const { isPlatformOwner, membershipTier, profile } = useAppContext();
  return <WorkspaceShell workspace="owner"><main className="page"><div className="page-header"><div><span className="eyebrow">OWNER PRODUCT LAB · MEMBERSHIP</span><h1>Membership Experience Lab</h1><p>Test the real application as every canonical consumer, Fleet, Enterprise, and Business tier. Preview mode changes presentation only; it never mutates your authenticated account.</p></div><BadgeDollarSign size={34} /></div><LabInstructions />{groups.map(([heading, description, select]) => <TierGroup key={heading} heading={heading} description={description} select={select} />)}<VerificationGrid /><PreviewSafety profile={profile} membershipTier={membershipTier} />{!isPlatformOwner && <div className="state error">Owner access required.</div>}</main></WorkspaceShell>;
}
