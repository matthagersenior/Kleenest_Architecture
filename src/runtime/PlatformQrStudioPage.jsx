import { useEffect,useMemo,useState } from 'react';
import { Building2,RefreshCw,Search,ShieldCheck } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import QrStudioSurface from './QrStudioSurface.jsx';

const rowsOf=value=>Array.isArray(value)?value:(value?.rows||value?.data||[]);
const idOf=row=>row?.business_id||row?.id||'';
const labelOf=row=>row?.name||row?.business_name||row?.display_name||idOf(row)||'Business';

export default function PlatformQrStudioPage({embedded=false}={}){
 const{profile,services,isPlatformOwner,loading:authLoading}=useAppContext();
 const[businesses,setBusinesses]=useState([]),[businessId,setBusinessId]=useState(''),[query,setQuery]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const ready=!authLoading&&isPlatformOwner&&!!profile;
 const filtered=useMemo(()=>businesses.filter(row=>!query.trim()||`${labelOf(row)} ${idOf(row)}`.toLowerCase().includes(query.trim().toLowerCase())),[businesses,query]);
 const selected=useMemo(()=>businesses.find(row=>String(idOf(row))===String(businessId))||null,[businesses,businessId]);
 const load=async()=>{if(!ready)return;setLoading(true);setError('');try{const rows=rowsOf(await services.admin.crud(profile,'businesses','list'));setBusinesses(rows);setBusinessId(current=>rows.some(row=>String(idOf(row))===String(current))?current:String(idOf(rows[0])||''))}catch(e){setError(e?.message||'Unable to load platform businesses for QR Studio.')}finally{setLoading(false)}};
 useEffect(()=>{if(ready)void load()},[ready]);
 const content=<main className={`page qr-studio-page${embedded?' platform-qr-embedded':''}`}><div className="page-header"><div><span className="eyebrow">OWNER PLATFORM · QR STUDIO</span><h1>Platform QR Studio</h1><p>Design, publish, brand, test, print, track and govern QR experiences across every business and location from one platform control plane.</p></div><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>{loading?'Refreshing…':'Refresh businesses'}</button></div>{error&&<p className="form-error" role="alert">{error}</p>}<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PLATFORM SCOPE</span><h2>Choose a business</h2><p className="muted">Platform QR Studio uses the same canonical QR lifecycle and analytics authority as Business QR Studio, with unrestricted owner scope.</p></div><ShieldCheck size={22}/></div><div className="form-grid"><label>Search businesses<div className="input-with-icon"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Business name or ID"/></div></label><label>Operating business<select value={businessId} onChange={e=>setBusinessId(e.target.value)}><option value="">Select business</option>{filtered.map(row=><option key={idOf(row)} value={idOf(row)}>{labelOf(row)}</option>)}</select></label></div>{selected&&<div className="state"><Building2 size={16}/><strong>{labelOf(selected)}</strong><span>{selected.business_tier||selected.tier||'Platform-managed business'}</span></div>}</section>{selected?<QrStudioSurface key={businessId} business={selected} platformMode/>:<section className="empty-state"><Building2 size={30}/><h2>Select a business to open its QR authority</h2><p>All QR Studio capabilities become available at platform scope after a business is selected.</p></section>}</main>;
 if(authLoading)return embedded?<section className="empty-state"><ShieldCheck size={28}/><h2>Loading Platform QR Studio</h2></section>:<WorkspaceShell workspace="admin"><section className="empty-state"><ShieldCheck size={28}/><h2>Loading Platform QR Studio</h2></section></WorkspaceShell>;
 if(!isPlatformOwner)return embedded?<section className="empty-state"><ShieldCheck size={28}/><h2>Platform owner access required</h2></section>:<WorkspaceShell workspace="consumer"><section className="empty-state"><ShieldCheck size={28}/><h2>Platform owner access required</h2></section></WorkspaceShell>;
 return embedded?content:<WorkspaceShell workspace="admin">{content}</WorkspaceShell>;
}
