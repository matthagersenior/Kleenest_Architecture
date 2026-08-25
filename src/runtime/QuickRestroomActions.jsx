import { useState } from 'react';
import { CheckCircle2, Crosshair, Crown, Navigation, Sparkles, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import './QuickRestroomActions.css';

const number = (value) => { const n = Number(value); return Number.isFinite(n) ? n : null; };
const freshnessScore = (place) => { const raw = place.updated_at || place.last_verified_at || place.last_reviewed_at || place.created_at; const time = raw ? Date.parse(raw) : NaN; return Number.isFinite(time) ? time : 0; };
const ratingScore = (place) => number(place.rating ?? place.average_rating ?? place.stars ?? place.cleanliness_rating) ?? 0;
const cleanlinessScore = (place) => number(place.cleanliness_pct ?? place.cleanliness_score ?? place.kleenest_score ?? place.trust_score) ?? 0;
const verificationScore = (place) => number(place.bathroom_verification_count ?? place.verification_count ?? place.verification_confidence) ?? (place.is_verified ? 1 : 0);
const distanceScore = (place) => number(place.distance_meters ?? (number(place.distance_km) != null ? number(place.distance_km) * 1000 : place.distance)) ?? Number.POSITIVE_INFINITY;
function bestOf(places, mode) {
  const rows = places.filter((p) => p?.id || p?.location_id).slice();
  if (mode === 'closest') return rows.sort((a, b) => distanceScore(a) - distanceScore(b))[0];
  if (mode === 'cleanest') return rows.sort((a, b) => cleanlinessScore(b) - cleanlinessScore(a) || distanceScore(a) - distanceScore(b))[0];
  if (mode === 'verified') return rows.sort((a, b) => verificationScore(b) - verificationScore(a) || freshnessScore(b) - freshnessScore(a) || distanceScore(a) - distanceScore(b))[0];
  if (mode === 'highest') return rows.sort((a, b) => ratingScore(b) - ratingScore(a) || distanceScore(a) - distanceScore(b))[0];
  if (mode === 'freshest') return rows.sort((a, b) => freshnessScore(b) - freshnessScore(a) || distanceScore(a) - distanceScore(b))[0];
  return rows.sort((a, b) => cleanlinessScore(b) - cleanlinessScore(a) || verificationScore(b) - verificationScore(a) || ratingScore(b) - ratingScore(a) || freshnessScore(b) - freshnessScore(a) || distanceScore(a) - distanceScore(b))[0];
}

export default function QuickRestroomActions() {
  const navigate = useNavigate();
  const { services, configured } = useAppContext();
  const [busy, setBusy] = useState('');
  const [status, setStatus] = useState('');
  const go = (mode, label) => {
    if (!configured || !services?.maps?.nearby) return setStatus('Kleenest location services are not configured yet.');
    if (!navigator.geolocation) return setStatus('Location access is unavailable. Open the map to search manually.');
    setBusy(mode); setStatus(`Finding the ${label.toLowerCase()} restroom nearby…`);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const rows = await services.maps.nearby({ latitude: coords.latitude, longitude: coords.longitude, radiusKm: 15, category: 'restroom', limit: 500, discover: true });
        const place = bestOf(rows, mode);
        if (!place) throw new Error('No restroom locations were found within 15 km.');
        const id = place.location_id || place.id;
        const name = place.name || place.brand || 'Kleenest restroom';
        navigate(`/route?origin=${encodeURIComponent(`${coords.latitude},${coords.longitude}`)}&destination=${encodeURIComponent(name)}&locationId=${encodeURIComponent(id)}`);
      } catch (error) { setStatus(error?.message || 'We could not find a nearby restroom.'); }
      finally { setBusy(''); }
    }, (error) => { setBusy(''); setStatus(error?.code === 1 ? 'Location permission was denied. Enable it to use Quick Find.' : 'We could not determine your location.'); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  };
  return <section className="detail-panel quick-restroom-panel">
    <div className="panel-heading"><div><span className="eyebrow">QUICK FIND</span><h2>Need a restroom now?</h2><p>Pick the signal that matters most and Kleenest will build the route from your current location.</p></div><Crosshair size={22}/></div>
    <div className="quick-restroom-grid">
      <button className="quick-restroom-card" disabled={Boolean(busy)} onClick={() => go('closest', 'Closest')}><span><Navigation size={19}/></span><strong>{busy === 'closest' ? 'Finding…' : 'Closest'}</strong><small>Shortest trip to a restroom</small></button>
      <button className="quick-restroom-card" disabled={Boolean(busy)} onClick={() => go('cleanest', 'Cleanest')}><span><Sparkles size={19}/></span><strong>{busy === 'cleanest' ? 'Finding…' : 'Cleanest'}</strong><small>Highest cleanliness signal nearby</small></button>
      <button className="quick-restroom-card" disabled={Boolean(busy)} onClick={() => go('verified', 'Most verified')}><span><CheckCircle2 size={19}/></span><strong>{busy === 'verified' ? 'Finding…' : 'Most verified'}</strong><small>Strongest verification signal nearby</small></button>
      <button className="quick-restroom-card" disabled={Boolean(busy)} onClick={() => go('highest', 'Highest rated')}><span><Star size={19}/></span><strong>{busy === 'highest' ? 'Finding…' : 'Highest rated'}</strong><small>Best community rating nearby</small></button>
      <button className="quick-restroom-card featured" disabled={Boolean(busy)} onClick={() => go('kleenest', 'Kleenest')}><span><Crown size={19}/></span><strong>{busy === 'kleenest' ? 'Finding…' : 'KLEENEST'}</strong><small>Best combined cleanliness, trust, rating and freshness</small></button>
      <button className="quick-restroom-card" disabled={Boolean(busy)} onClick={() => go('freshest', 'Freshest')}><span><Zap size={19}/></span><strong>{busy === 'freshest' ? 'Finding…' : 'Freshest'}</strong><small>Most recently verified signal</small></button>
    </div>
    {status && <div className="state" role="status"><Sparkles size={15}/>{status}</div>}
  </section>;
}
