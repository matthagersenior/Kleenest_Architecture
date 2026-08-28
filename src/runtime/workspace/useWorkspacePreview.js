import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductTier } from '../../architecture/productModel.js';

export const PREVIEW_TIERS = Object.freeze([
  'free', 'premium', 'family', 'fleet', 'enterprise',
  'business_standard', 'business_growth', 'business_fleet', 'business_enterprise',
]);

export const PREVIEW_WORKSPACE = Object.freeze({
  free: 'consumer', premium: 'consumer', family: 'consumer', fleet: 'fleet', enterprise: 'enterprise',
  business_standard: 'business', business_growth: 'business', business_fleet: 'fleet', business_enterprise: 'enterprise',
});

export const PREVIEW_LABEL = Object.freeze({
  free: 'Free', premium: 'Premium', family: 'Family', fleet: 'Fleet User', enterprise: 'Enterprise User',
  business_standard: 'Business Standard', business_growth: 'Business Growth', business_fleet: 'Business Fleet', business_enterprise: 'Business Enterprise',
});

export function readStoredPreview(routePreview) {
  if (typeof window === 'undefined') return null;
  if (routePreview && PREVIEW_TIERS.includes(routePreview)) {
    try { window.sessionStorage.setItem('kleenest.ownerPreview', routePreview); } catch {}
    return routePreview;
  }
  try {
    const saved = window.sessionStorage.getItem('kleenest.ownerPreview');
    return PREVIEW_TIERS.includes(saved) ? saved : null;
  } catch { return null; }
}

export function clearStoredPreview() {
  try { window.sessionStorage.removeItem('kleenest.ownerPreview'); } catch {}
}

export function previewPath(path, preview) {
  if (!preview) return path;
  const [base, hash] = String(path).split('#');
  const join = base.includes('?') ? '&' : '?';
  return `${base}${join}preview=${encodeURIComponent(preview)}${hash ? `#${hash}` : ''}`;
}

export function useWorkspacePreview({ owner, workspace, routePreview }) {
  const navigate = useNavigate();
  const previewTier = owner && workspace !== 'owner' ? readStoredPreview(routePreview) : null;
  const previewProduct = previewTier ? getProductTier(previewTier) : null;
  const effectiveWorkspace = previewTier ? (PREVIEW_WORKSPACE[previewTier] || 'consumer') : (workspace === 'owner' ? 'admin' : workspace);
  const exitPreview = useCallback(() => {
    clearStoredPreview();
    navigate('/owner/preview');
  }, [navigate]);
  return { previewTier, previewProduct, effectiveWorkspace, previewing: Boolean(previewTier), exitPreview };
}
