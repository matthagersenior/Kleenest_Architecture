import AiAssistPanel from './AiAssistPanel.jsx';

export default function VerifiedReviewDraft({ checkIn, locationId, stars, cleanliness, observation, note, onApply }) {
  if (!checkIn || !locationId) return null;
  const hasEvidence = Boolean(observation || String(note || '').trim());
  return <AiAssistPanel
    task="visit_review"
    context={{
      verified: true,
      location_id: locationId,
      check_in_id: checkIn?.id || checkIn?.check_in_id || null,
      stars: Number(stars || 5),
      cleanliness_pct: cleanliness == null ? null : Number(cleanliness),
      observation: observation || null,
      note: String(note || '').trim() || null
    }}
    title="Verified review draft"
    description="Drafts review wording only from this verified visit and the facts you entered. You can edit it before publishing."
    instruction={hasEvidence ? 'Write a concise first-person review using only the supplied visit facts. Do not invent amenities, wait times, staff behavior, accessibility, cleanliness details, or conditions that were not supplied.' : 'Draft a very short first-person review using only the supplied rating and cleanliness score. Make uncertainty clear and do not invent any visit details.'}
    actionLabel="Draft review"
    applyLabel="Use draft"
    onApply={onApply}
  />;
}
