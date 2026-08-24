import { useMemo } from 'react';
import { BarChart3, Gift, Megaphone, QrCode, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BusinessGrowthEngagementPanel({ business, locations = [], campaigns = [], promotions = [], events = [], contests = [], qrs = [] }) {
  const locationCount = locations.length;
  const tier = String(business?.tier || business?.plan || business?.membership_tier || '').toLowerCase();
  const growthEnabled = tier.includes('growth') || tier.includes('enterprise') || tier.includes('premium') || locationCount <= 5;
  const stats = useMemo(() => [
    ['Locations', locationCount],
    ['QR', qrs.length],
    ['Campaigns', campaigns.length],
    ['Promotions', promotions.length],
    ['Events', events.length],
    ['Contests', contests.length],
  ], [locationCount, qrs.length, campaigns.length, promotions.length, events.length, contests.length]);

  return <section className="detail-panel business-card" aria-labelledby="business-growth-heading">
    <div className="panel-heading"><div><span className="eyebrow">BUSINESS GROWTH</span><h2 id="business-growth-heading">Engagement engine</h2></div><BarChart3 size={22}/></div>
    <p>Growth businesses use the same QR, campaign, promotion, event and contest network that feeds Enterprise intelligence. Standard businesses keep their standard operating tools.</p>
    <div className="management-grid" aria-label="Growth capability counts">{stats.map(([label,value]) => <div className="management-item" key={label}><strong>{value}</strong><small>{label}</small></div>)}</div>
    <div className="hero-actions">
      <Link className="secondary" to="/business/intelligence"><BarChart3 size={16}/> Intelligence</Link>
      <Link className="secondary" to="/business/manage"><Megaphone size={16}/> Campaigns</Link>
      <Link className="secondary" to="/business/manage"><QrCode size={16}/> QR</Link>
      {growthEnabled && <Link className="secondary" to="/business/manage"><Gift size={16}/> Promotions</Link>}
      {growthEnabled && <Link className="secondary" to="/business/manage"><Trophy size={16}/> Contests</Link>}
    </div>
    {!growthEnabled && <p className="form-note">Growth/Enterprise engagement controls remain entitlement-gated. Upgrade the business tier to activate the extended engagement network.</p>}
  </section>;
}
