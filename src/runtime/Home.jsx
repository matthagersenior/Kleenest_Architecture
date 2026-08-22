import { Link } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
export default function Home(){return <WorkspaceShell><section className="hero"><span className="eyebrow">Kleenest</span><h1>Find better. Live better.</h1><p>Places, routes, rewards, community intelligence, and live network capabilities in one experience.</p><div className="hero-actions"><Link className="button primary" to="/map">Explore the network</Link><Link className="button secondary" to="/route">Plan a route</Link></div></section></WorkspaceShell>}
