import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, Play, RotateCcw } from 'lucide-react';
import WorkspaceShell from './WorkspaceShell.jsx';

const CASES = [
  { id: 'home', path: '/', label: 'Home / core loop', expected: 'Landing surface renders and exposes the primary consumer and workspace actions.' },
  { id: 'map', path: '/map', label: 'Map / location intelligence', expected: 'Map loads, filters are interactive, and backend/location failures become visible status.' },
  { id: 'route', path: '/route', label: 'Route planning', expected: 'Route surface opens and reports missing or failed route data explicitly.' },
  { id: 'evidence', path: '/evidence', label: 'Evidence / verification', expected: 'Evidence workflow opens and reports identity or backend errors explicitly.' },
  { id: 'business', path: '/business', label: 'Business workspace', expected: 'Business workspace is reachable and entitlement/backend failures remain visible.' },
  { id: 'fleet', path: '/fleet', label: 'Fleet workspace', expected: 'Fleet workspace is reachable and metric/data failures remain visible.' },
  { id: 'enterprise', path: '/enterprise', label: 'Enterprise workspace', expected: 'Enterprise workspace is reachable and partner/operation failures remain visible.' },
];

const isErrorSurface = (text) => /runtime error|application hit a runtime error|failed to load|error/i.test(text);

export default function RuntimeTestLab() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({});
  const [failure, setFailure] = useState(false);
  const [selected, setSelected] = useState(CASES[0].id);
  const frameRef = useRef(null);
  const current = useMemo(() => CASES.find(test => test.id === selected) || CASES[0], [selected]);

  const routeUrl = (path) => new URL(path, new URL(import.meta.env.BASE_URL, window.location.origin)).href;

  const loadCase = (test) => new Promise((resolve) => {
    const frame = frameRef.current;
    if (!frame) return resolve({ status: 'failed', detail: 'Test frame unavailable.' });
    const timeout = window.setTimeout(() => resolve({ status: 'failed', detail: 'Route did not finish loading within 8 seconds.' }), 8000);
    frame.onload = () => {
      window.setTimeout(() => {
        window.clearTimeout(timeout);
        try {
          const text = frame.contentDocument?.body?.innerText || '';
          if (!text.trim()) return resolve({ status: 'failed', detail: 'Route loaded an empty document.' });
          if (isErrorSurface(text)) return resolve({ status: 'failed', detail: 'Route rendered an error surface.' });
          resolve({ status: 'passed', detail: 'Route rendered visible application content.' });
        } catch (error) {
          resolve({ status: 'failed', detail: `Unable to inspect route: ${error.message}` });
        }
      }, 350);
    };
    frame.onerror = () => {
      window.clearTimeout(timeout);
      resolve({ status: 'failed', detail: 'Route failed to load.' });
    };
    frame.src = routeUrl(test.path);
  });

  const runSmoke = async () => {
    setRunning(true);
    setResults({});
    const next = {};
    for (const test of CASES) {
      const result = await loadCase(test);
      next[test.id] = result;
      setResults({ ...next });
    }
    setRunning(false);
  };

  if (failure) throw new Error('TEST-LAB injected failure: canonical runtime error boundary should catch and expose this stack.');

  return (
    <WorkspaceShell>
      <main className="page" style={{ maxWidth: 1180, margin: '0 auto' }}>
        <iframe ref={frameRef} title="runtime test target" aria-hidden="true" style={{ position: 'fixed', width: 1, height: 1, opacity: 0, pointerEvents: 'none', border: 0 }} />
        <section className="hero">
          <div>
            <span className="eyebrow">RUNTIME TEST LAB</span>
            <h1>Test the app, not the mockup.</h1>
            <p>Smoke tests now load the real canonical routes and inspect the rendered application. A route that fails or renders an error is reported as failed.</p>
          </div>
          <div className="hero-actions">
            <button className="button primary" onClick={runSmoke} disabled={running}><Play size={16} />{running ? 'Running…' : 'Run smoke pass'}</button>
            <button className="button" onClick={() => { setResults({}); setSelected(CASES[0].id); }}><RotateCcw size={16} />Reset</button>
          </div>
        </section>

        <section className="detail-panel" style={{ marginTop: 20 }}>
          <div className="panel-heading"><div><span className="eyebrow">FAILURE CONTRACT</span><h2>Make failure observable</h2></div><AlertTriangle size={20} /></div>
          <p>Deliberately crash this surface. RuntimeErrorBoundary should replace the page with a diagnostic error screen.</p>
          <button className="button" onClick={() => setFailure(true)}><AlertTriangle size={16} />Inject runtime failure</button>
        </section>

        <section className="home-section" style={{ marginTop: 24 }}>
          <div className="section-heading"><div><span className="eyebrow">CANONICAL ROUTES</span><h2>Behavior smoke matrix</h2></div></div>
          <div className="home-grid">
            {CASES.map(test => {
              const result = results[test.id];
              const passed = result?.status === 'passed';
              return <button key={test.id} className="home-card" onClick={() => setSelected(test.id)} style={{ textAlign: 'left', cursor: 'pointer' }}>
                <span className="home-card-icon">{passed ? <CheckCircle2 size={21} /> : <Play size={21} />}</span>
                <div><h3>{test.label}</h3><p>{test.path} · {result?.status || 'not tested'}</p>{result?.detail && <p>{result.detail}</p>}</div>
              </button>;
            })}
          </div>
        </section>

        <section className="detail-panel" style={{ marginTop: 24 }}>
          <div className="panel-heading"><div><span className="eyebrow">SELECTED CASE</span><h2>{current.label}</h2></div><a className="text-link" href={routeUrl(current.path)}>Open <ExternalLink size={15} /></a></div>
          <p>{current.expected}</p>
          <p><strong>Route:</strong> {current.path}</p>
          <p><strong>Test principle:</strong> load the actual route, wait for client rendering, inspect its visible output, and report failures instead of assuming reachability.</p>
        </section>
      </main>
    </WorkspaceShell>
  );
}
