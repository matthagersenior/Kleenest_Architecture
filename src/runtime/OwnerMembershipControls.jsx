import{useEffect,useState}from'react';
import{ArrowRight,Building2,Check,Layers3,Search,ShieldCheck,Users}from'lucide-react';
import{Link}from'react-router-dom';
import{useAppContext}from'../AppContext.jsx';

const USER_TIERS=[['free','Free'],['premium','Premium'],['family','Family'],['fleet','Fleet User'],['enterprise','Enterprise User']];
const BUSINESS_TIERS=[['standard','Business'],['growth','Business Growth'],['fleet','Business Fleet'],['enterprise','Business Enterprise']];
const rowsOf=v=>Array.isArray(v)?v:(v?.rows||v?.data||[]);
const accessOf=v=>v?.result??v??{};

export default function OwnerMembershipControls(){
  const{profile,services,isPlatformOwner}=useAppContext();
  const[q,setQ]=useState('');
  const[users,setUsers]=useState([]);
  const[selected,setSelected]=useState(null);
  const[userTier,setUserTier]=useState('free');
  const[businessQuery,setBusinessQuery]=useState('');
  const[businesses,setBusinesses]=useState([]);
  const[selectedBusiness,setSelectedBusiness]=useState(null);
  const[businessTier,setBusinessTier]=useState('standard');
  const[fleetEnabled,setFleetEnabled]=useState(false);
  const[enterpriseEnabled,setEnterpriseEnabled]=useState(false);
  const[busy,setBusy]=useState(false);
  const[loadingBusinesses,setLoadingBusinesses]=useState(false);
  const[loadingAccess,setLoadingAccess]=useState(false);
  const[error,setError]=useState('');
  const[message,setMessage]=useState('');
  if(!isPlatformOwner)return null;

  const search=async()=>{
    if(!q.trim())return;
    setBusy(true);setError('');setMessage('');
    try{const rows=await services.admin.searchUsers(profile,q.trim());setUsers(rowsOf(rows))}
    catch(e){setError(e.message||'Unable to search accounts.')}
    finally{setBusy(false)}
  };

  const searchBusinesses=async()=>{
    setLoadingBusinesses(true);setError('');setMessage('');
    try{
      const rows=await services.admin.crud(profile,'businesses','list');
      const all=rowsOf(rows);const needle=businessQuery.trim().toLowerCase();
      setBusinesses(!needle?all:all.filter(b=>JSON.stringify(b).toLowerCase().includes(needle)).slice(0,100));
    }catch(e){setError(e.message||'Unable to load businesses.')}
    finally{setLoadingBusinesses(false)}
  };

  useEffect(()=>{void searchBusinesses()},[]);

  const selectUser=u=>{setSelected(u);setUserTier(String(u.subscription_tier||'free').toLowerCase())};

  const saveUser=async()=>{
    if(!selected?.id)return;
    if(!window.confirm(`Change membership tier for ${selected.email||selected.name||selected.id} to ${userTier}?`))return;
    setBusy(true);setError('');setMessage('');
    try{
      await services.admin.setAccountCapabilities(profile,selected.id,{subscriptionTier:userTier,reason:`Owner membership tier change to ${userTier}`});
      setMessage(`User membership changed to ${userTier}.`);
      const rows=rowsOf(await services.admin.searchUsers(profile,q.trim()));setUsers(rows);setSelected(rows.find(x=>x.id===selected.id)||null);
    }catch(e){setError(e.message||'Unable to change user membership tier.')}
    finally{setBusy(false)}
  };

  const selectBusiness=async b=>{
    setSelectedBusiness(b);
    setBusinessTier(String(b.business_tier||'standard').replace('business_',''));
    setLoadingAccess(true);setError('');setMessage('');
    try{
      const access=accessOf(await services.admin.getBusinessAccess(profile,b.id));
      setBusinessTier(String(access.business_tier||b.business_tier||'standard').replace('business_',''));
      setFleetEnabled(Boolean(access.fleet_enabled));
      setEnterpriseEnabled(Boolean(access.enterprise_enabled));
    }catch(e){
      setFleetEnabled(String(b.business_tier||'').toLowerCase() in {fleet:true,enterprise:true});
      setEnterpriseEnabled(String(b.business_tier||'').toLowerCase()==='enterprise');
      setError(e.message||'Unable to load business access details.');
    }finally{setLoadingAccess(false)}
  };

  const saveBusiness=async()=>{
    const id=selectedBusiness?.id;if(!id)return;
    if(businessTier==='enterprise')setEnterpriseEnabled(true);
    if(businessTier==='fleet')setFleetEnabled(true);
    const nextFleet=businessTier==='enterprise'||businessTier==='fleet'||fleetEnabled;
    const nextEnterprise=businessTier==='enterprise'||enterpriseEnabled;
    if(!window.confirm(`Set ${selectedBusiness.name||selectedBusiness.business_name||id} to ${BUSINESS_TIERS.find(([v])=>v===businessTier)?.[1]||businessTier} with Fleet ${nextFleet?'enabled':'disabled'} and Enterprise ${nextEnterprise?'enabled':'disabled'}?`))return;
    setBusy(true);setError('');setMessage('');
    try{
      const result=accessOf(await services.admin.setBusinessAccess(profile,id,businessTier,{fleetEnabled:nextFleet,enterpriseEnabled:nextEnterprise,reason:`Owner business membership/access change to ${businessTier}`}));
      setFleetEnabled(Boolean(result.fleet_enabled));setEnterpriseEnabled(Boolean(result.enterprise_enabled));
      setMessage(`Business access updated: ${BUSINESS_TIERS.find(([v])=>v===businessTier)?.[1]||businessTier}.`);
      await searchBusinesses();
    }catch(e){setError(e.message||'Unable to change business membership/access.')}
    finally{setBusy(false)}
  };

  return <section className="detail-panel">
    <div className="panel-heading"><div><span className="eyebrow">MEMBERSHIP CONTROL</span><h2>Change membership & workspace access</h2></div><ShieldCheck size={22}/></div>
    <p>One owner-only control surface for consumer membership and business subscription tiers. Business Fleet and Enterprise access can also be granted as explicit workspace capabilities, so Growth can receive Fleet and Fleet can receive Enterprise access without replacing the base business tier.</p>
    {error&&<p className="form-error" role="alert">{error}</p>}
    {message&&<p className="form-success" role="status">{message}</p>}
    <div className="dashboard-grid">
      <article className="detail-panel">
        <div className="panel-heading"><div><span className="eyebrow">CONSUMER ACCOUNTS</span><h3><Users size={18}/> User membership</h3></div></div>
        <div className="hero-actions"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Email, name, or user ID"/><button className="button primary" onClick={search} disabled={busy||!q.trim()}><Search size={16}/>{busy?'Searching…':'Search'}</button></div>
        {users.length>0&&<div className="business-list">{users.map(u=><button type="button" className={`business-row${selected?.id===u.id?' selected':''}`} key={u.id} onClick={()=>selectUser(u)}><div><strong>{u.email||u.display_name||u.username||u.id}</strong><span>{u.id} · {u.subscription_tier||'free'} · {u.role||'customer'}</span></div><ArrowRight size={16}/></button>)}</div>}
        {selected&&<><label>Membership tier<select value={userTier} onChange={e=>setUserTier(e.target.value)}>{USER_TIERS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><div className="hero-actions"><button className="button primary" onClick={saveUser} disabled={busy}><Check size={16}/>Save user tier</button></div></>}
      </article>
      <article className="detail-panel">
        <div className="panel-heading"><div><span className="eyebrow">BUSINESS ACCOUNTS</span><h3><Building2 size={18}/> Business owner membership</h3></div></div>
        <div className="hero-actions"><input value={businessQuery} onChange={e=>setBusinessQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchBusinesses()} placeholder="Search business name or ID"/><button className="button secondary" onClick={searchBusinesses} disabled={loadingBusinesses}><Search size={16}/>{loadingBusinesses?'Loading…':'Search'}</button></div>
        {businesses.length>0&&<div className="business-list">{businesses.slice(0,50).map(b=><button type="button" className={`business-row${selectedBusiness?.id===b.id?' selected':''}`} key={b.id} onClick={()=>selectBusiness(b)}><div><strong>{b.name||b.business_name||b.id}</strong><span>{b.id} · {b.business_tier||'standard'}</span></div><ArrowRight size={16}/></button>)}</div>}
        {selectedBusiness&&<>
          <label>Business membership tier<select value={businessTier} onChange={e=>setBusinessTier(e.target.value)} disabled={loadingAccess}>{BUSINESS_TIERS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
          <div className="detail-panel" style={{marginTop:12}}><div className="panel-heading"><div><span className="eyebrow">WORKSPACE ACCESS</span><h3><Layers3 size={18}/> Additive operating capabilities</h3></div></div>
            <label><input type="checkbox" checked={fleetEnabled||businessTier==='fleet'||businessTier==='enterprise'} disabled={businessTier==='fleet'||businessTier==='enterprise'||loadingAccess} onChange={e=>setFleetEnabled(e.target.checked)}/> Fleet operations access</label>
            <p className="form-note">Allows fleet routes, stops, service events, metrics, and performance. Enterprise and Business Fleet include Fleet automatically.</p>
            <label><input type="checkbox" checked={enterpriseEnabled||businessTier==='enterprise'} disabled={businessTier==='enterprise'||loadingAccess} onChange={e=>setEnterpriseEnabled(e.target.checked)}/> Enterprise workspace access</label>
            <p className="form-note">Allows enterprise networks, partners, campaigns, intelligence, and governance. Business Enterprise includes this automatically.</p>
          </div>
          <div className="hero-actions"><button className="button primary" onClick={saveBusiness} disabled={busy||loadingAccess}><Check size={16}/>Save business access</button></div>
        </>}
      </article>
    </div>
    <div className="hero-actions"><Link className="button secondary" to="/owner/data?resource=profiles"><Users size={16}/>Open People & Access</Link><Link className="button secondary" to="/owner/data?resource=businesses"><Building2 size={16}/>Open Businesses</Link></div>
  </section>
}
