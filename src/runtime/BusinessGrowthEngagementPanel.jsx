import { useMemo } from 'react';
import { BarChart3, Gift, Megaphone, QrCode, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BusinessGrowthEngagementPanel({ business, locations = [], campaigns = [], promotions = [], events = [], contests = [], qrs = [] }) {
  const locationCount = locations.length;
  const tier = String(business?.tier || business?.plan || business?.membership_tier || business?.service_tier || '').toLowerCase();
  const isGrowth = tier === 'growth' || tier === 'business_growth' || tier.includes('business growth');
  const isEnterprise = tier === 'enterprise' || tier.includes('enterprise');
  const growthEnabled = (isGrowth && locationCount <= 5) || isEnterprise;
  const overCap = isGrowth && locationCount > 5;
  const stats = useMemo(() => [['Locations', locationCount],['QR', qrs.length],['Campaigns', campaigns.length],['Promotions', promotions.length],['Events', events.length],['Contests', contests.length]], [locationCount,qrs.length,campaigns.length,promotions.length,events.length,contests.length]);
  return <section className="detail-panel business-card" aria-labelledby="business-growth-heading">
    <div className="panel-heading"><div><span className="eyebrow">{isEnterprise ? 'ENTERPRISE' : 'BUSINESS GROWTH'}</span><h2 id="business-growth-heading">Engagement engine</h2></div><BarChart3 size={22}/></div>
    <p>{isEnterprise ? 'Enterprise coordinates QR engagement, campaigns, promotions, events and contests with network intelligence and Fleet activity.' : 'Growth businesses receive Enterprise engagement capabilities for up to 5 locations. Standard businesses retain standard management and analytics.'}</p>
    <div className="management-grid" aria-label="Growth capability counts">{stats.map(([label,value]) => <div className="management-item" key={label}><strong>{value}</strong><small>{label}</small></div>)}</div>
    <div className="hero-actions"><Link className="secondary" to="/business/intelligence"><BarChart3 size={16}/> Intelligence</Link><Link className="secondary" to="/business/manage"><Megaphone size={16}/> Campaigns</Link><Link className="secondary" to="/business/manage"><QrCode size={16}/> QR</Link>{growthEnabled && <><Link className="secondary" to="/business/manage"><Gift size={16}/> Promotions</Link><Link className="secondary" to="/business/manage"><Trophy size={16}/> Contests</Link></>}</div>
    {overCap && <p className="form-note">Business Growth includes Enterprise engagement for up to 5 managed locations. This business currently has {locationCount}; move to Enterprise for additional locations.</p>}
  </section>;
}