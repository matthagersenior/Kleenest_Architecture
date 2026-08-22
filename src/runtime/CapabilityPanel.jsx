import { useEffect, useState } from 'react';

export default function CapabilityPanel({ title, description, load, action, actionLabel = 'Refresh', renderData }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async () => { setBusy(true); setError(null); try { setData(await load()); } catch (e) { setError(e); } finally { setBusy(false); } };
  useEffect(() => { void run(); }, []);
  const runAction = async () => { if (!action) return; setBusy(true); setError(null); try { await action(); await run(); } catch (e) { setError(e); } finally { setBusy(false); } };
  return <section className="panel capability-panel"><div className="panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button type="button" className="button secondary" disabled={busy} onClick={run}>{busy ? 'Loading…' : 'Refresh'}</button></div>{error && <div className="state error" role="alert">{error.message || 'Unable to complete this operation.'}</div>}{!error && data !== null && (renderData ? renderData(data) : <pre className="data-preview">{JSON.stringify(data, null, 2)}</pre>)}{action && <button type="button" className="button primary" disabled={busy} onClick={runAction}>{busy ? 'Working…' : actionLabel}</button>}</section>;
}

export function MetricGrid({ items = [] }) {
  const rows = Array.isArray(items) ? items : Object.entries(items || {}).map(([label, value]) => ({ label, value }));
  return <div className="metric-grid">{rows.slice(0, 12).map((item, index) => <div className="metric" key={item.id || item.label || index}><span>{item.label || item.name || `Metric ${index + 1}`}</span><strong>{item.value ?? item.count ?? item.total ?? '—'}</strong></div>)}</div>;
}

export function ActionForm({ title, fields, submitLabel = 'Save', onSubmit }) {
  const initial = Object.fromEntries(fields.map(field => [field.name, field.defaultValue ?? '']));
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const submit = async event => { event.preventDefault(); setBusy(true); setMessage(null); setError(null); try { await onSubmit(values); setMessage('Saved successfully.'); setValues(initial); } catch (e) { setError(e.message || 'Unable to save.'); } finally { setBusy(false); } };
  return <form className="action-form" onSubmit={submit}><h3>{title}</h3>{fields.map(field => field.type === 'textarea' ? <label key={field.name}>{field.label}<textarea required={field.required !== false} rows={field.rows || 5} value={values[field.name]} onChange={e => setValues(v => ({ ...v, [field.name]: e.target.value }))} placeholder={field.placeholder || ''} /></label> : <label key={field.name}>{field.label}<input required={field.required !== false} type={field.type || 'text'} value={values[field.name]} onChange={e => setValues(v => ({ ...v, [field.name]: e.target.value }))} placeholder={field.placeholder || ''} /></label>)}{error && <div className="state error" role="alert">{error}</div>}{message && <div className="state success" role="status">{message}</div>}<button type="submit" className="button primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button></form>;
}
