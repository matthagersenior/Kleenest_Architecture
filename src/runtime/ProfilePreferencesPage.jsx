import { useEffect, useState } from 'react';
import { Globe2, Save, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

const defaults = { profile_visibility: 'community', show_activity: true, show_checkins: true, show_reviews: true, allow_followers: true, discoverable: true, preferred_units: 'imperial', home_region: '' };

export default function ProfilePreferencesPage() {
  const { services, user } = useAppContext();
  const [prefs, setPrefs] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) { setLoading(false); return undefined; }
    services.profile.preferences().then((data) => {
      if (active && data) setPrefs((v) => ({ ...v, ...data }));
    }).catch((e) => active && setError(e.message || 'Unable to load profile preferences.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user, services]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const data = await services.profile.updatePreferences(prefs);
      setPrefs((v) => ({ ...v, ...(data || {}) }));
      setMessage('Profile preferences saved.');
      window.dispatchEvent(new CustomEvent('kleenest:profile-preferences-updated', { detail: data }));
    } catch (e) { setError(e.message || 'Unable to save profile preferences.'); }
    finally { setBusy(false); }
  };

  if (!user) return <WorkspaceShell workspace="consumer"><section className="empty-state"><UserRound size={30}/><h2>Sign in to manage preferences</h2><Link className="primary" to="/auth">Sign in</Link></section></WorkspaceShell>;
  if (loading) return <WorkspaceShell workspace="consumer"><section className="empty-state">Loading profile preferences…</section></WorkspaceShell>;

  const toggles = [
    ['show_activity', 'Show activity', 'Let followers see your community activity.'],
    ['show_checkins', 'Show check-ins', 'Allow your check-in history to appear where permitted.'],
    ['show_reviews', 'Show reviews', 'Associate your published reviews with your profile.'],
    ['allow_followers', 'Allow followers', 'Allow other users to follow your profile.'],
    ['discoverable', 'Discoverable', 'Allow your profile to appear in community discovery.'],
  ];

  return <WorkspaceShell workspace="consumer"><section className="page">
    <div className="page-header"><div><span className="eyebrow">PROFILE</span><h1>Privacy & preferences</h1><p>Control how your profile, activity, check-ins, reviews, and discovery presence work across Kleenest.</p></div><div className="hero-actions"><Link className="secondary" to="/profile"><UserRound size={16}/>Profile</Link><Link className="secondary" to="/notifications/preferences"><ShieldCheck size={16}/>Notifications</Link></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
    <form className="detail-panel" onSubmit={save}><div className="panel-heading"><div><span className="eyebrow">PRIVACY</span><h2>Visibility</h2></div><ShieldCheck size={22}/></div>
      <label className="form-field"><span>Profile visibility</span><select value={prefs.profile_visibility} onChange={(e) => setPrefs((v) => ({ ...v, profile_visibility: e.target.value }))}><option value="community">Community</option><option value="followers">Followers only</option><option value="private">Private</option></select></label>
      {toggles.map(([key, title, desc]) => <label className="business-row" key={key}><div><strong>{title}</strong><span>{desc}</span></div><input type="checkbox" checked={Boolean(prefs[key])} onChange={(e) => setPrefs((v) => ({ ...v, [key]: e.target.checked }))}/></label>)}
      <div className="panel-heading"><div><span className="eyebrow">LOCALIZATION</span><h2>Experience</h2></div><Globe2 size={22}/></div>
      <div className="form-row"><label className="form-field"><span>Preferred units</span><select value={prefs.preferred_units} onChange={(e) => setPrefs((v) => ({ ...v, preferred_units: e.target.value }))}><option value="imperial">Imperial</option><option value="metric">Metric</option></select></label><label className="form-field"><span>Home region</span><input value={prefs.home_region || ''} onChange={(e) => setPrefs((v) => ({ ...v, home_region: e.target.value }))} placeholder="Optional region"/></label></div>
      <button className="primary" disabled={busy}><Save size={16}/>{busy ? 'Saving…' : 'Save preferences'}</button>
    </form>
  </section></WorkspaceShell>;
}
