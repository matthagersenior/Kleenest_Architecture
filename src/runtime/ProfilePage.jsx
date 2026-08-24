import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, ShieldCheck, Trophy, MapPin, Star, Camera, Gamepad2, ArrowRight, UserRound, LogOut } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

export default function ProfilePage() {
  const { services, user, profile, membershipTier, showAds, isPlatformOwner, loading, error } = useAppContext();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const p = profile || {};
  const owner = Boolean(isPlatformOwner);
  const membershipLabel = owner ? 'Owner' : membershipTier === 'premium' ? 'Premium' : membershipTier === 'enterprise' ? 'Enterprise' : membershipTier === 'fleet' ? 'Fleet' : membershipTier === 'business' ? 'Business' : 'Free';
  const membershipDescription = owner ? 'Platform owner account. Consumer membership and advertising do not apply.' : showAds ? 'You have the complete consumer experience. Advertising supports your Free membership.' : 'You have the complete consumer experience without advertising.';

  const save = async () => {
    if (!user) return nav('/auth');
    try {
      setStatus('Saving…');
      const next = await services.profile.update(user.id, { display_name: name || p.display_name, username: username || p.username, bio });
      setName(next?.display_name ?? name);
      setUsername(next?.username ?? username);
      setStatus('Profile saved.');
    } catch (e) { setStatus(e.message || 'Unable to save profile.'); }
  };

  const change = async () => {
    try {
      await services.identity.updatePassword(password);
      setPassword('');
      setStatus('Password updated.');
    } catch (e) { setStatus(e.message || 'Unable to update password.'); }
  };

  if (loading) return <WorkspaceShell><section className="page"><div className="empty-state">Restoring your Kleenest profile…</div></section></WorkspaceShell>;
  if (!user) return <WorkspaceShell workspace="consumer"><section className="page"><div className="empty-state"><UserRound size={30}/><h1>Your Kleenest profile</h1><p>Sign in to keep your progress, contributions, saved places, and preferences together.</p><button className="primary" onClick={() => nav('/auth')}>Sign in</button></div></section></WorkspaceShell>;

  return <WorkspaceShell workspace={owner ? 'owner' : 'consumer'}>
    <main className="page profile-page">
      <section className="profile-hero"><div className="profile-avatar"><UserRound size={34}/></div><div><span className="eyebrow">{owner ? 'OWNER ACCOUNT' : 'YOUR KLEENEST'}</span><h1>{name || p.display_name || username || user.email}</h1><p>{p.bio || 'Build trust, discover better places, and turn real-world activity into progress.'}</p><div className="hero-tags"><span className="tag"><ShieldCheck size={14}/>Verified account</span><span className="tag">{membershipLabel}{owner ? ' · platform owner' : membershipTier === 'premium' ? ' · ad-free' : ' · ad-supported'}</span></div></div></section>
      <section className="profile-stat-grid"><div className="metric-card"><Trophy size={18}/><strong>{p.points ?? 0}</strong><span>points</span></div><div className="metric-card"><Star size={18}/><strong>Level {p.level ?? 1}</strong><span>progression</span></div><div className="metric-card"><MapPin size={18}/><strong>{p.check_in_count ?? 0}</strong><span>verified visits</span></div><div className="metric-card"><Camera size={18}/><strong>{p.evidence_count ?? 0}</strong><span>evidence</span></div></section>
      <section className="profile-actions"><Link className="detail-panel profile-action" to="/activity"><Trophy/><div><strong>Your activity</strong><span>Visits, evidence, reviews, rewards, and progression.</span></div><ArrowRight/></Link><Link className="detail-panel profile-action" to="/play/quest"><Trophy/><div><strong>Quests & progression</strong><span>See active Trust Quests and what your activity is unlocking.</span></div><ArrowRight/></Link><Link className="detail-panel profile-action" to="/games"><Gamepad2/><div><strong>Game Center</strong><span>Play, compete, and turn trust knowledge into challenges.</span></div><ArrowRight/></Link></section>
      <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">IDENTITY</span><h2>Make your profile yours</h2></div><UserRound size={21}/></div><div className="form-row"><label>Display name<input value={name || p.display_name || ''} onChange={e => setName(e.target.value)}/></label><label>Username<input value={username || p.username || ''} onChange={e => setUsername(e.target.value)}/></label></div><label>Bio<textarea rows="3" value={bio || p.bio || ''} onChange={e => setBio(e.target.value)} placeholder="What should the Kleenest community know about you?"/></label><button className="primary" onClick={save}>Save profile</button></section>
      <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">SECURITY</span><h2>Account security</h2></div><ShieldCheck size={21}/></div><label>New password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters"/></label><button className="secondary" disabled={password.length < 8} onClick={change}>Change password</button>{status && <div className="state success" role="status">{status}</div>}{error && <div className="state error">{error.message || String(error)}</div>}</section>
      <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">{owner ? 'OWNER CONTROL' : 'CONTROL'}</span><h2>{owner ? 'Platform ownership & preferences' : 'Preferences & membership'}</h2></div><Settings size={21}/></div><p>{membershipDescription}</p><div className="button-row"><Link className="secondary" to="/profile/preferences"><Settings size={15}/>Privacy & preferences</Link><Link className="secondary" to="/notifications/preferences"><ShieldCheck size={15}/>Notifications</Link>{owner ? <Link className="secondary" to="/owner">Owner controls</Link> : <Link className="secondary" to="/pricing">{showAds ? 'Go ad-free · $5/mo' : 'Premium membership'}</Link>}</div></section>
      <footer className="home-footer"><span>Kleenest works best when real-world contributions build trust for everyone.</span><button className="text-link" onClick={() => services.identity.signOut?.().then(() => nav('/'))}><LogOut size={14}/>Sign out</button></footer>
    </main>
  </WorkspaceShell>;
}
