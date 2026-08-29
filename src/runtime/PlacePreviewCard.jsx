import React from 'react';
import { CheckCircle2, MapPin, ShieldCheck, Star } from 'lucide-react';
import { PlaceIdentity, PlaceActions, placeStatus, statusLabel, placeIconUrl } from './placeExperience.jsx';
import './PlaceExperience.css';

export default function PlacePreviewCard({ place, onDetails, onRoute, onNavigate }) {
  if (!place) return null;
  const status = placeStatus(place);
  const freshness = place.freshness_score ?? place.location_freshness_score ?? place.confidence_score;
  const reviews = place.live_review_count ?? place.review_count ?? 0;
  const photoCount = place.photo_count ?? place.photos?.length ?? 0;
  const rating = place.rating ?? place.average_rating ?? place.review_rating;
  const amenities = Array.isArray(place.amenity_labels) ? place.amenity_labels : Array.isArray(place.amenities) ? place.amenities.map(x => typeof x === 'string' ? x : x?.label || x?.name).filter(Boolean) : [];
  const photo = place.owner_photo_url || place.hero_photo_url || place.cover_photo_url || place.photo_url || placeIconUrl(place) || '';
  const activeOffer = place.active_offer || place.active_promotion || place.current_campaign || place.active_quest || place.promotion;
  return <section className="map-place-popup" aria-label={`${place.name || 'Place'} details`}>
    <div className="preview-photo-wrap">{photo ? <img className="preview-photo" src={photo} alt="" loading="eager" /> : <div className="preview-photo-fallback"><MapPin size={28}/><span>Location photo</span></div>}<span className={`preview-status preview-status-${status.key}`}>{status.key === 'verified' && <ShieldCheck size={13}/>} {statusLabel(status.key)}</span></div>
    <div className="map-place-popup-head"><PlaceIdentity place={place} size="lg"/><div className="preview-title"><h3>{place.name || place.business_name || 'Nearby place'}</h3><span>{place.brand || place.operator_name || 'Business / location'}</span></div></div>
    {place.address && <div className="map-place-popup-meta"><MapPin size={14}/>{place.address}{place.city ? `, ${place.city}` : ''}</div>}
    <div className="preview-metrics"><span><strong>{freshness != null ? Math.round(Number(freshness)) : '—'}</strong> freshness</span><span><strong>{rating != null ? Number(rating).toFixed(1) : '—'}</strong> <Star size={12}/> {reviews} reviews</span><span><strong>{photoCount}</strong> photos</span></div>
    {amenities.length > 0 && <div className="preview-amenities">{amenities.slice(0,5).map(a=><span key={a}><CheckCircle2 size={12}/>{a}</span>)}</div>}
    {activeOffer && <div className="preview-opportunity"><strong>{activeOffer.title || activeOffer.name || 'Active opportunity'}</strong><span>{activeOffer.description || activeOffer.summary || 'Available at this location now.'}</span></div>}
    <PlaceActions place={place} onDetails={onDetails} onRoute={onRoute} onNavigate={onNavigate}/>
  </section>;
}
