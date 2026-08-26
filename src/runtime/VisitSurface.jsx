import { useRef, useState } from 'react';
import { CheckCircle2, MapPin, QrCode, Star, Trophy, Zap, Ticket, Camera, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';

function Result({ result }) {
  if (result === null) return null;
  const rows = Array.isArray(result) ? result : (result?.rows || result?.data || [result]);
  return <section className="detail-panel journey-result" role="status">
    <div className="panel-heading"><div><span className="eyebrow">CONFIRMED</span><h2>Your visit is in the network</h2></div><CheckCircle2 size={24} /></div>
    <div className="detail-grid">{rows.slice(0, 6).map((row, i) => <div className="metric-card" key={i}>{typeof row === 'object' ? Object.entries(row).slice(0, 5).map(([k, v]) => <span key={k}><strong>{k.replaceAll('_', ' ')}:</strong> {typeof v === 'object' ? String(v?.name || v?.title || 'Updated') : String(v ?? '—')}</span>) : <strong>{String(row)}</strong>}</div>)}</div>
  </section>;
}

export default function VisitSurface() {
  const { services, user } = useAppContext();
  const [p] = useSearchParams();
  const [locationId, setLocationId] = useState(p.get('locationId') || '');
  const [placeId, setPlaceId] = useState(p.get('placeId') || '');
  const [qr, setQr] = useState(p.get('qr') || '');
  const [checkIn, setCheckIn] = useState(null);
  const [review, setReview] = useState({ stars: 5, comment: '' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const operationRef = useRef(0);

  const begin = key => {
    const token = operationRef.current + 1;
    operationRef.current = token;
    setBusy(key); setError('');
    return token;
  };
  const current = token => operationRef.current === token;

  const run = async (key, fn) => {
    const token = begin(key);
    try {
      const data = await fn(token);
      if (current(token)) setResult(data);
      return data;
    } catch (e) {
      if (current(token)) setError(e?.message || 'We could not complete that action.');
      return null;
    } finally {
      if (current(token)) setBusy('');
    }
  };

  const settleCheckIn = async (data, token) => {
    const normalized = Array.isArray(data) ? data[0] : data;
    const nextLocationId = normalized?.location_id || normalized?.locationId || '';
    const nextPlaceId = normalized?.place_id || normalized?.placeId || '';
    const resolvedLocationId = nextLocationId || locationId || '';
    const checkInId = normalized?.id || normalized?.check_in_id || normalized?.checkin_id;
    const [rewards] = await Promise.all([
      checkInId ? services.progression.checkinRewards(checkInId) : Promise.resolve(null),
      resolvedLocationId ? services.analytics.checkIn(resolvedLocationId, { checkInId, pointsAwarded: Number(normalized?.points_awarded || normalized?.points || 0) }) : Promise.resolve(null),
    ]);
    if (!current(token)) return rewards || data;
    if (nextLocationId) setLocationId(String(nextLocationId));
    if (nextPlaceId) setPlaceId(String(nextPlaceId));
    setCheckIn(normalized);
    window.dispatchEvent(new CustomEvent('kleenest:checkin-completed', { detail: { checkInId, locationId: resolvedLocationId } }));
    return rewards || data;
  };

  const doQr = () => run('qr', async token => settleCheckIn(await services.checkins.byQr({ placeId, qrToken: qr }), token));
  const doSingleUse = () => run('single', () => services.qr.consumeSingleUse(qr));
  const doRedeem = () => run('redeem', () => services.qr.redeem(qr));
  const doGps = () => run('gps', async token => {
    if (!navigator.geolocation) throw new Error('Location services are unavailable.');
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const data = await services.checkins.byGps({ latitude: coords.latitude, longitude: coords.longitude, locationId: locationId || null });
            resolve(await settleCheckIn(data, token));
          } catch (e) { reject(e); }
        },
        () => reject(new Error('Location permission is required for GPS verification.')),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 },
      );
    });
  });

  const submitReview = () => run('review', async token => {
    const resolvedLocationId = locationId || checkIn?.location_id || checkIn?.locationId;
    if (!resolvedLocationId) throw new Error('A canonical location is required before publishing a review.');
    const checkInId = checkIn?.id || checkIn?.check_in_id;
    const stars = Number(review.stars);
    const comment = review.comment.trim();
    const data = await services.reviews.create({ locationId: resolvedLocationId, checkInId, stars, comment });
    const reviewRow = Array.isArray(data) ? data[0] : data;
    const reviewId = reviewRow?.id || reviewRow?.review_id;
    await Promise.all([
      services.analytics.reviewSubmitted(resolvedLocationId, { reviewId, rating: stars }),
      reviewId ? services.progression.reviewRewards(reviewId) : Promise.resolve(null),
    ]);
    if (current(token)) window.dispatchEvent(new CustomEvent('kleenest:rewards-updated', { detail: { reviewId, locationId: resolvedLocationId } }));
    return data;
  });

  if (!user) return <WorkspaceShell workspace="consumer"><section className="empty-state"><ShieldCheck size={28} /><h2>Your verified visit starts here</h2><p>Sign in to check in, contribute trusted evidence, review locations, and earn progression.</p><Link className="primary" to="/auth">Sign in to continue <ArrowRight size={15} /></Link></section></WorkspaceShell>;

  return <WorkspaceShell workspace="consumer"><main className="page visit-page">
    <section className="hero journey-hero"><div><span className="eyebrow">TRUST JOURNEY</span><h1>Turn this visit into something useful.</h1><p>Verify where you are, tell the network what you found, and leave the next visitor better information.</p><div className="journey-steps"><span className={checkIn ? 'complete' : ''}>1 · Verify</span><ArrowRight size={14} /><span className={checkIn ? 'active' : ''}>2 · Contribute</span><ArrowRight size={14} /><span>3 · Earn</span></div></div><div className="hero-actions"><Link className="secondary" to="/map"><MapPin size={16} />Find a location</Link><Link className="secondary" to="/play"><Trophy size={16} />Rewards</Link></div></section>
    {error && <div className="state error" role="alert">{error}</div>}
    {checkIn && <div className="state success"><CheckCircle2 size={18} /><div><strong>Visit verified.</strong><span>Your contribution is now synchronized with Kleenest progression.</span></div></div>}
    <section className="visit-grid">
      <section className="detail-panel journey-card"><div className="panel-heading"><div><span className="eyebrow">STEP 1</span><h2>Verify your visit</h2></div><MapPin size={22} /></div><p className="lead">Use GPS when you are at the location, or scan its Kleenest QR.</p>{locationId && <div className="metric-card"><strong>Location selected</strong><span>Ready for verification</span></div>}{placeId && <div className="metric-card"><strong>QR place linked</strong><span>Ready to scan</span></div>}<label>QR token<input value={qr} onChange={e => setQr(e.target.value)} placeholder="Scan a Kleenest QR code" /></label><div className="button-row"><button className="primary" disabled={busy !== '' || !placeId || !qr} onClick={doQr}><QrCode size={16} />{busy === 'qr' ? 'Verifying…' : 'Verify with QR'}</button><button className="secondary" disabled={busy !== ''} onClick={doGps}><MapPin size={16} />{busy === 'gps' ? 'Locating…' : 'Verify with GPS'}</button></div><details className="advanced-actions"><summary>Other QR options</summary><div className="button-row"><button className="secondary" disabled={busy !== '' || !qr} onClick={doSingleUse}><Ticket size={15} />Single-use QR</button><button className="secondary" disabled={busy !== '' || !qr} onClick={doRedeem}>Redeem QR</button></div></details></section>
      <section className="detail-panel journey-card"><div className="panel-heading"><div><span className="eyebrow">STEP 2</span><h2>Tell the next visitor</h2></div><Star size={22} /></div><p className="lead">A verified review carries more trust because it is grounded in a real visit.</p><label>How was it?<select value={review.stars} onChange={e => setReview(v => ({ ...v, stars: Number(e.target.value) }))}><option value="5">★★★★★ · Excellent</option><option value="4">★★★★☆ · Good</option><option value="3">★★★☆☆ · Okay</option><option value="2">★★☆☆☆ · Poor</option><option value="1">★☆☆☆☆ · Bad</option></select></label><label>Your experience<textarea rows="6" value={review.comment} onChange={e => setReview(v => ({ ...v, comment: e.target.value }))} placeholder="What should someone know before they go?" /></label><button className="primary" disabled={busy !== '' || !checkIn || !(locationId || checkIn?.location_id) || !review.comment.trim()} onClick={submitReview}>{busy === 'review' ? 'Publishing…' : 'Publish verified review'} <ArrowRight size={15} /></button><p className="muted">Verify first, then your review can enter the trusted community record.</p></section>
    </section>
    {result && <Result result={result} />}
    <section className="detail-panel journey-next"><div className="panel-heading"><div><span className="eyebrow">STEP 3</span><h2>Keep the momentum</h2></div><Sparkles size={21} /></div><div className="contribution-grid"><Link className="contribution-card" to={`/evidence?locationId=${encodeURIComponent(locationId || checkIn?.location_id || '')}`}><Camera size={20} /><strong>Add evidence</strong><span>Capture cleanliness, accessibility, safety, amenities, or condition.</span></Link><Link className="contribution-card" to="/play/quest"><Trophy size={20} /><strong>Trust Quests</strong><span>Turn useful activity into progression and rewards.</span></Link><Link className="contribution-card" to="/activity"><Zap size={20} /><strong>See your progress</strong><span>Follow what your contributions are doing for the network.</span></Link></div></section>
  </main></WorkspaceShell>;
}
