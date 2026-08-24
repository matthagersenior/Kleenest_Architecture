import { ArrowRight, Compass, Heart, MapPin, MessageCircle, ShieldCheck, Star, Ticket, Trophy, Users, Search, Route as RouteIcon, Sparkles, Camera, CircleUserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';

const actions = [
  { to:'/map', icon:MapPin, title:'Find a restroom', text:'See nearby places, cleanliness signals, amenities, photos, and community trust.', label:'Explore nearby' },
  { to:'/check-in', icon:Sparkles, title:'Check in', text:'Verify a visit and turn a real-world action into trusted network data.', label:'Verify a visit' },
  { to:'/evidence', icon:Camera, title:'Add evidence', text:'Capture the details that make a location more useful to everyone.', label:'Add evidence' },
  { to:'/route', icon:Compass, title:'Plan your route', text:'Build a route around where you are going and the stops that matter.', label:'Plan route' },
  { to:'/play/quest', icon:Trophy, title:'Trust quests', text:'Turn useful activity into XP, rewards, reputation, and progression.', label:'View quests' },
  { to:'/games', icon:Star, title:'Play', text:'Use your Kleenest progress in games, challenges, and friendly competition.', label:'Play now' },
];

const community = [
  { to:'/community', icon:MessageCircle, title:'Community', text:'Reviews, discoveries, follows, media, and local activity.' },
  { to:'/activity', icon:RouteIcon, title:'Your activity', text:'See what you have verified, reviewed, earned, and contributed.' },
  { to:'/profile', icon:CircleUserRound, title:'Your profile', text:'Manage your identity, progress, preferences, and membership.' },
];

export default function Home(){
  const { profile, loading } = useAppContext();
  const name = profile?.display_name || 'there';
  return <WorkspaceShell workspace="consumer">
    <main className="page home-page">
      <section className="hero home-hero">
        <div>
          <span className="eyebrow">YOUR KLEENEST</span>
          <h1>Good to see you, {name}.</h1>
          <p>Find a better restroom, make it better for the next person, and turn every useful action into trusted community intelligence.</p>
        </div>
        <div className="hero-actions">
          <Link to="/map" className="button primary"><MapPin size={17}/>Find a restroom</Link>
          <Link to="/check-in" className="button secondary"><Sparkles size={17}/>Check in</Link>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading"><div><span className="eyebrow">THE KLEENEST LOOP</span><h2>Do something that matters</h2></div><Link className="text-link" to="/activity">See your activity <ArrowRight size={15}/></Link></div>
        <div className="home-grid">{actions.map(({to,icon:Icon,title,text,label})=><Link className="home-card" to={to} key={to}><span className="home-card-icon"><Icon size={21}/></span><div><h3>{title}</h3><p>{text}</p><span className="text-link">{label} <ArrowRight size={14}/></span></div><ArrowRight className="home-card-arrow" size={17}/></Link>)}</div>
      </section>

      <section className="home-section home-feature-band">
        <div className="section-heading"><div><span className="eyebrow">TRUST → REWARDS</span><h2>Your real-world activity has a purpose</h2></div></div>
        <div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PROGRESSION</span><h2>Verify → Evidence → Review → Trust → Rewards → Game</h2></div><Trophy size={22}/></div><p>Every useful contribution strengthens the network and can advance your quests, reputation, XP, and rewards. No technical IDs. No operator controls. Just use Kleenest normally.</p><div className="button-row"><Link className="button primary" to="/play/quest">Explore Trust Quests <ArrowRight size={15}/></Link><Link className="button secondary" to="/games">Open Game Center <Trophy size={15}/></Link></div></div>
      </section>

      <section className="home-section">
        <div className="section-heading"><div><span className="eyebrow">YOUR NETWORK</span><h2>Stay connected</h2></div></div>
        <div className="home-grid">{community.map(({to,icon:Icon,title,text})=><Link className="home-card" to={to} key={to}><span className="home-card-icon"><Icon size={21}/></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="home-card-arrow" size={17}/></Link>)}</div>
      </section>

      <section className="home-secondary-grid">
        <Link className="detail-panel home-panel-link" to="/access"><div className="panel-heading"><div><span className="eyebrow">ACCESS</span><h2>Single-use access</h2></div><Ticket size={20}/></div><p>Purchase eligible access offers and redeem them when you need them.</p><span className="text-link">View offers <ArrowRight size={15}/></span></Link>
        <Link className="detail-panel home-panel-link" to="/family"><div className="panel-heading"><div><span className="eyebrow">HOUSEHOLD</span><h2>Family</h2></div><Heart size={20}/></div><p>Keep shared participation and household coordination together.</p><span className="text-link">Open Family <ArrowRight size={15}/></span></Link>
        <Link className="detail-panel home-panel-link" to="/intelligence"><div className="panel-heading"><div><span className="eyebrow">NETWORK</span><h2>Intelligence</h2></div><Search size={20}/></div><p>Explore recommendations and network-level signals.</p><span className="text-link">Open Intelligence <ArrowRight size={15}/></span></Link>
        <Link className="detail-panel home-panel-link" to="/support"><div className="panel-heading"><div><span className="eyebrow">HELP</span><h2>Need a hand?</h2></div><Users size={20}/></div><p>Get support, report a problem, or suggest a feature.</p><span className="text-link">Open Support <ArrowRight size={15}/></span></Link>
      </section>

      <footer className="home-footer"><span>{loading ? 'Loading your account…' : 'Kleenest is better when every visit makes the network smarter.'}</span><div><Link className="text-link" to="/pricing">Membership</Link><Link className="text-link" to="/support">Support</Link><Link className="text-link" to="/about">About</Link></div></footer>
    </main>
  </WorkspaceShell>;
}
