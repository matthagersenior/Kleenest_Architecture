import { useEffect, useState } from 'react';
import { BarChart3, Database, Link2, RefreshCw, Save, ShieldCheck, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import CapabilityGate from './CapabilityGate.jsx';
import './fleetPerformance.css';

const arr = (value) => Array.isArray(value) ? value : [];
const idOf = (value) => value?.id || value?.metric_definition_id || value?.target_id;
const labelOf = (value) => value?.name || value?.metric_name || value?.metric_key || value?.target_name || value?.display_name || idOf(value) || 'Metric';
const emptyConfig = { definitions: [], assignments: [] };
const blank = { metricKey: '', featureCode: '', name: '', description: '', unit: '', sourceDataset: '', sourceMetric: '', aggregation: 'avg', direction: 'higher_is_better', scoringMethod: 'threshold', goal: '', threshold: '', maxScore: 100, period: 'weekly' };

export default function FleetPerformancePage() {
  const { services, isPlatformOwner, capabilityCoverage } = useAppContext();
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState('');
  const [values, setValues] = useState([]);
  const [config, setConfig] = useState(emptyConfig);
  const [capabilities, setCapabilities] = useState({ measurement_sources: [], shared_primitives: [] });
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [targetId, setTargetId] = useState('');
  const [targetType, setTargetType] = useState('driver');
  const [saving, setSaving] = useState(false);

  const audit = async (featureCode, outcome, metadata = {}) => {
    try { await capabilityCoverage?.record({ featureCode, outcome, tierCode: 'fleet', destination: 'fleet_performance', metadata }); } catch {}
  };

  const loadBusinesses = async () => {
    try {
      const next = arr(await services.business.listBusinesses());
      setBusinesses(next);
      if (!businessId && next[0]) setBusinessId(String(next[0]?.business_id || next[0]?.id));
    } catch (e) { setError(e.message || 'Unable to load business access.'); }
    finally { setLoading(false); }
  };

  const load = async () => {
    if (!businessId) return;
    setLoading(true); setError('');
    try {
      const [configuration, metricValues, leaderboard, caps] = await Promise.all([
        services.fleetMetrics.configuration(businessId),
        services.fleetMetrics.values(businessId),
        services.fleet.leaderboard(businessId),
        services.fleetMetrics.capabilities(businessId)
      ]);
      setConfig({
        definitions: arr(configuration?.definitions || configuration?.metric_definitions || configuration),
        assignments: arr(configuration?.assignments || configuration?.metric_assignments)
      });
      setValues(arr(metricValues));
      setLeaders(arr(leaderboard));
      setCapabilities(caps || { measurement_sources: [], shared_primitives: [] });
      await audit('fleet.performance.view', 'allowed', { businessId });
    } catch (e) {
      await audit('fleet.performance.view', 'blocked', { businessId, error: e.message });
      setError(e.message || 'Unable to load Fleet performance.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadBusinesses(); }, []);
  useEffect(() => { if (businessId) void load(); }, [businessId]);
  useEffect(() => {
    const refresh = () => void load();
    window.addEventListener('kleenest:fleet-updated', refresh);
    window.addEventListener('kleenest:business-updated', refresh);
    return () => {
      window.removeEventListener('kleenest:fleet-updated', refresh);
      window.removeEventListener('kleenest:business-updated', refresh);
    };
  }, [businessId]);

  const setField = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const startEdit = (definition) => {
    setEditing(idOf(definition));
    setDraft({
      ...blank,
      metricKey: definition.metric_key || '', featureCode: definition.feature_code || '',
      name: definition.name || '', description: definition.description || '', unit: definition.unit || '',
      sourceDataset: definition.source_dataset || '', sourceMetric: definition.source_metric || '',
      aggregation: definition.aggregation || 'avg', direction: definition.direction || 'higher_is_better',
      scoringMethod: definition.scoring_method || 'threshold', goal: definition.goal ?? '',
      threshold: definition.threshold ?? '', maxScore: definition.max_score ?? 100, period: definition.period || 'weekly'
    });
  };
  const save = async () => {
    if (!businessId || !draft.name.trim()) return;
    setSaving(true); setError('');
    try {
      if (editing) await services.fleetMetrics.update(editing, draft);
      else await services.fleetMetrics.create(businessId, draft);
      setNotice(editing ? 'Metric updated.' : 'Metric created.');
      setDraft(blank); setEditing(null);
      await audit(editing ? 'fleet.performance.update' : 'fleet.performance.create', 'allowed', { businessId, metricId: editing });
      window.dispatchEvent(new CustomEvent('kleenest:fleet-updated'));
      await load();
    } catch (e) { setError(e.message || 'Unable to save Fleet metric.'); }
    finally { setSaving(false); }
  };
  const assign = async () => {
    if (!editing || !targetId) return;
    setSaving(true); setError('');
    try {
      await services.fleetMetrics.assign(editing, targetType, targetId);
      setNotice('Metric assigned.'); setTargetId('');
      window.dispatchEvent(new CustomEvent('kleenest:fleet-updated'));
      await load();
    } catch (e) { setError(e.message || 'Unable to assign Fleet metric.'); }
    finally { setSaving(false); }
  };

  const content = (
    <>
      <section className="detail-panel">
        <label className="form-field"><span>Business</span><select value={businessId} onChange={(e) => setBusinessId(e.target.value)}>{businesses.map((business) => { const id = business?.business_id || business?.id; return <option key={id} value={id}>{business?.name || business?.business_name || id}</option>; })}</select></label>
      </section>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="form-success" role="status">{notice}</p>}
      {loading ? <div className="empty-state">Loading Fleet performance…</div> : (
        <>
          <section className="reward-stats">
            <div className="reward-stat"><BarChart3 size={20}/><strong>{config.definitions.length}</strong><span>configured metrics</span></div>
            <div className="reward-stat"><strong>{values.length}</strong><span>current values</span></div>
            <div className="reward-stat"><Trophy size={20}/><strong>{leaders.length}</strong><span>ranked drivers</span></div>
            <div className="reward-stat"><Link2 size={20}/><strong>{config.assignments.length}</strong><span>assignments</span></div>
          </section>
          <section className="detail-panel">
            <div className="panel-heading"><div><span className="eyebrow">INTEROPERABILITY</span><h2>Authoritative metric sources</h2><p>Fleet metrics reference existing measurement and network primitives.</p></div><Database size={22}/></div>
            {arr(capabilities.measurement_sources).length ? <div className="business-row-grid">{arr(capabilities.measurement_sources).map((source, index) => <div className="surface-card" key={`${source.source_dataset || source.domain}-${source.metric_key || index}`}><strong>{source.metric_key || 'Metric source'}</strong><span>{source.source_dataset || source.domain || 'Source'} · {source.aggregation || 'latest'} · {source.unit || 'value'}</span><small>{source.description || 'Existing authoritative measurement source.'}</small></div>)}</div> : <p className="muted">No metric source catalog is available for this business yet.</p>}
          </section>
          {isPlatformOwner && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CONTROLLER</span><h2>{editing ? 'Edit metric' : 'Create metric'}</h2></div><ShieldCheck size={22}/></div><div className="form-grid">{[['metricKey','Metric key'],['featureCode','Feature code'],['name','Name'],['unit','Unit'],['sourceDataset','Source dataset'],['sourceMetric','Source metric'],['goal','Goal'],['threshold','Threshold'],['maxScore','Max score'],['period','Period']].map(([key, label]) => <label key={key}>{label}<input value={draft[key]} onChange={(e) => setField(key, e.target.value)}/></label>)}<label>Description<textarea value={draft.description} onChange={(e) => setField('description', e.target.value)}/></label><label>Scoring method<select value={draft.scoringMethod} onChange={(e) => setField('scoringMethod', e.target.value)}><option>threshold</option><option>linear</option><option>percentage</option></select></label></div><div className="hero-actions"><button className="primary" disabled={saving || !draft.name.trim()} onClick={save}><Save size={16}/>{saving ? 'Saving…' : editing ? 'Update metric' : 'Create metric'}</button>{editing && <button className="secondary" onClick={() => { setEditing(null); setDraft(blank); }}>Cancel</button>}</div>{editing && <div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ASSIGN</span><h3>Assign this metric</h3></div><Link2 size={18}/></div><div className="form-grid"><label>Target type<select value={targetType} onChange={(e) => setTargetType(e.target.value)}><option>driver</option><option>vehicle</option><option>route</option><option>fleet</option></select></label><label>Target ID<input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="Target UUID"/></label></div><button className="secondary" disabled={saving || !targetId} onClick={assign}>Assign metric</button></div>}</section>}
          <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">METRICS</span><h2>Current performance</h2></div></div>{values.length ? values.map((value, index) => <div className="business-row" key={idOf(value) || `${labelOf(value)}-${index}`}><div><strong>{labelOf(value)}</strong><span>{value.value ?? value.current_value ?? value.score ?? '—'} {value.unit || ''}</span></div><span className="muted">Goal: {value.goal ?? value.target ?? '—'}</span></div>) : <p className="muted">No Fleet metric values are currently available.</p>}</section>
          <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LEADERBOARD</span><h2>Driver performance</h2></div><Trophy size={22}/></div>{leaders.length ? leaders.map((value, index) => <div className="business-row" key={idOf(value) || index}><div><strong>#{value.rank || index + 1} {value.name || value.target_name || value.driver_name || 'Driver'}</strong><span>{value.metric || value.metric_name || 'safety_score'}</span></div><strong>{value.score ?? value.value ?? value.metric_value ?? '—'}</strong></div>) : <p className="muted">No driver leaderboard data is currently available.</p>}</section>
          <section className="detail-panel"><div className="panel-heading"><h2>Metric definitions</h2></div>{config.definitions.length ? config.definitions.map((definition) => <div className="business-row" key={idOf(definition) || definition.metric_key}><div><strong>{labelOf(definition)}</strong><span>{definition.description || definition.period || 'Configured Fleet metric'}</span></div>{isPlatformOwner && <button className="secondary" onClick={() => startEdit(definition)}>Edit</button>}</div>) : <p className="muted">No metric definitions returned.</p>}</section>
          <section className="detail-panel"><div className="panel-heading"><h2>Assignments</h2></div>{config.assignments.length ? config.assignments.map((assignment, index) => <div className="business-row" key={idOf(assignment) || index}><div><strong>{assignment.target_type || 'target'}</strong><span>{assignment.target_name || assignment.target_id || 'Unidentified target'}</span></div><span className="muted">{assignment.metric_name || assignment.metric_key || assignment.metric_definition_id || 'Metric'}</span></div>) : <p className="muted">No metric assignments returned.</p>}</section>
        </>
      )}
    </>
  );

  return <WorkspaceShell workspace="fleet"><section className="page business-page"><div className="page-header"><div><span className="eyebrow">FLEET · PERFORMANCE</span><h1>Fleet performance</h1><p>Configured metrics, current values, driver performance, and controller-managed assignments.</p></div><div className="hero-actions"><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Refresh</button><Link className="secondary" to="/fleet">Operations</Link><Link className="secondary" to="/fleet/intelligence">Intelligence</Link></div></div><CapabilityGate kind="fleetMetric" businessId={businessId} fallback={<div className="empty-state"><h2>Fleet performance unavailable</h2><p>Your current Fleet tier does not include metric controller access.</p><Link className="secondary" to="/fleet">Return to Fleet</Link></div>}>{content}</CapabilityGate></section></WorkspaceShell>;
}
