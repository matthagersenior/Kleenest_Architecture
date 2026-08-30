import { Component } from 'react';

export default class RuntimeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#f8fafc', color: '#111827' }}>
        <section style={{ maxWidth: 760, margin: '8vh auto', padding: '2rem', background: '#fff', borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,.08)' }}>
          <p style={{ fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.75rem' }}>Kleenest Architecture</p>
          <h1 style={{ marginTop: 0 }}>The application hit a runtime error.</h1>
          <p>The deployment is alive, but a client-side module failed while starting. This screen replaces a blank page so the failure is diagnosable.</p>
          <pre style={{ overflow: 'auto', whiteSpace: 'pre-wrap', padding: '1rem', background: '#f1f5f9', borderRadius: 12 }}>{String(this.state.error?.stack || this.state.error?.message || this.state.error)}</pre>
          <button type="button" className="button primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Reload</button>
        </section>
      </main>
    );
  }
}
