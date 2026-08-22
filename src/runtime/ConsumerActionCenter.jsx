import { useState } from 'react';
import { useAppContext } from '../AppContext.jsx';

function Result({ value }) {
  if (value == null) return null;
  return <pre style={{whiteSpace:'pre-wrap',overflow:'auto',marginTop:12}}>{typeof value === 'string' ? value : JSON.stringify(value,null,2)}</pre>;
}

export default function ConsumerActionCenter({ locationId = '', placeId = '', qrToken = '' }) {
  const { services } = useAppContext();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  async function run(action) {
    setBusy(true); setError(null);
    try { setResult(await action()); } catch (e) { setError(e?.message || String(e)); } finally { setBusy(false); }
  }

  return <section className="capability-panel">
    <h2>Bathroom service loop</h2>
    <p>One verified visit can feed check-in, review, evidence, progression, rewards and network intelligence.</p>
    <div className="action-grid">
      <button disabled={busy || !placeId || !qrToken} onClick={() => run(() => services.checkins.byQr({placeId,qrToken}))}>Check in with QR</button>
      <button disabled={busy || !qrToken} onClick={() => run(() => services.qr.redeem(qrToken))}>Redeem QR</button>
      <button disabled={busy || !locationId} onClick={() => run(() => services.locationEvidence.bathroomStatus(locationId))}>Bathroom trust status</button>
      <button disabled={busy || !placeId} onClick={() => run(() => services.locationEvidence.restroomIntelligence(placeId))}>Restroom intelligence</button>
    </div>
    <div className="form-grid">
      <label>Rating <input type="number" min="1" max="5" value={rating} onChange={e=>setRating(e.target.value)}/></label>
      <label>Review <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="What should the next visitor know?"/></label>
      <button disabled={busy || !locationId} onClick={() => run(() => services.reviews.create({locationId,stars:rating,comment}))}>Rate & review</button>
      <button disabled={busy || !locationId} onClick={() => run(() => services.locationEvidence.qualityObservation({locationId,stars:rating,feedback:comment}))}>Submit quality signal</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {busy && <p>Working…</p>}
    <Result value={result}/>
  </section>;
}
