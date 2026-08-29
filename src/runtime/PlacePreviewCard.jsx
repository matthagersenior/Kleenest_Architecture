import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PlaceIdentity, PlaceActions, placeStatus, statusLabel } from './placeExperience.jsx';
import './PlaceExperience.css';

export default function PlacePreviewCard({ place, onDetails, onRoute, onNavigate }) {
  if (!place) return null;
  const status = placeStatus(place);
  const freshness = place.freshness_score ?? place.confidence_score;
  const reviews = place.live_review_count ?? place.review_count ?? 0;
  const photoCount = place.photo_count ?? 0;
  return <section className="map-place-popup" aria-label={`${place.name || 'Place'} details`}>
    <div className="map-place-popup-head">
      <PlaceIdentity place={place} size="lg" />
      <div><h3>{place.name || place.business_name || 'Nearby place'}</h3>
        <span className={`place-status place-status-${status}`}>{status === 'verified' && <ShieldCheck size={13}/>} {statusLabel(status)}</span>
      </div>
    </div>
    {place.address && <div className="map-place-popup-meta">{place.address}{place.city ? `, ${place.city}` : ''}</div>}
    <div className="map-place-popup-meta">{freshness != null ? `Freshness ${Math.round(Number(freshness))}` : 'Freshness pending'} · {reviews} reviews · {photoCount} photos</div>
    <PlaceActions place={place} onDetails={onDetails} onRoute={onRoute} onNavigate={onNavigate}/>
  </section>;
}
