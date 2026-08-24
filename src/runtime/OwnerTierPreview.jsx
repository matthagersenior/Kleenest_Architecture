import {Link} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
const tiers=[
 ['free','Free Consumer','Consumer discovery, maps, check-ins, reviews, community, and rewards.'],
 ['premium','Premium Consumer','Ad-free consumer experience with the premium presentation layer.'],
 ['family','Family','Consumer experience with the family-oriented membership presentation.'],
 ['business_standard','Business Standard','Business locations, QR, campaigns, events, customers, and core analytics.'],
 ['business_growth','Business Growth','Expanded business engagement, intelligence, campaigns, events, and enterprise presentation.'],
 ['business_fleet','Business Fleet','Business + Fleet operations with routes, service, metrics, and enterprise access.'],
 ['business_enterprise','Business Enterprise','Full business, Fleet, and Enterprise operating presentation.'],
 ['fleet','Fleet User','Fleet command, routes, operations, intelligence, and performance.'],
 ['enterprise','Enterprise User','Enterprise command, networks, partners, campaigns, Fleet, and governance.']
];
export default function OwnerTierPreview(){const{isPlatformOwner,membershipTier}=useAppContext();return <WorkspaceShell workspace="owner"><section className="page-head"><span className="eyebrow">OWNER TOOLS</span><h1>Membership Experience Preview</h1><p>Open the real canonical application shell in presentation mode without changing your real membership, entitlements, or owner identity.</p><div className="dashboard-grid">{tiers.map(([tier,label,description])=><article className="result-card" key={tier}><h2>{label}</h2><p>{description}</p><Link className="button primary" to={`/?preview=${tier}`}>Preview {label}</Link></article>)}<article className="result-card"><h2>Admin Control</h2><p>Open the governance/admin workspace used for operational administration.</p><Link className="button secondary" to="/admin">Open Admin Control</Link></article><article className="result-card"><h2>Owner Control</h2><p>Return to the platform-owner command center and Platform CRUD.</p><Link className="button secondary" to="/owner">Open Owner Control</Link></article></div>{!isPlatformOwner&&<p>Owner access required.</p>}<p className="form-note">Current authenticated membership: {membershipTier||'unknown'}. Preview mode is presentation-only.</p></section></WorkspaceShell>}
