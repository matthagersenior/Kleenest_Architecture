import {Link} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
const tiers=[['free','Consumer'],['premium','Premium'],['family','Family'],['business','Business'],['fleet','Fleet'],['enterprise','Enterprise']];
export default function OwnerTierPreview(){const {isPlatformOwner,membershipTier}=useAppContext();return <WorkspaceShell workspace="owner"><section className="page-head"><span className="eyebrow">Owner tools</span><h1>Tier Preview</h1><p>Preview customer presentation without changing your real membership ({membershipTier}).</p><div className="dashboard-grid">{tiers.map(([tier,label])=><article className="result-card" key={tier}><h2>{label}</h2><p>Open the real application shell with {label} presentation context.</p><Link className="button primary" to={`/?preview=${tier}`}>Preview {label}</Link></article>)}</div>{!isPlatformOwner&&<p>Owner access required.</p>}</section></WorkspaceShell>}
