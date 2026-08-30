import AiAssistPanel from './AiAssistPanel.jsx';
import LocationTrustSignalsPanel from './LocationTrustSignalsPanel.jsx';

export default function LocationEvidenceInterpretation({ place, bathroom, reviews = [] }) {
  if (!place) return null;
  const locationId=place.location_id||place.id;
  const trust = place.trust || {
    score: place.trust_score ?? place.location_confidence_score ?? place.intelligence_score ?? null,
    freshness: place.trust_freshness_score ?? null,
    staleness: place.trust_staleness_status ?? null,
    lastVerifiedAt: place.trust_last_verified_at ?? null,
    reverificationDueAt: place.trust_reverification_due_at ?? null,
    evidenceCount: place.evidence_count ?? null
  };
  const provenance = place.source_provenance || {
    source: place.source || null,
    dataset: place.source_dataset || null,
    external_id: place.external_location_id || null
  };
  return <>
    <LocationTrustSignalsPanel locationId={locationId}/>
    <AiAssistPanel
      task="evidence_interpretation"
      context={{
        location: { id: locationId, name: place.name || null, verified: Boolean(place.is_verified || place.verified) },
        trust,
        provenance,
        bathroom: bathroom ? { status: bathroom.status, confidence: bathroom.confidence, evidenceCount: bathroom.evidenceCount, accessLabel: bathroom.accessLabel } : null,
        reviews: (Array.isArray(reviews) ? reviews : []).slice(0, 8).map(review => ({ rating: review.rating ?? review.stars ?? null, verified: Boolean(review.verified || review.check_in_id), created_at: review.created_at || null, body: review.body || review.comment || null }))
      }}
      title="Evidence confidence guide"
      description="Explains what the current Kleenest evidence supports and where a fresh verified visit would help most."
      instruction="Explain the current confidence and freshness in plain language for a visitor. Identify which signals are well-supported and which need fresh verification. Only call something contradictory when opposing supplied facts explicitly conflict. Do not change or declare the canonical verification state."
      actionLabel="Interpret evidence"
    />
  </>;
}
