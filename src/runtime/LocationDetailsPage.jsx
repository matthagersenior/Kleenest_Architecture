import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Heart, MapPin, Navigation, ShieldCheck, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';

export default function LocationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { services, user } = useAppContext();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [interaction, setInteraction] = useState(null);
  const [bathroomStatus, setBathroomStatus] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    const nextPlace = await services.locations.getById(id);
    if (!nextPlace) { setPlace(null); return; }
    setPlace(nextPlace);
    const locationId = nextPlace.location_id || nextPlace.id;
    const jobs = [services.locations.reviews(locationId), services.locationEvidence.bathroomStatus(locationId)];
    if (user) jobs.push(services.locations.interactionState(locationId));
    const results = await Promise.all(jobs);
    setReviews(results[0] || []);
    setBathroomStatus(results[1] || null);
    setInteraction(user ? results[2] || null : null);
    void services.locations.recordView(locationId);
  };

  useEffect(() => { let active = true; (async () => { try { await load(); } catch (e) { if (active) setError(e.message || 'Unable to load this location.'); } })(); return () => { active = false; }; }, [id, user?.id]);

  const requireLogin = () => { if (!user) { navigate('/auth'); return false; } return true; };
  const locationId = place?.location_id || place?.id;

  const checkIn = async () => {
    if (!requireLogin() || !place?.latitude || !place?.longitude) return;
    setBusy('checkin'); setMessage('');
    try {
      const data = await services.checkins.fromMap({ locationId, latitude: place.latitude, longitude: place.longitude });
      const row = Array.isArray(data) ? data[0] : data;
      setInteraction(v => ({ ...(v || {}), checkedIn: true, latestCheckIn: row || null }));
      setMessage(`Check-in recorded${row?.points_awarded != null ? ` · +${row.points_awarded} points` : ''}.`);
    } catch (e) { setError(e.message || 'Unable to check in.'); }
    finally { setBusy(''); }
  };

  const toggleFavorite = async () => {
    if (!requireLogin()) return;
    setBusy('favorite'); setMessage('');
    try { const result = await services.favorites.toggle(locationId); setInteraction(v => ({ ...(v || {}), favorited: Boolean(result?.favorite ?? result?.favorited) })); setMessage(Boolean(result?.favorite ?? result?.favorited) ? 'Saved to favorites.' : 'Removed from favorites.'); }
    catch (e) { setError(e.message || 'Unable to update favorite.'); }
    finally { setBusy(''); }
  };

  const arrival = async () => {
    if (!requireLogin()) return;
    setBusy('arrival'); setMessage('');
    try { await services.analytics.arrival(locationId, { source: 'place-details' }); setMessage('Arrival recorded.'); }
    catch (e) { setError(e.message || 'Unable to record arrival.'); }
    finally { setBusy(''); }
  };

  const directions = async () => {
    if (!requireLogin()) return;
    setBusy('directions'); setMessage('');
    try {
      await services.analytics.directionsRequested(locationId, { source: 'place-details', mode: 'driving' });
      const destination = `${place.latitude},${place.longitude}`;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank', 'noopener,noreferrer');
      setMessage('Directions opened.');
    } catch (e) { setError(e.message || 'Unable to open directions.'); }
    finally { setBusy(''); }
  };

  const verifyBathroom = async value => {
    if (!requireLogin()) return;
    setBusy('verify'); setMessage('');
    try {
      const data = await services.locationEvidence.trustedBathroomVerification({ locationId, hasPublicBathroom: value, latitude: place.latitude, longitude: place.longitude, distanceMeters: 0 });
      setBathroomStatus(Array.isArray(data) ? data[0] : data); setMessage(value ? 'Public bathroom verification submitted.' : 'No-public-bathroom report submitted.');
    } catch (e) { setError(e.message || 'Unable to submit verification.'); }
    finally { setBusy(''); }
  };

  const submitReview = async e => {
    e.preventDefault();
    if (!requireLogin()) return;
    if (!comment.trim()) return;
    setBusy('review'); setMessage('');
    try {
      const checkInId = interaction?.latestCheckIn?.id || interaction?.latestCheckIn?.check_in_id || null;
      const result = await services.reviews.create({ locationId, checkInId, stars: rating, comment: comment.trim() });
      setComment(''); setReviews(await services.locations.reviews(locationId)); setMessage('Review published.');
      const reviewId = Array.isArray(result) ? result[0]?.id : result?.id;
      if (reviewId) void services.progression.reviewRewards(reviewId).catch(() => null);
    } catch (e) { setError(e.message || 'Unable to publish review.'); }
    finally { setBusy(''); }
  };

  if (error && !place) return <WorkspaceShell workspace="consumer"><section className="empty-state"><h2>Location unavailable</h2><p>{error}</p><Link className="primary" to="/map">Back to map</Link></section></WorkspaceShell>;
  if (!place) return <WorkspaceShell workspace="consumer"><section className="empty-state"><p>Loading location intelligence…</p></section></WorkspaceShell>;

  const restroom = place.category === 'restroom';
  const score = place.intelligence_score ?? place.location_confidence_score ?? null;
  const verified = place.is_verified || place.verified;
  return <WorkspaceShell workspace="consumer"><section className="page business-page"><button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16}/>Back</button><div className="details-hero"><div className="details-image" aria-hidden="true"><MapPin size={38}/></div><div><span className="eyebrow">{restroom ? 'BATHROOM' : 'LOCAL PLACE'}</span><h1>{place.name}</h1><div className="hero-actions"><span className="tag">{String(place.category || 'service').replaceAll('_', ' ')}</span>{verified && <span className="tag"><ShieldCheck size={14}/>Verified</span>} {score != null && <span className="tag">{Math.round(score)}/100 intelligence</span>}</div><p>{place.description || 'A location in the canonical Kleenest network.'}</p><p className="muted">{place.address || [place.city, place.state].filter(Boolean).join(', ') || 'Address unavailable'}</p><div className="hero-actions"><button className="primary" onClick={checkIn} disabled={busy !== ''}><CheckCircle2 size={16}/>{busy === 'checkin' ? 'Checking in…' : 'Check in · Earn points'}</button><button className="secondary" onClick={directions} disabled={busy !== ''}><Navigation size={16}/>Directions</button><button className="secondary" onClick={arrival} disabled={busy !== ''}><MapPin size={16}/>I'm here</button><button className="secondary" onClick={toggleFavorite} disabled={busy !== ''}><Heart size={16} fill={interaction?.favorited ? 'currentColor' : 'none'}/>{interaction?.favorited ? 'Saved' : 'Save'}</button></div></div></div>{(error || message) && <div className={`state ${error ? 'error' : 'success'}`} role="status">{error || message}</div>}<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">LOCATION INTELLIGENCE</span><h2>What Kleenest knows</h2></div><ShieldCheck size={22}/></div><div className="business-insights"><div><strong>{score == null ? '—' : Math.round(score)}</strong><span>intelligence score</span></div><div><strong>{place.bathroom_verification_count ?? place.verification_observation_count ?? 0}</strong><span>verification signals</span></div><div><strong>{place.bathroom_positive_count ?? place.verification_positive_count ?? 0}</strong><span>positive signals</span></div><div><strong>{place.review_count ?? reviews.length}</strong><span>reviews</span></div></div><p className="muted">{place.intelligence_freshness_label || place.last_observed_at ? `Latest observation: ${place.intelligence_freshness_label || new Date(place.last_observed_at).toLocaleDateString()}.` : 'Community and source signals update as new visits and observations arrive.'}</p>{restroom && <div className="hero-actions"><button className="secondary" disabled={busy !== ''} onClick={() => verifyBathroom(true)}>✓ Verify public bathroom</button><button className="secondary" disabled={busy !== ''} onClick={() => verifyBathroom(false)}>Report no public bathroom</button>{bathroomStatus?.status && <span className="tag">Bathroom: {String(bathroomStatus.status).replaceAll('_', ' ')}</span>}</div>}<div className="hero-actions"><Link className="secondary" to={`/evidence?locationId=${encodeURIComponent(locationId)}`}>Add evidence</Link><Link className="secondary" to={`/check-in?locationId=${encodeURIComponent(locationId)}&placeId=${encodeURIComponent(place.id)}`}>Open visit workflow</Link><Link className="secondary" to="/activity">Activity</Link><Link className="secondary" to="/play">Progression</Link><Link className="secondary" to="/leaderboards">Leaderboard</Link></div></section><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">COMMUNITY</span><h2>Reviews</h2></div><Star size={22}/></div>{reviews.length ? reviews.map(review => <article className="business-row" key={review.id}><div><strong>{'★'.repeat(Number(review.rating || review.stars || 0))}{'☆'.repeat(Math.max(0, 5 - Number(review.rating || review.stars || 0)))}</strong><span>{review.body || review.comment || 'No written comment.'}</span><small>{review.profiles?.display_name || 'Kleenest member'} · {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}</small></div></article>) : <div className="empty-state"><p>No reviews yet. Be the first verified visitor to contribute.</p></div>}<form className="detail-panel" onSubmit={submitReview}><h3>Leave a verified review</h3><label>Rating<select value={rating} onChange={e => setRating(Number(e.target.value))}><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Okay</option><option value="2">2 — Poor</option><option value="1">1 — Bad</option></select></label><label>Review<textarea rows="4" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share what the next visitor should know." required/></label><button className="primary" disabled={busy !== '' || !interaction?.checkedIn}>{busy === 'review' ? 'Publishing…' : 'Publish review'}</button>{!interaction?.checkedIn && <p className="muted">Complete a verified check-in before publishing a review.</p>}</form></section></section></WorkspaceShell>;
}
