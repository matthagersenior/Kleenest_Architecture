import { useMemo } from 'react';
import { BarChart3, CalendarDays, Gift, Megaphone, QrCode, Trophy, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BusinessGrowthEngagementPanel({ business, locations = [], campaigns = [], promotions = [], events = [], contests = [], qrs = [], reviews = [] }) {
  const locationCount = locations.length;
  const tier = String(business?.business_tier || business?.tier || business?.plan || business?.membership_tier || business?.service_tier || '').toLowerCase();
  const isGrowth = tier === 'growth' || tier === 'business_growth' || tier.includes('business growth');
  const isFleet = tier === 'fleet' || tier === 'business_fleet' || tier.includes('business fleet');
  const isEnterprise = tier === 'enterprise' || tier === 'business_enterprise' || tier.includes('enterprise');
  const engagementEnabled = isGrowth || isFleet || isEnterprise;
  const overCap = isGrowth && locationCount > 5;
  const stats = useMemo(() => [['Locations', locationCount], ['QR', qrs.length], ['Campaigns', campaigns.length], ['Promotions', promotions.length], ['Events', events.length], ['Contests', contests.length], ['Reviews', reviews.length]], [locationCount, qrs.length, campaigns.length, promotions.length, events.length, contests.length, reviews.length]);
  return <section className="detail-panel business-card" aria-labelledby="business-growth-heading">
    <div className="panel-heading"><div><span className="eyebrow">{isEnterprise ? 'ENTERPRISE' : isFleet ? 'FLEET BUSINESS' : isGrowth ? 'BUSINESS GROWTH' : 'BUSINESS STANDARD'}</span><h2 id="business-growth-heading">Engagement engine</h2></div><BarChart3 size={22} /></div>
    <p>{engagementEnabled ? 'Growth, Fleet and Enterprise businesses coordinate customer engagement with QR, campaigns, promotions, events, contests and review intelligence.' : 'Standard businesses retain core profile, location, review and analytics management. Upgrade to unlock the engagement engine.'}</p>
    <div className="management-grid" aria-label="Business capability counts">{stats.map(([label, value]) => <div className="management-item" key={label}><strong>{value}</strong><small>{label}</small></div>)}</div>
    <div className="hero-actions">
      <Link className="secondary" to="/business/intelligence"><BarChart3 size={16} /> Intelligence</Link>
      <Link className="secondary" to="/business/manage"><Megaphone size={16} /> Campaigns</Link>
      {engagementEnabled && <><Link className="secondary" to="/business/manage"><QrCode size={16} /> QR</Link><Link className="secondary" to="/business/manage"><Gift size={16} /> Promotions</Link><Link className="secondary" to="/business/manage"><CalendarDays size={16} /> Events</Link><Link className="secondary" to="/business/manage"><Trophy size={16} /> Contests</Link></>}
      {reviews.length > 0 && <Link className="secondary" to="/business/manage"><MessageSquare size={16} /> Reviews</Link>}
      <Link className="secondary" to="/admin/crud">Governed CRUD</Link>
    </div>
    {overCap && <p className="form-note">Business Growth includes engagement capabilities for up to 5 managed locations. This business currently has {locationCount}; Enterprise is required for additional locations.</p>}
  </section>;
}
