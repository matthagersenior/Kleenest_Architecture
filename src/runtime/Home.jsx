import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, Compass, Heart, MapPin, MessageCircle, Sparkles, Trophy, Users, Search, Route as RouteIcon, Camera, CircleUserRound, ShieldCheck, Star, Truck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import QuickRestroomActions from './QuickRestroomActions.preview.jsx';
import { useAppContext } from '../AppContext.jsx';

const actions = [
  { to:'/map', icon:MapPin, title:'Find a restroom', text:'Nearby locations, cleanliness signals, amenities, photos, and community trust.', label:'Explore nearby' },
  { to:'/check-in', icon:Sparkles, title:'Verify a visit', text:'Turn a real-world visit into trusted network data.', label:'Check in' },
  { to:'/evidence', icon:Camera, title:'Strengthen a location', text:'Add evidence that makes the next person’s decision easier.', label:'Add evidence' },
  { to:'/route', icon:Compass, title:'Plan smarter', text:'Build a route around where you are going and the stops that matter.', label:'Plan route' },
  { to:'/play/quest', icon:Trophy, title:'Trust Quests', text:'Turn useful activity into XP, rewards, reputation, and progression.', label:'Explore quests' },
  { to:'/games', icon:Star, title:'Play', text:'Put your Kleenest progress to work in games and friendly competition.', label:'Open Game Center' },
];

const PREVIEW_WORKSPACE={business_standard:'business',business_growth:'business',business_fleet:'fleet',business_enterprise:'enterprise',fleet:'fleet',enterprise:'enterprise'};
const normalizeTier=value=>String(value||'').toLowerCase().replace(/[-\s]/g,'_');

function OperationsOverview({ workspace, tier }){
  if(!['business','fleet','enterprise'].includes(workspace))return null;
  const business=workspace==='business';
  const fleet=workspace==='fleet';
  const enterprise=workspace==='enterprise';
  const growth=tier.includes('growth');
  const cards=business
    ? [
      {to:'/business',icon:Building2,title:'Business command',text:'Manage locations, QR check-ins, assets and day-to-day business operations.',label:'Open business overview'},
      {to:growth?'/business/engage':'/business/dashboard',icon:Sparkles,title:growth?'Growth & engagement':'Business analytics',text:growth?'Campaigns, promotions, events, contests, customers and richer engagement controls.':'See available business performance and visitor analytics.',label:growth?'Open growth controls':'Open analytics'},
      {to:'/business/intelligence',icon:BarChart3,title:'Business intelligence',text:'Turn location activity, trust signals and customer behavior into decisions.',label:'Open intelligence'},
    ]
    : fleet
    ? [
      {to:'/fleet',icon:Truck,title:'Fleet command',text:'Run vehicles, routes, field activity and operational work from one control surface.',label:'Open fleet command'},
      {to:'/fleet/routes',icon:RouteIcon,title:'Routes & operations',text:'Coordinate routes, opportunities and field execution.',label:'Open routes'},
      {to:'/fleet/performance',icon:BarChart3,title:'Fleet performance',text:'Monitor operational metrics, goals and intelligence.',label:'Open performance'},
    ]
    : [
      {to:'/enterprise',icon:BriefcaseBusiness,title:'Enterprise command',text:'Portfolio-level control across organizations, locations, trust signals and outcomes.',label:'Open command center'},
      {to:'/enterprise/partners',icon:Users,title:'Partners & networks',text:'Coordinate partner programs, networks and enterprise relationships.',label:'Open partner network'},
      {to:'/enterprise/performance',icon:BarChart3,title:'Enterprise performance',text:'Measure portfolio outcomes, engagement and operational performance.',label:'Open performance'},
    ];
  return <section className="home-section"><div className="section-heading"><div><span className="eyebrow">OPERATIONS OVERVIEW</span><h2>{enterprise?'Enterprise':fleet?'Fleet':'Business'} control panels</h2><p className="section-subtitle">Your operational dashboards are surfaced here instead of being buried behind the workspace switcher.</p></div></div><div className="home-grid">{cards.map(({to,icon:Icon,title,text,label})=><Link className="home-card" to={to} key={to}><span className="home-card-icon"><Icon size={21}/></span><div><h3>{title}</h3><p>{text}</p><span className="text-link">{label} <ArrowRight size={14}/></span></div><ArrowRight className="home-card-arrow" size={17}/></Link>)}</div></section>;
}

export default function Home(){
  const { profile, loading, membershipTier, presentationTier, workspaceModel } = useAppContext();
  const [params] = useSearchParams();
  const previewTier=normalizeTier(params.get('preview'));
  const tier=previewTier||normalizeTier(presentationTier||membershipTier||workspaceModel?.membership);
  const workspace=PREVIEW_WORKSPACE[previewTier]||workspaceModel?.workspace?.id||'consumer';
  const name = profile?.display_name || 'there';
  return <WorkspaceShell workspace={workspace}>
    <main className="page home-page">
      <section className="hero home-hero">
        <div>
          <span className="eyebrow">YOUR KLEENEST</span>
          <h1>Good to see you, {name}.</h1>
          <p>Find a better restroom. Make it better for the next person. Build trust every time you use Kleenest.</p>
          <div className="home-trust-strip"><span><ShieldCheck size={15}/>Verified community</span><span><Sparkles size={15}/>Real-world rewards</span><span><Users size={15}/>Local intelligence</span></div>
        </div>
        <div className="hero-actions"><Link to="/map" className="button primary"><MapPin size={17}/>Find a restroom</Link><Link to="/check-in" className="button secondary"><Sparkles size={17}/>Verify a visit</Link></div>
      </section>
      <QuickRestroomActions />
      <OperationsOverview workspace={workspace} tier={tier} />
      <section className="home-section"><div className="section-heading"><div><span className="eyebrow">THE KLEENEST LOOP</span><h2>Make your next visit count</h2><p className="section-subtitle">Everything you need is here. Free and Premium use the same consumer experience.</p></div><Link className="text-link" to="/activity">Your activity <ArrowRight size={15}/></Link></div><div className="home-grid">{actions.map(({to,icon:Icon,title,text,label})=><Link className="home-card" to={to} key={to}><span className="home-card-icon"><Icon size={21}/></span><div><h3>{title}</h3><p>{text}</p><span className="text-link">{label} <ArrowRight size={14}/></span></div><ArrowRight className="home-card-arrow" size={17}/></Link>)}</div></section>
      <section className="home-section home-feature-band"><div className="detail-panel trust-loop-panel"><div className="panel-heading"><div><span className="eyebrow">TRUST → REWARDS</span><h2>Every useful action builds something</h2></div><Trophy size={22}/></div><div className="trust-loop-steps"><span>Verify</span><ArrowRight size={14}/><span>Evidence</span><ArrowRight size={14}/><span>Review</span><ArrowRight size={14}/><span>Trust</span><ArrowRight size={14}/><span>Rewards</span><ArrowRight size={14}/><span>Game</span></div><p>Your check-ins, evidence, reviews, quests, and play can strengthen the network while advancing your own reputation and rewards.</p><div className="button-row"><Link className="button primary" to="/play/quest">Explore Trust Quests <ArrowRight size={15}/></Link><Link className="button secondary" to="/games">Game Center <Trophy size={15}/></Link></div></div></section>
      <section className="home-section"><div className="section-heading"><div><span className="eyebrow">YOUR NETWORK</span><h2>Stay connected</h2></div></div><div className="home-grid">{[['/community',MessageCircle,'Community','Reviews, discoveries, follows, media, and local activity.'],['/activity',RouteIcon,'Your activity','See what you verified, reviewed, earned, and contributed.'],['/profile',CircleUserRound,'Your profile','Manage identity, progress, preferences, and membership.']].map(([to,Icon,title,text])=><Link className="home-card" to={to} key={to}><span className="home-card-icon"><Icon size={21}/></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="home-card-arrow" size={17}/></Link>)}</div></section>
      <section className="home-secondary-grid"><Link className="detail-panel home-panel-link" to="/family"><div className="panel-heading"><div><span className="eyebrow">HOUSEHOLD</span><h2>Family</h2></div><Heart size={20}/></div><p>Keep shared participation and household coordination together.</p><span className="text-link">Open Family <ArrowRight size={15}/></span></Link><Link className="detail-panel home-panel-link" to="/intelligence"><div className="panel-heading"><div><span className="eyebrow">NETWORK</span><h2>Intelligence</h2></div><Search size={20}/></div><p>Explore recommendations and network-level signals.</p><span className="text-link">Open Intelligence <ArrowRight size={15}/></span></Link><Link className="detail-panel home-panel-link" to="/support"><div className="panel-heading"><div><span className="eyebrow">HELP</span><h2>Need a hand?</h2></div><Users size={20}/></div><p>Get support, report a problem, or suggest a feature.</p><span className="text-link">Open Support <ArrowRight size={15}/></span></Link></section>
      <footer className="home-footer"><span>{loading ? 'Loading your account…' : 'Kleenest gets better when every visit makes the network smarter.'}</span><div><Link className="text-link" to="/pricing">Membership</Link><Link className="text-link" to="/support">Support</Link><Link className="text-link" to="/about">About</Link></div></footer>
    </main>
  </WorkspaceShell>;
}
