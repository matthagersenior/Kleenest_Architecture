import { useEffect, useState } from 'react';
import { ArrowRight, Camera, CheckCircle2, HeartPulse, LoaderCircle, RefreshCw, Send, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

function Result({ body }) {
  if (!body) return null;
  const entries = Array.isArray(body) ? body : (body?.rows || body?.data || [body]);
  return <div className="state success evidence-result" role="status"><CheckCircle2 size={19}/><div><strong>Evidence added to Kleenest.</strong><div className="detail-grid">{entries.slice(0, 6).map((item, i) => <div className="metric-card" key={i}><strong>{typeof item === 'object' ? item.name || item.title || item.status || item.message || `Signal ${i + 1}` : String(item)}</strong></div>)}</div></div></div>;
}

const signals = [
  ['cleanliness', 'Cleanliness', 'How clean does it feel right now?'],
  ['accessibility', 'Accessibility', 'What should visitors with accessibility needs know?'],
  ['safety', 'Safety', 'Anything that affects comfort or safety?'],
  ['availability', 'Availability', 'Is it open and usable?'],
  ['condition', 'Condition', 'What is the overall physical condition?']
];

const truthy = value => value === true || value === 1 || value === 'true';

export default function LocationEvidencePage() {
  const { services, user } = useAppContext();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const locationId = params.get('locationId') || '';
  const [place, setPlace] = useState(null);
  const [interaction, setInteraction] = useState(null);
  const [loadingPlace, setLoadingPlace] = useState(Boolean(locationId));
  const [form, setForm] = useState({ locationId, observationType: 'condition', cleanlinessPct: '', note: '', stars: 5, cleanliness: '', accessibility: '', safety: '', availability: '', condition: '', feedback: '', checkInId: '', photoId: '' });
  const [status, setStatus] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState('');

  useEffect(() => {
    let active = true;
    if (!locationId) { setLoadingPlace(false); return undefined; }
    setLoadingPlace(true); setError('');
    Promise.all([
      services.locations.getById(locationId),
      user ? services.locations.interactionState(locationId) : Promise.resolve(null)
    ]).then(([next, state]) => {
      if (!active) return;
      setPlace(next || null);
      setInteraction(state || null);
      if (state?.latestCheckIn?.id || state?.latestCheckIn?.check_in_id) setForm(v => ({ ...v, checkInId: state.latestCheckIn.id || state.latestCheckIn.check_in_id }));
    }).catch(e => { if (active) setError(e?.message || 'Unable to load this location.'); }).finally(() => { if (active) setLoadingPlace(false); });
    return () => { active = false; };
  }, [locationId, user?.id]);

  const set = (key, value) => setForm(x => ({ ...x, [key]: value }));
  const requireContext = () => {
    if (!user) { navigate(`/auth?returnTo=${encodeURIComponent(`/evidence?locationId=${locationId}`)}`); return false; }
    if (!locationId) { setError('Open evidence from a specific location so the contribution can be attributed correctly.'); return false; }
    return true;
  };

  async function settleEvidence(result, type, rating = null) {
    await Promise.allSettled([
      services.analytics.record('location_evidence_submitted', { featureCode: 'location_evidence', subjectType: 'location', subjectId: locationId, locationId, valueNumeric: rating, metadata: { evidence_type: type, check_in_id: form.checkInId || null } }),
      services.progression.evaluateBadges(),
      services.progression.refreshMilestones()
    ]);
    window.dispatchEvent(new CustomEvent('kleenest:location-activity', { detail: { locationId, type } }));
    window.dispatchEvent(new CustomEvent('kleenest:progression-updated', { detail: { locationId, type } }));
    setStatus(result);
  }

  async function submitObservation(event) {
    event.preventDefault(); if (!requireContext()) return;
    setBusy('observation'); setError(''); setStatus(null);
    try { const result = await services.locationEvidence.restroomObservation({ locationId, checkInId: form.checkInId || null, observationType: form.observationType, cleanlinessPct: form.cleanlinessPct || null, note: form.note || null }); await settleEvidence(result, 'observation'); }
    catch (e) { setError(e?.message || String(e)); } finally { setBusy(''); }
  }

  async function submitQuality(event) {
    event.preventDefault(); if (!requireContext()) return;
    setBusy('quality'); setError(''); setStatus(null);
    try { const rating = Number(form.stars); const result = await services.locationEvidence.qualityObservation({ locationId, stars: rating, cleanliness: form.cleanliness || null, accessibility: form.accessibility || null, safety: form.safety || null, availability: form.availability || null, condition: form.condition || null, feedback: form.feedback || null, checkInId: form.checkInId || null, photoId: form.photoId || null }); await settleEvidence(result, 'quality', rating); }
    catch (e) { setError(e?.message || String(e)); } finally { setBusy(''); }
  }

  const displayName = place?.name || 'Selected location';
  const address = place?.address || [place?.city, place?.state].filter(Boolean).join(', ');
  const latestCheckIn = interaction?.latestCheckIn;
  const canUseVerifiedVisit = Boolean(interaction?.checkedIn && (latestCheckIn?.id || latestCheckIn?.check_in_id));

  return <WorkspaceShell workspace="consumer"><main className="page evidence-page">
    <section className="hero journey-hero"><div><span className="eyebrow">TRUST EVIDENCE</span><h1>Show the next visitor what is really there.</h1><p>Evidence turns a moment at a restroom into better, fresher location intelligence for everyone.</p><div className="home-trust-strip"><span><ShieldCheck size={15}/>Verified where possible</span><span><Camera size={15}/>Useful observations</span><span><Sparkles size={15}/>Progression enabled</span></div></div><div className="hero-actions"><Link className="secondary" to="/map">Back to Map</Link><Link className="secondary" to="/play/quest"><Trophy size={16}/>Trust Quests</Link></div></section>
    {error && <div className="state error" role="alert">{error}</div>}
    {status && <Result body={status}/>} 

    {!locationId && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LOCATION REQUIRED</span><h2>Start from a place</h2></div><ShieldCheck size={21}/></div><p>Evidence is tied to a canonical Kleenest location. Open a place from the map or location details first; you no longer need to enter an internal location ID manually.</p><Link className="button primary" to="/map">Find a location <ArrowRight size={15}/></Link></section>}

    {loadingPlace && <section className="detail-panel"><LoaderCircle className="spin" size={22}/><h2>Loading location context…</h2><p>Preparing the verified contribution surface.</p></section>}

    {!loadingPlace && locationId && !place && !error && <section className="detail-panel"><h2>Location unavailable</h2><p>This location could not be resolved from the canonical location service.</p><Link className="button secondary" to="/map">Return to map</Link></section>}

    {!loadingPlace && place && <>
      <section className="detail-panel evidence-context"><div><span className="eyebrow">CONTRIBUTING TO</span><h2>{displayName}</h2>{address && <p>{address}</p>}</div><div className="evidence-context-status">{canUseVerifiedVisit ? <span className="tag"><CheckCircle2 size={14}/>Verified visit attached</span> : <span className="tag">No verified visit attached</span>}</div></section>

      <section className="detail-grid evidence-choice"><button className="evidence-mode" type="button" onClick={() => document.getElementById('observation')?.scrollIntoView({ behavior: 'smooth' })}><CheckCircle2 size={23}/><strong>Quick observation</strong><span>Report what you see now with a focused signal.</span><ArrowRight size={15}/></button><button className="evidence-mode" type="button" onClick={() => document.getElementById('quality')?.scrollIntoView({ behavior: 'smooth' })}><HeartPulse size={23}/><strong>Full quality signal</strong><span>Give the location a richer cleanliness and condition assessment.</span><ArrowRight size={15}/></button></section>

      <section className="detail-grid"><form id="observation" className="detail-panel journey-card" onSubmit={submitObservation}><div className="panel-heading"><div><span className="eyebrow">QUICK SIGNAL</span><h2>What did you observe?</h2></div><CheckCircle2 size={22}/></div><label>Location<input value={displayName} readOnly aria-label="Location"/></label><label>Observation<select value={form.observationType} onChange={e => set('observationType', e.target.value)}><option value="condition">Condition</option><option value="cleanliness">Cleanliness</option><option value="availability">Availability</option><option value="safety">Safety</option></select></label><label>Cleanliness estimate %<input type="number" min="0" max="100" value={form.cleanlinessPct} onChange={e => set('cleanlinessPct', e.target.value)} placeholder="Optional"/></label><label>What should people know?<textarea rows="5" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Keep it factual and useful."/></label>{canUseVerifiedVisit ? <label>Verified visit<input value="This contribution will use your latest verified visit" readOnly/></label> : <p className="muted">Verify your visit from the location page first if you want this evidence linked to a check-in.</p>}<button className="primary" disabled={busy !== '' || !form.locationId || (!form.note && !form.cleanlinessPct)}><Send size={16}/>{busy === 'observation' ? 'Adding signal…' : 'Add observation'}</button></form>

      <form id="quality" className="detail-panel journey-card" onSubmit={submitQuality}><div className="panel-heading"><div><span className="eyebrow">QUALITY SIGNAL</span><h2>Build the fuller picture</h2></div><Sparkles size={22}/></div><p className="lead">Small details become powerful when enough visitors contribute them.</p><label>Overall experience<select value={form.stars} onChange={e => set('stars', e.target.value)}><option value="5">★★★★★ · Excellent</option><option value="4">★★★★☆ · Good</option><option value="3">★★★☆☆ · Okay</option><option value="2">★★☆☆☆ · Poor</option><option value="1">★☆☆☆☆ · Bad</option></select></label><div className="signal-grid">{signals.map(([key, label, hint]) => <label key={key}><span>{label}</span><small>{hint}</small><input value={form[key]} onChange={e => set(key, e.target.value)} placeholder="Your signal" inputMode="numeric"/></label>)}</div><label>Anything else?<textarea rows="4" value={form.feedback} onChange={e => set('feedback', e.target.value)} placeholder="Helpful context, without personal information."/></label>{canUseVerifiedVisit && <span className="tag"><CheckCircle2 size={14}/>Latest verified visit will be attached automatically</span>}<button className="primary" disabled={busy !== '' || !form.locationId}>{busy === 'quality' ? 'Publishing signal…' : 'Publish quality signal'} <ArrowRight size={15}/></button></form></section>
    </>}

    <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">AFTER YOU CONTRIBUTE</span><h2>Keep the trust loop moving</h2></div><RefreshCw size={20}/></div><div className="contribution-grid"><Link className="contribution-card" to={locationId ? `/place/${encodeURIComponent(locationId)}` : '/map'}><ShieldCheck size={20}/><strong>Return to location</strong><span>See how your contribution fits into the location story.</span></Link><Link className="contribution-card" to="/play/quest"><Trophy size={20}/><strong>Continue a Trust Quest</strong><span>Your real-world activity can advance active quests.</span></Link><Link className="contribution-card" to="/activity"><Sparkles size={20}/><strong>See progression</strong><span>Check rewards, XP, and recent contributions.</span></Link></div></section>
  </main></WorkspaceShell>;
}
