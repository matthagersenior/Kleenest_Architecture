import { CheckCircle2, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const number = value => value == null || value === '' ? null : Number(value);
const trustOf = place => place?.trust || {
  score: place?.trust_score ?? place?.location_confidence_score ?? place?.intelligence_score ?? null,
  freshness: place?.trust_freshness_score ?? null,
  evidenceCount: place?.evidence_count ?? null,
  staleness: place?.trust_staleness_status ?? null
};
const rows = value => Array.isArray(value) ? value : Array.isArray(value?.rows) ? value.rows : value && typeof value === 'object' ? [value] : [];

export default function TrustContributionImpact({ beforePlace, afterPlace, badgesResult, milestonesResult }) {
  if (!afterPlace) return null;
  const before = trustOf(beforePlace), after = trustOf(afterPlace);
  const beforeScore = number(before?.score), afterScore = number(after?.score);
  const beforeEvidence = number(before?.evidenceCount ?? before?.evidence_count), afterEvidence = number(after?.evidenceCount ?? after?.evidence_count);
  const beforeFreshness = number(before?.freshness), afterFreshness = number(after?.freshness);
  const scoreDelta = beforeScore != null && afterScore != null ? afterScore - beforeScore : null;
  const evidenceDelta = beforeEvidence != null && afterEvidence != null ? afterEvidence - beforeEvidence : null;
  const freshnessDelta = beforeFreshness != null && afterFreshness != null ? afterFreshness - beforeFreshness : null;
  const badgeRows = rows(badgesResult);
  const milestoneRows = rows(milestonesResult);
  const gainedBadges = badgeRows.filter(row => row?.earned || row?.awarded || row?.new || row?.earned_at || row?.badge_id || row?.badge_code);
  const reachedMilestones = milestoneRows.filter(row => row?.achieved || row?.awarded || row?.new || row?.achieved_at || Number(row?.points_awarded || 0) > 0);
  const changed = [scoreDelta, evidenceDelta, freshnessDelta].some(delta => delta != null && delta !== 0);
  return <section className="detail-panel trust-contribution-impact" aria-live="polite">
    <div className="panel-heading"><div><span className="eyebrow">TRUST IMPACT</span><h2>Your contribution is now part of the location record.</h2><p>These values come from a fresh read of the canonical location authority after your evidence was accepted.</p></div><ShieldCheck size={22}/></div>
    <div className="reward-stats">
      <div className="reward-stat"><strong>{afterScore ?? '—'}</strong><span>trust score{scoreDelta != null && scoreDelta !== 0 ? ` · ${scoreDelta > 0 ? '+' : ''}${scoreDelta.toFixed(1)}` : ''}</span></div>
      <div className="reward-stat"><strong>{afterEvidence ?? '—'}</strong><span>evidence signals{evidenceDelta != null && evidenceDelta !== 0 ? ` · ${evidenceDelta > 0 ? '+' : ''}${evidenceDelta}` : ''}</span></div>
      <div className="reward-stat"><strong>{afterFreshness ?? '—'}</strong><span>freshness{freshnessDelta != null && freshnessDelta !== 0 ? ` · ${freshnessDelta > 0 ? '+' : ''}${freshnessDelta.toFixed(1)}` : ''}</span></div>
      <div className="reward-stat"><strong>{after?.staleness || after?.staleness_status || 'current'}</strong><span>freshness state</span></div>
    </div>
    {!changed && <p className="muted"><CheckCircle2 size={14}/> Contribution recorded. Some trust aggregates update only when enough authoritative signals accumulate, so unchanged scores are valid.</p>}
    {(gainedBadges.length > 0 || reachedMilestones.length > 0) && <div className="detail-grid">
      {gainedBadges.length > 0 && <div className="metric-card"><Trophy size={18}/><strong>{gainedBadges.length} badge outcome{gainedBadges.length === 1 ? '' : 's'}</strong><span>{gainedBadges.map(row => row?.name || row?.badge_code || row?.code || 'Badge').slice(0,3).join(' · ')}</span></div>}
      {reachedMilestones.length > 0 && <div className="metric-card"><Sparkles size={18}/><strong>{reachedMilestones.length} milestone outcome{reachedMilestones.length === 1 ? '' : 's'}</strong><span>{reachedMilestones.map(row => row?.milestone_key || row?.name || 'Milestone').slice(0,3).join(' · ')}</span></div>}
    </div>}
    <div className="hero-actions"><Link className="button primary" to="/play/quest">Continue a Trust Quest</Link><Link className="button secondary" to="/activity">See progression</Link></div>
  </section>;
}
