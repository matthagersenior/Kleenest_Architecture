import{useEffect,useMemo,useState}from'react';
import{Activity,ArrowRight,BarChart3,Building2,LockKeyhole,MapPinned,RefreshCw,ShieldCheck,Target,Users,Zap}from'lucide-react';
import{Link}from'react-router-dom';
import{useAppContext}from'../AppContext.jsx';
import WorkspaceShell from'./WorkspaceShell.jsx';
import CapabilityGate from'./CapabilityGate.jsx';

const arr=v=>Array.isArray(v)?v:[];
const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const tier=v=>String(v||'').toLowerCase();
const enterpriseTier=b=>['enterprise','fleet'].includes(tier(b?.business_tier||b?.service_tier||b?.plan||b?.plan_key||b?.subscription_plan));

export default function EnterpriseCommandCenterPage(){
  const{services,businessMemberships,isPlatformOwner,profile,loading:authLoading}=useAppContext();
  const[rows,setRows]=useState([]),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[error,setError]=useState('');
  const ready=!authLoading&&!!profile;
  const load=async({quiet=false}={})=>{
    if(!ready){setLoading(false);return;}
    if(quiet)setRefreshing(true);else setLoading(true);
    setError('');
    try{
      const businesses=arr(businessMemberships.length?businessMemberships:await services.business.listBusinesses({includeDemo:isPlatformOwner}));
      const source=businesses.filter(enterpriseTier).slice(0,25);
      const next=(await Promise.all(source.map(async business=>{
        const businessId=business.business_id||business.id;
        try{return{business,snapshot:await services.enterprise.controlPlaneSnapshot(businessId,30),error:null};}
        catch(e){return{business,snapshot:{totals:{},networks:[]},error:e.message||'Enterprise authority unavailable'};}
      }));
      setRows(next);
      const failures=next.filter(row=>row.error);
      if(failures.length&&failures.length===next.length)setError(failures[0].error);
    }catch(e){setError(e.message||'Unable to load enterprise command center.');}
    finally{setLoading(false);setRefreshing(false);}
  };
  useEffect(()=>{if(!authLoading&&ready)void load();},[authLoading,ready,businessMemberships.length,isPlatformOwner]);
  useEffect(()=>{const refresh=()=>{if(ready)void load({quiet:true});};const names=['kleenest:enterprise-updated','kleenest:enterprise-commerce','kleenest:business-updated','kleenest:offline-synced'];names.forEach(x=>window.addEventListener(x,refresh));return()=>names.forEach(x=>window.removeEventListener(x,refresh));},[ready,businessMemberships.length,isPlatformOwner]);
  const totals=useMemo(()=>rows.reduce((s,row)=>{const t=row.snapshot?.totals||{};s.networks+=n(t.networks);s.members+=n(t.active_members);s.campaigns+=n(t.campaigns);s.checkins+=n(t.check_ins);s.attributed+=n(t.attributed_users);s.points+=n(t.points_awarded);return s;},{networks:0,members:0,campaigns:0,checkins:0,attributed:0,points:0}),[rows]);
  if(authLoading)return <WorkspaceShell workspace="enterprise"><section className="page"><div className="empty-state"><ShieldCheck size={36}/><h2>Loading enterprise access</h2><p>Waiting for the authenticated session before querying protected enterprise operations.</p></div></section></WorkspaceShell>;
  if(loading)return <WorkspaceShell workspace="enterprise"><section className="page"><div className="empty-state">Loading enterprise command center…</div></section></WorkspaceShell>;
  if(error&&!rows.length)return <WorkspaceShell workspace="enterprise"><section className="page"><div className="empty-state" role="alert"><h2>Command center unavailable</h2><p>{error}</p><button className="secondary" onClick={()=>load()}><RefreshCw size={16}/>Retry</button></div></section></WorkspaceShell>;
  return <WorkspaceShell workspace="enterprise"><main className="page enterprise-page"><div className="page-header"><div><span className="eyebrow">KLEENEST ENTERPRISE · CONTROL PLANE</span><h1>Command center</h1><p>Authoritative 30-day network operations across partner membership, campaigns, outcomes and attributed activity.</p></div><div className="hero-actions"><button className="secondary" onClick={()=>load({quiet:true})} disabled={refreshing}><RefreshCw size={17} className={refreshing?'spin':''}/>{refreshing?'Refreshing…':'Refresh control plane'}</button><Link className="primary" to="/map"><MapPinned size={17}/>Open network map</Link></div></div><CapabilityGate kind="enterprise" fallback={<section className="empty-state"><LockKeyhole size={36}/><h2>Enterprise capability required</h2><p>Your current account is not authorized for Enterprise command operations.</p><Link className="secondary" to="/business">Return to Business</Link></section>}><section className="reward-stats"><div className="reward-stat"><Building2 size={20}/><strong>{rows.length}</strong><span>organizations</span></div><div className="reward-stat"><Target size={20}/><strong>{totals.networks}</strong><span>networks</span></div><div className="reward-stat"><Users size={20}/><strong>{totals.members}</strong><span>active partners</span></div><div className="reward-stat"><Zap size={20}/><strong>{totals.campaigns}</strong><span>campaigns</span></div><div className="reward-stat"><Activity size={20}/><strong>{totals.checkins}</strong><span>network check-ins</span></div><div className="reward-stat"><BarChart3 size={20}/><strong>{totals.attributed}</strong><span>attributed users</span></div><div className="reward-stat"><ShieldCheck size={20}/><strong>{totals.points}</strong><span>points awarded</span></div></section><section className="dashboard-grid"><Link className="detail-panel profile-action" to="/enterprise/partners"><Users/><div><strong>Partner network</strong><span>Membership, invitations and agreement operations.</span></div><ArrowRight/></Link><Link className="detail-panel profile-action" to="/enterprise/performance"><Target/><div><strong>Network performance</strong><span>Review measured outcomes, benchmarks and allocation efficiency.</span></div><ArrowRight/></Link><Link className="detail-panel profile-action" to="/enterprise/campaigns"><Zap/><div><strong>Partner campaigns</strong><span>Create, activate, pause and measure network campaigns.</span></div><ArrowRight/></Link></section><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PORTFOLIO AUTHORITY</span><h2>Managed Enterprise organizations</h2></div><ShieldCheck size={22}/></div>{rows.length?rows.map(row=>{const id=row.business.business_id||row.business.id;const t=row.snapshot?.totals||{};return <article className="business-row" key={id}><div><strong>{row.business.name||'Managed organization'}</strong><span>{n(t.networks)} networks · {n(t.active_members)} active partners · {n(t.active_campaigns)} active campaigns · {n(t.attributed_users)} attributed users{row.error?` · ${row.error}`:''}</span></div><div className="hero-actions"><Link className="secondary" to={`/business?business=${encodeURIComponent(id)}`}>Business</Link><Link className="secondary" to="/enterprise/partners">Partners</Link><Link className="secondary" to="/enterprise/campaigns">Campaigns</Link><Link className="secondary" to="/enterprise/performance">Performance</Link></div></article>}):<div className="empty-state"><h3>No Enterprise or Fleet organizations found</h3><p>Enterprise control-plane access follows the canonical business tier and owner/admin membership authority.</p></div>}</section></CapabilityGate></main></WorkspaceShell>;
}
