import { MapPin, Navigation, Route, ExternalLink } from 'lucide-react';

export const placeIconUrl = (place) => place?.logo_url || place?.business_logo_url || place?.icon_url || place?.photo_url || place?.image_url || null;
export const placeStatus = (place) => {
  if (place?.is_verified || place?.verified) return 'verified';
  if (place?.is_open === true || place?.open_now === true) return 'open';
  if (place?.is_premium || place?.premium) return 'premium';
  if (place?.community_reported || place?.reported) return 'reported';
  return 'unknown';
};
export const statusLabel = (status) => ({ verified:'Verified', open:'Open now', premium:'Premium', reported:'Community reported', unknown:'Status unknown' }[status] || 'Status unknown');
export function PlaceIdentity({ place, size='md' }) {
  const url = placeIconUrl(place);
  return url ? <img className={`place-identity place-identity-${size}`} src={url} alt="" loading="lazy" /> : <span className={`place-identity place-identity-${size} place-identity-fallback`}><MapPin size={size==='lg'?24:18}/></span>;
}
export function PlaceActions({ place, onDetails, onRoute, onNavigate }) {
  const id = place?.location_id || place?.id;
  const navigate = () => onNavigate ? onNavigate(place) : window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.latitude},${place.longitude}`)}`,'_blank','noopener,noreferrer');
  return <div className="place-actions">
    <button className="primary place-action-primary" onClick={navigate}><Navigation size={16}/>Open / Navigate</button>
    <button className="secondary" onClick={()=>onRoute?.(place)}><Route size={16}/>Add to route</button>
    <button className="secondary" onClick={()=>onDetails?.(id)}><ExternalLink size={16}/>Details</button>
  </div>;
}
