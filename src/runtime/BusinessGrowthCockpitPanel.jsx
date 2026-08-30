import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  MessageSquare,
  Minus,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';

const n = value => Number(value || 0);

function Delta({ value }) {
  const x = n(value);
  return (
    <span className="muted">
      {x > 0 ? <ArrowUpRight size={13} /> : x < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}
      {' '}{x > 0 ? '+' : ''}{x}
    </span>
  );
}

export default function BusinessGrowthCockpitPanel({ businessId }) {
  const { services } = useAppContext();
  const [data, setData] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!businessId || !services?.businessIntelligence?.cockpit) return;
    setLoading(true);
    setError('');
    try {
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 86400000);
      const [cockpit, assets] = await Promise.all([
        services.businessIntelligence.cockpit(businessId, 30),
        services.businessIntelligence.assetPerformance?.(
          businessId,
          start.toISOString(),
          end.toISOString(),
        ) ?? null,
      ]);
      setData(cockpit);
      setPerformance(assets);
    } catch (e) {
      setError(e?.message || 'Unable to load Business Growth cockpit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [businessId]);

  useEffect(() => {
    const refresh = e => {
      if (!e?.detail?.businessId || String(e.detail.businessId) === String(businessId)) void load();
    };
    window.addEventListener('kleenest:business-updated', refresh);
    window.addEventListener('kleenest:intelligence-action-completed', refresh);
    return () => {
      window.removeEventListener('kleenest:business-updated', refresh);
      window.removeEventListener('kleenest:intelligence-action-completed', refresh);
    };
  }, [businessId]);

  const traceAssetAction = async ({ assetType, asset, action, mutate }) => {
    const key = `${assetType}:${asset.id}:${action}`;
    setBusy(key);
    setError('');
    setMessage('');
    let actionId = null;
    try {
      const link = await services.intelligenceActions.createLink(
        asset.location_id ?? null,
        businessId,
        'business',
        'growth_asset_performance',
        action,
        {
          asset_type: assetType,
          asset_id: asset.id,
          measured_window_days: 30,
          measured_outcomes: asset,
          source: 'business_growth_cockpit',
        },
      );
      actionId = link?.id || link?.action_id || null;
      if (actionId) await services.intelligenceActions.execute(actionId);
      const result = await mutate();
      if (actionId) {
        await services.intelligenceActions.complete(actionId, {
          asset_type: assetType,
          asset_id: asset.id,
          completed_action: action,
          asset_result: result,
          source_signal: 'growth_asset_performance',
        });
      }
      const detail = { businessId, assetType, assetId: asset.id, action, actionId, result };
      window.dispatchEvent(new CustomEvent('kleenest:intelligence-action-completed', { detail }));
      window.dispatchEvent(new CustomEvent('kleenest:business-updated', {
        detail: { ...detail, reason: 'growth-asset-managed' },
      }));
      setMessage(`${assetType === 'promotion' ? 'Promotion' : 'Campaign'} ${action.replaceAll('_', ' ')} completed and linked to its measured outcomes.`);
      await load();
    } catch (e) {
      setError(e?.message || 'Unable to manage this growth asset.');
    } finally {
      setBusy(null);
    }
  };

  const managePromotion = (promotion, active) => traceAssetAction({
    assetType: 'promotion',
    asset: promotion,
    action: active ? 'activate_promotion' : 'deactivate_promotion',
    mutate: () => services.business.managePromotion(
      businessId,
      promotion.id,
      active ? 'update' : 'deactivate',
      active ? { active: true } : {},
    ),
  });

  const manageCampaign = (campaign, status) => traceAssetAction({
    assetType: 'campaign',
    asset: campaign,
    action: status === 'active' ? 'activate_campaign' : 'pause_campaign',
    mutate: () => services.business.updateCampaign(businessId, campaign.id, {
      name: campaign.name,
      type: campaign.campaign_type,
      goal: campaign.goal,
      status,
    }),
  });

  const current = data?.current || {};
  const change = data?.delta || {};
  const promos = data?.promotions || {};
  const campaigns = data?.campaigns || {};
  const events = data?.events || {};
  const reviews = data?.reviews || {};
  const actions = Array.isArray(data?.growth_actions?.actions)
    ? data.growth_actions.actions.filter(Boolean)
    : [];
  const promotionRows = Array.isArray(performance?.promotions) ? performance.promotions : [];
  const campaignRows = Array.isArray(performance?.campaigns) ? performance.campaigns : [];

  const cards = useMemo(() => [
    ['Check-ins', current.check_ins, change.check_ins],
    ['Unique customers', current.unique_users, change.unique_users],
    ['Reviews', current.reviews, change.reviews],
    ['New customers', current.new_users, change.new_users],
  ], [current, change]);

  return (
    <section className="detail-panel business-growth-cockpit">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">BUSINESS GROWTH 2.0 · 30 DAYS</span>
          <h2>Growth cockpit</h2>
          <p className="muted">Current performance versus the previous 30-day window, with protected asset-level attribution and operator-controlled lifecycle actions.</p>
        </div>
        <TrendingUp size={21} />
      </div>

      <div className="hero-actions">
        <button className="secondary compact" type="button" onClick={load} disabled={loading || busy !== null}>
          <RefreshCw size={14} />{loading ? 'Refreshing…' : 'Refresh growth'}
        </button>
        <Link className="secondary compact" to="/business/intelligence">Open intelligence</Link>
        <Link className="secondary compact" to="/business/manage">Manage growth assets</Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}

      <div className="reward-stats">
        {cards.map(([label, value, d]) => (
          <div className="reward-stat" key={label}>
            <strong>{n(value)}</strong>
            <span>{label}</span>
            <Delta value={d} />
          </div>
        ))}
      </div>

      <div className="business-grid">
        <section className="detail-panel">
          <div className="panel-heading"><h3>Offers & campaigns</h3><Target size={18} /></div>
          <div className="business-row">
            <strong>{n(promos.active_promotions)} active promotions</strong>
            <span>{n(promos.promotion_views)} views · {n(promos.redemptions)} redemptions · {Number(promos.conversion_rate_pct || 0).toFixed(1)}% conversion</span>
          </div>
          <div className="business-row">
            <strong>{n(campaigns.active_campaigns)} active campaigns</strong>
            <span>{n(campaigns.outcome_visits)} attributed visits · {n(campaigns.outcome_check_ins)} check-ins · {n(campaigns.attributed_users)} attributed users</span>
          </div>
        </section>

        <section className="detail-panel">
          <div className="panel-heading"><h3>Events & reputation</h3><CalendarDays size={18} /></div>
          <div className="business-row">
            <strong>{n(events.events)} events</strong>
            <span>{n(events.rsvps)} RSVPs · {n(events.event_views)} tracked views</span>
          </div>
          <div className="business-row">
            <strong>{n(reviews.period_reviews ?? reviews.reviews)} reviews</strong>
            <span>{Number(reviews.average_rating || 0).toFixed(2)} average rating · {n(reviews.business_replies)} business replies</span>
          </div>
        </section>
      </div>

      <section className="detail-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">CLOSED-LOOP PERFORMANCE</span>
            <h3>Growth asset outcomes</h3>
            <p className="muted">Kleenest shows measured outcomes; activation and pause decisions remain with the business operator.</p>
          </div>
          <BarChart3 size={18} />
        </div>

        {promotionRows.slice(0, 4).map(p => {
          const key = `promotion:${p.id}:${p.active ? 'deactivate_promotion' : 'activate_promotion'}`;
          return (
            <article className="business-row" key={`promotion:${p.id}`}>
              <div>
                <strong>{p.title || 'Promotion'}</strong>
                <span>{n(p.views)} views · {n(p.redemptions)} redemptions · {Number(p.conversion_rate_pct || 0).toFixed(1)}% conversion</span>
              </div>
              <button className="secondary compact" type="button" disabled={busy !== null} onClick={() => managePromotion(p, !p.active)}>
                {busy === key ? 'Working…' : p.active ? 'Deactivate' : 'Activate'}
              </button>
            </article>
          );
        })}

        {campaignRows.slice(0, 4).map(c => {
          const nextStatus = c.status === 'active' ? 'paused' : 'active';
          const action = nextStatus === 'active' ? 'activate_campaign' : 'pause_campaign';
          const key = `campaign:${c.id}:${action}`;
          return (
            <article className="business-row" key={`campaign:${c.id}`}>
              <div>
                <strong>{c.name || 'Campaign'}</strong>
                <span>{n(c.visits)} visits · {n(c.check_ins)} check-ins · {n(c.attributed_users)} attributed users · {n(c.qr_attribution_events)} QR events</span>
              </div>
              <button className="secondary compact" type="button" disabled={busy !== null} onClick={() => manageCampaign(c, nextStatus)}>
                {busy === key ? 'Working…' : nextStatus === 'active' ? 'Activate' : 'Pause'}
              </button>
            </article>
          );
        })}

        {!promotionRows.length && !campaignRows.length && (
          <p className="muted">No growth assets have performance data in this window yet.</p>
        )}
      </section>

      <section className="detail-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">NEXT BEST ACTIONS</span><h3>Growth opportunities</h3></div>
          <MessageSquare size={18} />
        </div>
        {actions.length ? actions.map((a, i) => (
          <article className="business-row" key={`${a.type || 'action'}:${i}`}>
            <div>
              <strong>{a.title || 'Growth opportunity'}</strong>
              <span>{a.priority ? `${String(a.priority).toUpperCase()} priority · ` : ''}{String(a.type || 'business growth').replaceAll('_', ' ')}</span>
            </div>
            <Link className="secondary compact" to={a.type === 'promotion' ? '/business/manage' : '/business/intelligence'}>Act</Link>
          </article>
        )) : <p className="muted">No baseline growth actions are currently required.</p>}
      </section>
    </section>
  );
}
