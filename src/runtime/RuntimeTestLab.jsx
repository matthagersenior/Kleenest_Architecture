import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, Play, RotateCcw } from 'lucide-react';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';

const ROUTE_CASES = [
  { id: 'home', path: '/', label: 'Home / core loop', expected: 'Landing surface renders and exposes the primary consumer and workspace actions.' },
  { id: 'map', path: '/map', label: 'Map / location intelligence', expected: 'Map loads and backend/location failures become visible status.' },
  { id: 'route', path: '/route', label: 'Route planning', expected: 'Route surface opens and reports missing or failed route data explicitly.' },
  { id: 'evidence', path: '/evidence', label: 'Evidence / verification', expected: 'Evidence workflow opens and reports identity or backend errors explicitly.' },
  { id: 'business', path: '/business', label: 'Business workspace', expected: 'Business workspace is reachable and entitlement/backend failures remain visible.' },
  { id: 'fleet', path: '/fleet', label: 'Fleet workspace', expected: 'Fleet workspace is reachable and metric/data failures remain visible.' },
  { id: 'enterprise', path: '/enterprise', label: 'Enterprise workspace', expected: 'Enterprise workspace is reachable and partner/operation failures remain visible.' },
];

const CONTRACT_CASES = [
  { id: 'checkin-auth', label: 'Check-in authentication contract', run: async services => { try { await services.checkins.byQr({ placeId: 'test', qrToken: 'test' }); return { status: 'failed', detail: 'Unexpectedly accepted an unauthenticated check-in.' }; } catch (error) { return { status: 'passed', detail: `Real check-in service rejected the request: ${error.message}` }; } } },
  { id: 'checkin-input', label: 'Check-in input validation', run: async services => { try { await services.checkins.byQr({}); return { status: 'failed', detail: 'Invalid check-in input was accepted.' }; } catch (error) { return { status: 'passed', detail: `Invalid input rejected: ${error.message}` }; } } },
  { id: 'review-input', label: 'Review validation contract', run: async services => { try { await services.reviews.create({}); return { status: 'failed', detail: 'Invalid review input was accepted.' }; } catch (error) { return { status: 'passed', detail: `Invalid review rejected: ${error.message}` }; } } },
];

const isErrorSurface = text => /runtime error|application hit a runtime error|failed to load|error/i.test(text);

export default function RuntimeTestLab() {
  const { services, configured, user } = useAppContext();
  const [running, setRunning] = useState(false);
  const [contractRunning, setContractRunning] = useState(false);
  const [results, setResults] = useState({});
  const [contracts, setContracts] = useState({});
  const [failure, setFailure] = useState(false);
  const [selected, setSelected] = useState(ROUTE_CASES[0].id);
  const frameRef = useRef(null);
  const current = useMemo(() => ROUTE_CASES.find(test => test.id === selected) || ROUTE_CASES[0], [selected]);

  const routeUrl = path => new URL(path, new URL(import.meta.env.BASE_URL, window.location.origin)).href;

  const loadCase = test => new Promise(resolve => {
    const frame = frameRef.current;
    if (!frame) return resolve({ status: 'failed', detail: 'Test frame unavailable.' });
    const timeout = window.setTimeout(() => resolve({ status: 'failed', detail: 'Route did not finish loading within 8 seconds.' }), 8000);
    frame.onload = () => window.setTimeout(() => {
      window.clearTimeout(timeout);
      try {
        const text = frame.contentDocument?.body?.innerText || '';
        if (!text.trim()) return resolve({ status: 'failed', detail: 'Route loaded an empty document.' });
        if (isErrorSurface(text)) return resolve({ status: 'failed', detail: 'Route rendered an error surface.' });
        resolve({ status: 'passed', detail: 'Route rendered visible application content.' });
      } catch (error) { resolve({ status: 'failed', detail: `Unable to inspect route: ${error.message}` }); }
    }, 350);
    frame.onerror = () => { window.clearTimeout(timeout); resolve({ status: 'failed', detail: 'Route failed to load.' }); };
    frame.src = routeUrl(test.path);
  });

  const runSmoke = async () => {
    setRunning(true); setResults({}); const next = {};
    for (const test of ROUTE_CASES) { const result = await loadCase(test); next[test.id] = result; setResults({ ...next }); }
    setRunning(false);
  };

  const runContracts = async () => {
    if (!services) { setContracts({ runtime: { status: 'failed', detail: 'Supabase services are not configured.' } }); return; }
    setContractRunning(true); setContracts({}); const next = {};
    for (const test of CONTRACT_CASES) { next[test.id] = await test.run(services); setContracts({ ...next }); }
    setContractRunning(false);
  };

  if (failure) throw new Error('TEST-LAB injected failure: canonical runtime error boundary should catch and expose this stack.');

  return <WorkspaceShell>
    <main className="page" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <iframe ref={frameRef} title="runtime test target" aria-hidden="true" style={{ position: 'fixed', width: 1, height: 1, opacity: 0, pointerEvents: 'none', border: 0 }} />
      <section className="hero">
        <div><span className="eyebrow">RUNTIME TEST LAB</span><h1>Test the app, not the mockup.</h1><p>These tests exercise the deployed application and the real domain services. Failures stay visible.</p></div>
        <div className="hero-actions"><button className="button primary" onClick={runSmoke} disabled={running}><Play size={16} />{running ? 'Running…' : 'Run route pass'}</button><button className="button" onClick={() => { setResults({}); setContracts({}); setSelected(ROUTE_CASES[0].id); }}><RotateCcw size={16} />Reset</button></div>
      </section>

      <section className="detail-panel" style={{ marginTop: 20 }}>
        <div className="panel-heading"><div><span className="eyebrow">REAL SERVICE CONTRACTS</span><h2>Exercise backend behavior</h2></div><CheckCircle2 size={20} /></div>
        <p>Configured: <strong>{configured ? 'yes' : 'no'}</strong> · Session: <strong>{user ? 'signed in' : 'anonymous'}</strong>. These checks call the actual check-in and review services and expect their real validation/auth failures.</p>
        <button className="button primary" onClick={runContracts} disabled={contractRunning || !configured}><Play size={16} />{contractRunning ? 'Running…' : 'Run service contracts'}</button>
        <div className="home-grid" style={{ marginTop: 16 }}>{CONTRACT_CASES.map(test => { const result = contracts[test.id]; return <div key={test.id} className="home-card"><span className="home-card-icon">{result?.status === 'passed' ? <CheckCircle2 size={21} /> : <Play size={21} />}</span><div><h3>{test.label}</h3><p>{result?.status || 'not tested'}</p>{result?.detail && <p>{result.detail}</p>}</div></div>; })}</div>
      </section>

      <section className="detail-panel" style={{ marginTop: 20 }}>
        <div className="panel-heading"><div><span className="eyebrow">FAILURE CONTRACT</span><h2>Make failure observable</h2></div><AlertTriangle size={20} /></div>
        <p>Deliberately crash this surface. RuntimeErrorBoundary should replace the page with a diagnostic error screen.</p>
        <button className="button" onClick={() => setFailure(true)}><AlertTriangle size={16} />Inject runtime failure</button>
      </section>

      <section className="home-section" style={{ marginTop: 24 }}>
        <div className="section-heading"><div><span className="eyebrow">CANONICAL ROUTES</span><h2>Behavior smoke matrix</h2></div></div>
        <div className="home-grid">{ROUTE_CASES.map(test => { const result = results[test.id]; return <button key={test.id} className="home-card" onClick={() => setSelected(test.id)} style={{ textAlign: 'left', cursor: 'pointer' }}><span className="home-card-icon">{result?.status === 'passed' ? <CheckCircle2 size={21} /> : <Play size={21} />}</span><div><h3>{test.label}</h3><p>{test.path} · {result?.status || 'not tested'}</p>{result?.detail && <p>{result.detail}</p>}</div></button>; })}</div>
      </section>

      <section className="detail-panel" style={{ marginTop: 24 }}><div className="panel-heading"><div><span className="eyebrow">SELECTED CASE</span><h2>{current.label}</h2></div><a className="text-link" href={routeUrl(current.path)}>Open <ExternalLink size={15} /></a></div><p>{current.expected}</p><p><strong>Route:</strong> {current.path}</p><p><strong>Test principle:</strong> execute the actual route or service, inspect the result, and report failure rather than assuming success.</p></section>
    </main>
  </WorkspaceShell>;
}
