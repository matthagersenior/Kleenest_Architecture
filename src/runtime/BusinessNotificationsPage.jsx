import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import BusinessCustomNotificationPanel from './BusinessCustomNotificationPanel.jsx';

export default function BusinessNotificationsPage(){
  const { user, selectedBusiness, selectedBusinessId, businessMemberships } = useAppContext();
  const businesses=Array.isArray(businessMemberships)?businessMemberships:[];
  const business=businesses.find(b=>String(b?.business_id||b?.id)===String(selectedBusinessId))||selectedBusiness||businesses[0]||null;
  const businessId=business?.business_id||business?.id||'';
  if(!user)return <WorkspaceShell workspace="business"><section className="empty-state"><Bell size={32}/><h2>Sign in to manage business notifications</h2><p>Business notifications are governed by the selected business capability.</p><Link className="primary" to="/auth">Sign in</Link></section></WorkspaceShell>;
  if(!businessId)return <WorkspaceShell workspace="business"><section className="empty-state"><Bell size={32}/><h2>No business selected</h2><p>Select a managed business before sending a notification.</p><Link className="secondary" to="/business">Business dashboard</Link></section></WorkspaceShell>;
  return <WorkspaceShell workspace="business"><section className="page"><div className="page-header"><div><span className="eyebrow">BUSINESS · NOTIFICATIONS</span><h1>Customer notifications</h1><p>Send governed, attributable messages to the audiences supported by your business capability.</p></div><div className="hero-actions"><Link className="secondary" to="/business">Operations</Link><Link className="secondary" to="/business/intelligence">Intelligence</Link></div></div><BusinessCustomNotificationPanel businessId={businessId}/></section></WorkspaceShell>;
}
