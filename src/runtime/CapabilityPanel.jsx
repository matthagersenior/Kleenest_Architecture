import { useEffect, useState } from 'react';

export default function CapabilityPanel({ title, description, load, action, actionLabel = 'Refresh', renderData }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async () => { setBusy(true); setError(null); try { setData(await load()); } catch (e) { setError(e); } finally { setBusy(false); } };
  useEffect(() => { void run(); }, []);
  return <section className="panel capability-panel"><div className="panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="button secondary" disabled={busy} onClick={run}>{busy ? 'Loading…' : actionLabel}</button></div>{error && <div className="state error">{error.message || 'Unable to load this capability.'}</div>}{!error && data !== null && (renderData ? renderData(data) : <pre className="data-preview">{JSON.stringify(data, null, 2)}</pre>)}{action && <button className="button primary" disabled={busy} onClick={async () => { setBusy(true); setError(null); try { await action(); await run(); } catch (e) { setError(e); } finally { setBusy(false); } }}>{actionLabel === 'Refresh' ? 'Run action' : actionLabel}</button>}</section>;
}

export function MetricGrid({ items = [] }) {
  const rows = Array.isArray(items) ? items : Object.entries(items || {}).map(([label, value]) => ({ label, value }));
  return <div className="metric-grid">{rows.slice(0, 12).map((item, index) => <div className="metric" key={item.id || item.label || index}><span>{item.label || item.name || `Metric ${index + 1}`}</span><strong>{item.value ?? item.count ?? item.total ?? '—'}</strong></div>)}</div>;
}
