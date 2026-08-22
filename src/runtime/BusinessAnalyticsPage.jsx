import { useEffect, useState } from 'react';
import { BarChart3, MessageSquare, RefreshCw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

const arr = value => Array.isArray(value) ? value : [];
const obj = value => value && typeof value === 'object' ? value : {};
const first = value => arr(value)[0] || null;
const pretty = value => typeof value === 'number' ? value.toLocaleString() : value == null ? '—' : String(value);

function Stat({ label, value }) { return <div className="reward-stat"><strong>{pretty(value)}</strong><span>{label}</span></div>; }

export default function BusinessAnalyticsPage({ mode = 'analytics' }) {
  const { services, user } = useAppContext();
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [reviews, setReviews] = useState({});
  const [growth, setGrowth] = useState({});
  const [roi, setRoi] = useState({});
  const [engagement, setEngagement] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState({});
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const businesses = arr(await services.business.listBusinesses());
      const current = businesses[0] || null;
      setBusiness(current);
      if (!current) return;
      const id = current.business_id || current.id;
      const [a, r, g, ro, e] = await Promise.all([
        services.business.analytics(id), services.business.reviewAnalytics(id),
        services.business.growthAnalytics(id), services.business.roiAnalytics(id),
        services.business.engagementAnalytics(id)
      ]);
      setAnalytics(obj(a)); setReviews(obj(r)); setGrowth(obj(g)); setRoi(obj(ro)); setEngagement(obj(e));
    } catch (e) { setError(e.message || 'Unable to load business analytics.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) void load(); else setLoading(false); }, [user]);

  const sendReply = async reviewId => {
    const id = business?.business_id || business?.id;
    const text = String(reply[reviewId] || '').trim();
    if (!id || !text) return;
    try { await services.business.replyToReview(id, reviewId, text); setReply(v => ({ ...v, [reviewId]: '' })); setMessage('Review reply saved.'); await load(); }
    catch (e) { setError(e.message || 'Unable to save review reply.'); }
  };

  if (!user) return <WorkspaceShell workspace="business"><section className="empty-state"><h2>Sign in to view business analytics</h2><Link className="primary" to="/auth">Sign in</Link></section></WorkspaceShell>;
  if (loading) return <WorkspaceShell workspace="business"><section className="empty-state">Loading business analytics…</section></WorkspaceShell>;
  if (!business) return <WorkspaceShell workspace="business"><section className="empty-state"><h2>No business account</h2><Link className="secondary" to="/business/manage">Manage business</Link></section></WorkspaceShell>;

  const reviewRows = arr(reviews.reviews || reviews.items || reviews.data);
  return <WorkspaceShell workspace="business"><section className="page business-page">
    <div className="page-header"><div><span className="eyebrow">BUSINESS ANALYTICS</span><h1>{mode === 'reviews' ? 'Reviews & reputation' : 'Performance analytics'}</h1><p>Live production analytics from the canonical Business RPC surface.</p></div><div className="hero-actions"><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button><Link className="secondary" to="/business/manage">Manage assets</Link></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
    <section className="reward-stats"><Stat label="Check-ins" value={analytics.check_ins ?? analytics.total_check_ins}/><Stat label="Visitors" value={analytics.visitors ?? analytics.total_visitors}/><Stat label="Reviews" value={reviews.total_reviews ?? reviews.review_count}/><Stat label="Rating" value={reviews.average_rating ?? reviews.avg_rating}/><Stat label="ROI" value={roi.roi ?? roi.return_on_investment}/></section>
    {mode === 'reviews' ? <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">REPUTATION</span><h2>Customer reviews</h2></div><MessageSquare size={22}/></div>{reviewRows.length ? reviewRows.map(r => <article className="business-row" key={r.id || r.review_id}><div><strong>{r.rating ? `${r.rating}/5` : 'Review'}</strong><span>{r.comment || r.text || r.content || 'No comment'}</span><small>{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</small></div><div><textarea aria-label="Reply" value={reply[r.id || r.review_id] || ''} onChange={e => setReply(v => ({ ...v, [r.id || r.review_id]: e.target.value }))} placeholder="Reply to customer"/><button className="secondary compact" onClick={() => sendReply(r.id || r.review_id)}>Reply</button></div></article>) : <p className="muted">No review rows were returned by the production analytics contract.</p>}</section> : <><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">GROWTH</span><h2>Growth performance</h2></div><TrendingUp size={22}/></div><div className="reward-stats"><Stat label="Growth" value={growth.growth_rate ?? growth.growth}/><Stat label="New visitors" value={growth.new_visitors}/><Stat label="Repeat visitors" value={growth.repeat_visitors}/><Stat label="Engagement" value={engagement.engagement_rate ?? engagement.rate}/></div></section><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ANALYTICS</span><h2>Operational signals</h2></div><BarChart3 size={22}/></div><pre className="analytics-json">{JSON.stringify({ analytics, roi, engagement }, null, 2)}</pre></section></>}
  </section></WorkspaceShell>;
}
