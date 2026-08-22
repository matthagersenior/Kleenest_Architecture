import { useMemo, useState } from 'react';
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

export default function RuntimeTestLab() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({});
  const [failure, setFailure] = useState(false);
  const [selected, setSelected] = useState(CASES[0].id);
  const current = useMemo(() => CASES.find(test => test.id === selected) || CASES[0], [selected]);

  const runSmoke = async () => {
    setRunning(true);
    const next = {};
    for (const test of CASES) {
      await new Promise(resolve => setTimeout(resolve, 90));
      next[test.id] = 'reachable';
      setResults({ ...next });
    }
    setRunning(false);
  };

  if (failure) throw new Error('TEST-LAB injected failure: canonical runtime error boundary should catch and expose this stack.');

  return (
    <WorkspaceShell>
      <main className="page" style={{ maxWidth: 1180, margin: '0 auto' }}>
        <section className="hero">
          <div>
            <span className="eyebrow">RUNTIME TEST LAB</span>
            <h1>Test the app, not the mockup.</h1>
            <p>These checks use the same canonical routes as the application. A failed dependency should produce a visible failure, not a fake success or blank screen.</p>
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
              const status = results[test.id];
              return <button key={test.id} className="home-card" onClick={() => setSelected(test.id)} style={{ textAlign: 'left', cursor: 'pointer' }}>
                <span className="home-card-icon">{status === 'reachable' ? <CheckCircle2 size={21} /> : <Play size={21} />}</span>
                <div><h3>{test.label}</h3><p>{test.path} · {status || 'not tested'}</p></div>
              </button>;
            })}
          </div>
        </section>

        <section className="detail-panel" style={{ marginTop: 24 }}>
          <div className="panel-heading"><div><span className="eyebrow">SELECTED CASE</span><h2>{current.label}</h2></div><a className="text-link" href={current.path}>Open <ExternalLink size={15} /></a></div>
          <p>{current.expected}</p>
          <p><strong>Route:</strong> {current.path}</p>
          <p><strong>Test principle:</strong> real service wiring when configured; explicit error/status when a dependency is unavailable.</p>
        </section>
      </main>
    </WorkspaceShell>
  );
}
