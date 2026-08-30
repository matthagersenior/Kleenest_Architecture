import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, BarChart3, ChevronDown, ChevronUp, Clock3, History, RefreshCw, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

const n = value => Number(value || 0);
const actionLabel = value => String(value || 'action').replaceAll('_', ' ');

export default function ReportingHistoryPage() {
  const { workspace, selectedBusinessId, services } = useAppContext();
  const scope = ['business', 'fleet', 'enterprise', 'admin', 'owner'].includes(workspace) ? workspace : 'admin';
  const [schedules, setSchedules] = useState([]);
  const [runs, setRuns] = useState([]);
  const [growthHistory, setGrowthHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await services.reporting.list(scope);
      setSchedules(rows);
      const all = await Promise.all(rows.map(schedule => services.reporting.runs(schedule.id)));
      setRuns(all.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      if (scope === 'business' && selectedBusinessId && services?.businessIntelligence?.optimizationHistory) {
        const history = await services.businessIntelligence.optimizationHistory(selectedBusinessId, 100);
        setGrowthHistory(Array.isArray(history?.actions) ? history.actions : []);
      } else {
        setGrowthHistory([]);
      }
    } catch (e) {
      setError(e.message || 'Unable to load report history.');
    } finally {
      setLoading(false);
    }
  }, [scope, selectedBusinessId, services]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const refresh = event => {
      if (scope !== 'business' || !event?.detail?.businessId || String(event.detail.businessId) === String(selectedBusinessId)) void load();
    };
    window.addEventListener('kleenest:intelligence-updated', refresh);
    window.addEventListener('kleenest:intelligence-action-completed', refresh);
    window.addEventListener('kleenest:business-updated', refresh);
    return () => {
      window.removeEventListener('kleenest:intelligence-updated', refresh);
      window.removeEventListener('kleenest:intelligence-action-completed', refresh);
      window.removeEventListener('kleenest:business-updated', refresh);
    };
  }, [load, scope, selectedBusinessId]);

  const growthSummary = useMemo(() => {
    const completed = growthHistory.filter(row => row.status === 'completed');
    return {
      total: growthHistory.length,
      completed: completed.length,
      promotions: completed.filter(row => row.asset_type === 'promotion').length,
      campaigns: completed.filter(row => row.asset_type === 'campaign').length,
    };
  }, [growthHistory]);

  return (
    <WorkspaceShell workspace={workspace}>
      <main className="page reporting-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">REPORT HISTORY</span>
            <h1>Your reporting trail.</h1>
            <p>Review generated reports and, for Business Growth, the measured context retained with operator optimization decisions.</p>
          </div>
          <div className="hero-actions">
            <Link className="secondary" to={`/${scope}/reports`}><ArrowLeft size={16}/>Reports</Link>
            <button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Refresh</button>
          </div>
        </div>

        {error && <div className="form-error reporting-alert" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}

        {scope === 'business' && (
          <section className="detail-panel reporting-history-panel business-growth-outcome-history">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">BUSINESS GROWTH 2.0 · OUTCOME HISTORY</span>
                <h2>Measured decisions, preserved.</h2>
                <p className="panel-caption">This trail records what was observed when an operator changed a promotion or campaign. It is attribution context, not a claim that the action caused later outcomes.</p>
              </div>
              <History size={22}/>
            </div>
            <div className="reward-stats">
              <div className="reward-stat"><strong>{growthSummary.total}</strong><span>traced decisions</span></div>
              <div className="reward-stat"><strong>{growthSummary.completed}</strong><span>completed</span></div>
              <div className="reward-stat"><strong>{growthSummary.promotions}</strong><span>promotion actions</span></div>
              <div className="reward-stat"><strong>{growthSummary.campaigns}</strong><span>campaign actions</span></div>
            </div>
            {loading ? (
              <div className="empty-state reporting-loading"><RefreshCw size={18}/><span>Loading growth outcome history…</span></div>
            ) : growthHistory.length ? growthHistory.slice(0, 25).map(row => {
              const measured = row.measured_outcomes || {};
              const primary = row.asset_type === 'promotion'
                ? `${n(measured.views)} views · ${n(measured.redemptions)} redemptions · ${Number(measured.conversion_rate_pct || 0).toFixed(1)}% observed conversion`
                : `${n(measured.visits)} attributed visits · ${n(measured.check_ins)} check-ins · ${n(measured.attributed_users)} attributed users`;
              return (
                <article className="management-item reporting-run" key={row.id}>
                  <div className="reporting-run-main">
                    <span>
                      <strong>{row.asset_title || row.asset_type || 'Growth asset'} · {actionLabel(row.management_action || row.action_type)}</strong>
                      <small>{row.updated_at ? new Date(row.updated_at).toLocaleString() : 'Timestamp unavailable'} · {row.status || 'suggested'}</small>
                      <small>Observed at decision time: {primary}</small>
                    </span>
                  </div>
                  <span className="tag reporting-status"><BarChart3 size={13}/>{row.asset_type || 'growth'}</span>
                </article>
              );
            }) : (
              <div className="empty-state"><History size={20}/><strong>No optimization decisions yet</strong><span>Promotion and campaign lifecycle decisions made from the Growth cockpit will appear here with their measured context.</span><Link className="secondary" to="/business/analytics">Open Growth cockpit</Link></div>
            )}
          </section>
        )}

        <section className="detail-panel reporting-history-panel">
          <div className="panel-heading"><div><span className="eyebrow">EXECUTIONS</span><h2>{runs.length} report run{runs.length === 1 ? '' : 's'}</h2></div><Clock3 size={22}/></div>
          {loading ? <div className="empty-state reporting-loading"><RefreshCw size={18}/><span>Loading report history…</span></div> : runs.length ? runs.map(run => {
            const schedule = schedules.find(item => item.id === run.schedule_id);
            const open = expanded === run.id;
            const payload = run.report_payload || {};
            return <article className={`management-item reporting-run${open ? ' expanded' : ''}`} key={run.id}><div className="reporting-run-main"><button type="button" className="unstyled-button reporting-run-toggle" aria-expanded={open} onClick={() => setExpanded(open ? null : run.id)}><span><strong>{schedule?.name || 'Scheduled report'}</strong><small>{new Date(run.created_at).toLocaleString()} · {run.status}{run.delivered_to?.length ? ` · delivered to ${run.delivered_to.join(', ')}` : ''}</small></span>{open ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</button>{open && <div className="report-payload"><div className="report-payload-heading"><strong>Report output</strong><span className="tag">{Object.keys(payload).length} fields</span></div>{Object.entries(payload).map(([key, value]) => <div className="report-metric" key={key}><span>{key.replaceAll('_', ' ')}</span><b>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</b></div>)}</div>}</div><span className="tag reporting-status">{run.status === 'sent' ? <Send size={13}/> : <Clock3 size={13}/>} {run.status}</span></article>;
          }) : <div className="empty-state"><Clock3 size={20}/><strong>No report executions yet</strong><span>Scheduled reports will appear here after the reporting scheduler runs.</span><Link className="secondary" to={`/${scope}/reports`}>Create a schedule</Link></div>}
        </section>
      </main>
    </WorkspaceShell>
  );
}
