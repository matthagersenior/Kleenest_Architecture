import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Handshake, Megaphone, Pause, Play, RefreshCw, Target, TrendingUp, Wallet, CheckCircle2, Activity, Building2, Users, ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import { createEnterpriseLifecycleService } from '../domains/enterprise/lifecycle.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import RoleScopedCrudPanel from './RoleScopedCrudPanel.jsx';
import EnterpriseMembershipCrud from './EnterpriseMembershipCrud.jsx';

const arr = value => Array.isArray(value) ? value : [];
const obj = value => value && typeof value === 'object' ? value : {};
const metrics = value => Object.entries(obj(value)).slice(0, 12);
const today = () => new Date().toISOString().slice(0, 10);
const nameOf = value => value?.name || value?.business_name || 'Selected business';

const MetricFields = ({ values, setValues, fields }) => (
  <div className="detail-grid">
    {fields.map(([key, label]) => (
      <label className="form-field" key={key}>
        <span>{label}</span>
        <input type="number" min="0" value={values[key] ?? 0} onChange={event => setValues(current => ({ ...current, [key]: Number(event.target.value) || 0 }))} />
      </label>
    ))}
  </div>
);

export default function EnterpriseOperationsPage({ mode = 'partners' }) {
  const { services, selectedBusinessId, selectedBusiness, loading: authLoading, user, profile } = useAppContext();
  const lifecycle = useMemo(() => createEnterpriseLifecycleService(services), [services]);
  const ready = !authLoading && !!user && !!profile;
  const [programs, setPrograms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [context, setContext] = useState(null);
  const [networkId, setNetworkId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('engagement');
  const [report, setReport] = useState({});
  const [roi, setRoi] = useState({});
  const [allocation, setAllocation] = useState({});
  const [outcome, setOutcome] = useState({});
  const [metric, setMetric] = useState({});
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedBusinessName = nameOf(selectedBusiness);
  const load = async () => {
    if (!ready) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const results = await Promise.allSettled([services.partners.list(), services.partners.memberships()]);
      const value = (result, label) => result.status === 'fulfilled' ? arr(result.value) : (setError(`${label}: ${result.reason?.message || String(result.reason)}`), []);
      const nextPrograms = value(results[0], 'Partner programs');
      const nextMemberships = value(results[1], 'Memberships');
      setPrograms(nextPrograms);
      setMemberships(nextMemberships);
      setContext(lifecycle.resolveContext({ selectedBusinessId, memberships: nextMemberships }));
    } catch (e) { setError(e.message || 'Unable to load enterprise operations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (ready) void load(); else if (!authLoading) setLoading(false); }, [ready, selectedBusinessId, services, lifecycle]);
  useEffect(() => {
    const id = selectedBusinessId || selectedBusiness?.business_id || selectedBusiness?.id || '';
    setNetworkId(String(id)); setCampaign(null); setReport({}); setRoi({}); setAllocation({});
  }, [selectedBusinessId, selectedBusiness]);
  useEffect(() => {
    if (!ready) return undefined;
    const refresh = () => void load();
    window.addEventListener('kleenest:business-updated', refresh);
    window.addEventListener('kleenest:enterprise-updated', refresh);
    return () => { window.removeEventListener('kleenest:business-updated', refresh); window.removeEventListener('kleenest:enterprise-updated', refresh); };
  }, [ready, selectedBusinessId, services]);

  const mutate = async (fn, success) => {
    if (!ready) return;
    setError(''); setMessage('');
    try { const result = await fn(); if (result !== undefined) setCampaign(result); setMessage(success); window.dispatchEvent(new CustomEvent('kleenest:enterprise-updated')); await load(); }
    catch (e) { setError(e.message || 'Enterprise operation failed.'); }
  };
  const campaignId = lifecycle.campaignId(campaign);
  const createCampaign = () => networkId && campaignName.trim() && mutate(() => lifecycle.createCampaign(networkId, campaignName.trim(), campaignType, null), 'Partner campaign created and selected.');
  const loadReport = async () => {
    if (!networkId) return;
    setError('');
    const results = await Promise.allSettled([
      services.enterpriseIntelligence.getNetwork(networkId),
      services.enterpriseIntelligence.benchmark(networkId),
      services.enterpriseIntelligence.allocationRoi(networkId)
    ]);
    const value = (result, label) => result.status === 'fulfilled' ? obj(result.value) : (setError(`${label}: ${result.reason?.message || String(result.reason)}`), {});
    setReport(value(results[0], 'Network report')); setRoi(value(results[1], 'Benchmark')); setAllocation(value(results[2], 'Allocation ROI'));
  };
  const loadCampaignRoi = async () => { if (!campaignId) return; try { setRoi(obj(await services.enterpriseIntelligence.campaignRoi(campaignId))); } catch (e) { setError(e.message || 'Unable to load campaign ROI.'); } };
  const fields = [['visits', 'Visits'], ['checkIns', 'Check-ins'], ['reviews', 'Reviews'], ['preferredUses', 'Preferred uses'], ['accessRedemptions', 'Access redemptions'], ['promotionRedemptions', 'Promotion redemptions']];
  const outcomeFields = [...fields, ['attributedUsers', 'Attributed users'], ['pointsAwarded', 'Points awarded']];

  if (authLoading) return <WorkspaceShell workspace="enterprise"><section className="empty-state"><ShieldCheck size={28}/><h2>Loading enterprise access</h2></section></WorkspaceShell>;
  if (!ready) return <WorkspaceShell workspace="enterprise"><section className="empty-state"><ShieldCheck size={28}/><h2>Sign in to access enterprise operations</h2><Link className="primary" to="/auth">Sign in</Link></section></WorkspaceShell>;
  if (loading) return <WorkspaceShell workspace="enterprise"><section className="empty-state">Loading enterprise operations…</section></WorkspaceShell>;

  return <WorkspaceShell workspace="enterprise">
    <section className="page enterprise-page">
      <div className="page-header"><div><span className="eyebrow">ENTERPRISE OPERATIONS</span><h1>{mode === 'campaigns' ? 'Partner campaigns' : mode === 'performance' ? 'Network performance' : 'Partner network'}</h1><p>Enterprise partner networks, campaigns, outcomes and intelligence.</p></div><div className="hero-actions"><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button><Link className="secondary" to="/enterprise">Command center</Link><Link className="secondary" to="/enterprise/intelligence">Intelligence</Link><Link className="secondary" to="/enterprise/reports"><FileText size={16}/>Reports</Link><Link className="secondary" to="/enterprise/reports/history">History</Link></div></div>
      {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
      <RoleScopedCrudPanel role="enterprise" businessId={selectedBusinessId}/><EnterpriseMembershipCrud businessId={selectedBusinessId}/>
      <section className="detail-panel">
        <div className="panel-heading"><div><span className="eyebrow">NETWORK CONTEXT</span><h2>Enterprise network controls</h2></div><Target size={22}/></div>
        <div className="metric-card"><Building2 size={18}/><strong>{selectedBusinessName}</strong><span>Active enterprise network context</span></div>
        {mode === 'campaigns' && (
          <>
            <label className="form-field"><span>Campaign name</span><input value={campaignName} onChange={e => setCampaignName(e.target.value)} /></label>
            <label className="form-field"><span>Campaign type</span><select value={campaignType} onChange={e => setCampaignType(e.target.value)}><option value="engagement">Engagement</option><option value="promotion">Promotion</option><option value="access">Access</option></select></label>
            <div className="hero-actions">
              <button className="primary" onClick={createCampaign} disabled={!networkId || !campaignName.trim()}><Megaphone size={16}/>Create campaign</button>
              {campaign ? <><button className="secondary" onClick={() => mutate(() => lifecycle.activateCampaign(campaignId), 'Partner campaign activated.')}><Play size={16}/>Activate</button><button className="secondary" onClick={() => mutate(() => lifecycle.pauseCampaign(campaignId), 'Partner campaign paused.')}><Pause size={16}/>Pause</button></> : null}
            </div>
            {campaign ? <button className="secondary" onClick={loadCampaignRoi}><TrendingUp size={16}/>Load campaign ROI</button> : null}
          </>
        )}
        {mode === 'performance' && <button className="primary" onClick={loadReport} disabled={!networkId}><BarChart3 size={16}/>Load network intelligence</button>}
        {mode === 'partners' && <div className="hero-actions"><button className="primary" disabled={!context?.programId || !context?.partnerBusinessId} onClick={() => mutate(() => lifecycle.requestAgreement(context.programId, context.partnerBusinessId), 'Partner agreement requested.')}><Handshake size={16}/>Request agreement</button><button className="secondary" disabled={!context?.agreementId} onClick={() => mutate(() => lifecycle.acceptAgreement(context.agreementId), 'Partner agreement accepted.')}><CheckCircle2 size={16}/>Accept agreement</button></div>}
      </section>
      {mode === 'partners' && <><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">PROGRAMS</span><h2>Available partner programs</h2></div><Handshake size={22}/></div>{programs.length ? programs.map(program => <div className="business-row" key={program.id || program.program_id}><div><strong>{program.name || program.program_name || 'Partner program'}</strong><span>{program.description || program.status || 'Available program'}</span></div><button className="secondary compact" onClick={() => mutate(() => services.partners.join(program.id || program.program_id), 'Partner program joined.')}>Join</button></div>) : <p className="muted">No partner programs returned.</p>}</section><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">MEMBERSHIPS</span><h2>My partner memberships</h2></div><Users size={22}/></div>{memberships.length ? memberships.map(member => <div className="business-row" key={member.id || member.membership_id}><div><strong>{member.program_name || member.name || 'Partner membership'}</strong><span>{member.status || 'active'}</span></div></div>) : <p className="muted">No memberships yet.</p>}</section></>}
      {mode === 'campaigns' && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CAMPAIGN OUTCOMES</span><h2>Record partner outcome</h2></div><Activity size={20}/></div><MetricFields values={outcome} setValues={setOutcome} fields={outcomeFields}/><button className="primary" disabled={!campaignId || !context?.partnerBusinessId} onClick={() => mutate(() => lifecycle.recordCampaignOutcome(campaignId, context.partnerBusinessId, outcome), 'Campaign outcome recorded.')}><CheckCircle2 size={16}/>Record outcome</button></section>}
      {mode === 'performance' && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">NETWORK METRICS</span><h2>Record daily network metric</h2></div><Activity size={20}/></div><MetricFields values={metric} setValues={setMetric} fields={fields}/><button className="primary" disabled={!networkId} onClick={() => mutate(() => lifecycle.recordNetworkMetric(networkId, today(), metric), 'Network metric recorded.')}><Activity size={16}/>Record metric</button></section>}
      {Object.keys(report).length > 0 && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">NETWORK INTELLIGENCE</span><h2>Network report</h2></div><BarChart3 size={20}/></div><pre className="analytics-json">{JSON.stringify(report, null, 2)}</pre></section>}
      {Object.keys(roi).length > 0 && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ROI / BENCHMARK</span><h2>Outcome intelligence</h2></div><TrendingUp size={20}/></div><div className="detail-grid">{metrics(roi).map(([key, value]) => <div className="metric-card" key={key}><strong>{String(value ?? '—')}</strong><span>{key.replaceAll('_', ' ')}</span></div>)}</div></section>}
      {Object.keys(allocation).length > 0 && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ALLOCATION ROI</span><h2>Budget efficiency</h2></div><Wallet size={20}/></div><div className="detail-grid">{metrics(allocation).map(([key, value]) => <div className="metric-card" key={key}><strong>{String(value ?? '—')}</strong><span>{key.replaceAll('_', ' ')}</span></div>)}</div></section>}
    </section>
  </WorkspaceShell>;
}
