import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, MessageCircle, RefreshCw, Send, Share2, ShieldCheck, Trophy, UserCheck, UserPlus, UserRound, UserRoundPlus, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

const rows = value => Array.isArray(value) ? value : [];
const name = profile => profile?.display_name || profile?.full_name || profile?.username || 'Kleenest member';
const SOCIAL_REFRESH_EVENTS = ['kleenest:social-updated','kleenest:community-updated'];
const emitSocialRefresh = type => window.dispatchEvent(new CustomEvent(type, { detail: { at: Date.now() } }));

export default function SocialPage() {
  const { services, user } = useAppContext();
  const [params, setParams] = useSearchParams();
  const [reviews, setReviews] = useState([]), [followers, setFollowers] = useState([]), [following, setFollowing] = useState([]), [feed, setFeed] = useState([]), [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [action, setAction] = useState(''), [post, setPost] = useState(''), [message, setMessage] = useState('');
  const view = params.get('view') || 'feed';

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [reviewRows, social] = await Promise.all([
        services.community.listRecentReviews(20),
        user ? services.community.socialFeed({ limit: 30 }) : Promise.resolve([]),
      ]);
      setReviews(rows(reviewRows)); setFeed(rows(social));
      if (user) {
        const [a, b, m] = await Promise.all([
          services.community.followers({ limit: 50 }),
          services.community.following({ limit: 50 }),
          services.community.messages({ limit: 50 }),
        ]);
        setFollowers(rows(a)); setFollowing(rows(b)); setMessages(rows(m));
      } else { setFollowers([]); setFollowing([]); setMessages([]); }
    } catch (e) { setError(e?.message || 'Community activity is temporarily unavailable.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [user?.id]);
  useEffect(() => {
    const refresh = () => void load();
    const names = ['kleenest:checkin-completed','kleenest:location-activity','kleenest:rewards-updated','kleenest:progression-updated',...SOCIAL_REFRESH_EVENTS];
    names.forEach(n => window.addEventListener(n, refresh));
    return () => names.forEach(n => window.removeEventListener(n, refresh));
  }, [user?.id]);

  const friends = useMemo(() => { const ids = new Set(following.map(x => x.following_id)); return followers.filter(x => ids.has(x.follower_id)); }, [followers, following]);
  const conversations = useMemo(() => {
    const map = new Map();
    messages.forEach(item => { const other = item.from_id === user?.id ? item.to_id : item.from_id; if (other && !map.has(other)) map.set(other, item); });
    return [...map.values()];
  }, [messages, user?.id]);

  const publish = async event => { event.preventDefault(); const content = post.trim(); if (!user || !content) return; setAction('Publishing…'); try { await services.community.publishPost({ content }); setPost(''); setAction('Post published.'); emitSocialRefresh('kleenest:social-updated'); emitSocialRefresh('kleenest:community-updated'); await load(); } catch (e) { setAction(e?.message || 'Unable to publish post.'); } };
  const follow = async id => { setAction('Updating connection…'); try { await services.community.followUser(id); setAction('Connection updated.'); emitSocialRefresh('kleenest:social-updated'); emitSocialRefresh('kleenest:community-updated'); await load(); } catch (e) { setAction(e?.message || 'Unable to update connection.'); } };
  const sendMessage = async event => { event.preventDefault(); const recipient = params.get('to'); const content = message.trim(); if (!user || !recipient || !content) return; setAction('Sending…'); try { await services.community.sendMessage({ toId: recipient, content }); setMessage(''); setAction('Message sent.'); emitSocialRefresh('kleenest:social-updated'); emitSocialRefresh('kleenest:community-updated'); await load(); } catch (e) { setAction(e?.message || 'Unable to send message.'); } };

  return <WorkspaceShell workspace="consumer"><main className="page community-page">
    <div className="page-header"><div><span className="eyebrow">KLEENEST COMMUNITY</span><h1>Social network</h1><p>Find contributors, share trusted discoveries, and keep people connected to places.</p></div><div className="hero-actions"><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Refresh</button><Link className="secondary" to="/map"><MapPin size={16}/>Explore map</Link></div></div>
    {action && <div className="state success" role="status">{action}</div>}{error && <div className="state error" role="alert">{error}<button className="secondary" onClick={load}>Retry</button></div>}
    <section className="social-capability-grid"><button className="social-capability-card" onClick={() => setParams({ view: 'followers' })}><Users size={20}/><strong>Followers</strong><b>{followers.length}</b><span>People following your activity.</span></button><button className="social-capability-card" onClick={() => setParams({ view: 'following' })}><UserCheck size={20}/><strong>Following</strong><b>{following.length}</b><span>Contributors you follow.</span></button><button className="social-capability-card" onClick={() => setParams({ view: 'friends' })}><UserRoundPlus size={20}/><strong>Friends</strong><b>{friends.length}</b><span>Mutual connections.</span></button><button className="social-capability-card" onClick={() => setParams({ view: 'messages' })}><MessageCircle size={20}/><strong>Messages</strong><b>{conversations.length}</b><span>Private conversations.</span></button></section>
    {user && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CREATE</span><h2>Share with the network</h2></div><Share2 size={22}/></div><form className="button-row" onSubmit={publish}><input value={post} onChange={e => setPost(e.target.value)} maxLength={1000} placeholder="Share a place, tip, verification, or community update…"/><button className="primary" type="submit" disabled={!post.trim()}><Send size={15}/>Post</button></form></section>}
    {view === 'messages' && user && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">MESSAGES</span><h2>Private conversations</h2></div><MessageCircle size={24}/></div><div className="button-row"><input value={params.get('to') || ''} onChange={e => setParams({ view: 'messages', to: e.target.value })} placeholder="Recipient user ID"/><span>Choose a contributor from your network, then send a private message.</span></div>{params.get('to') && <form className="button-row" onSubmit={sendMessage}><input value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} placeholder="Write a message…"/><button className="primary" type="submit" disabled={!message.trim()}><Send size={15}/>Send</button></form>}{conversations.length ? conversations.map(item => <article className="social-post" key={item.id}><div className="social-avatar"><UserRound size={18}/></div><div><strong>{name(item.from_id === user.id ? item.to_profile : item.from_profile)}</strong><span className="social-time">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</span><p>{item.content}</p></div></article>) : <div className="empty-state"><MessageCircle size={30}/><h3>No messages yet</h3><p>Private conversations will appear here.</p></div>}</section>}
    {view !== 'messages' && <div className="social-grid"><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">NETWORK FEED</span><h2>Community activity</h2></div><Users size={24}/></div>{!loading && feed.length ? feed.map(item => <article className="social-post" key={item.id}><div className="social-avatar"><UserRound size={18}/></div><div><strong>{name(item.profiles)}</strong><span className="social-time">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span><p>{item.metadata?.content || item.metadata?.message || `${item.activity_type || 'Community'} activity`}</p></div></article>) : <div className="empty-state"><Users size={30}/><h3>Your network feed is ready</h3><p>Verified activity and community interactions will appear here.</p></div>}</section><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">TRUSTED REVIEWS</span><h2>Recent discoveries</h2></div><ShieldCheck size={24}/></div>{!loading && reviews.length ? reviews.slice(0,10).map(r => <article className="social-post" key={r.id}><div className="social-avatar"><span aria-label={`${r.rating ?? r.stars} star rating`}>★</span></div><div><strong>{name(r.profiles)}</strong><p><b>{r.places?.name || 'Kleenest location'}</b> · {r.rating ?? r.stars}/5</p><p>{r.body ?? r.comment}</p></div></article>) : <div className="empty-state">No trusted reviews yet.</div>}<div className="hero-actions"><Link className="primary" to="/rewards"><Trophy size={15}/>Earn rewards</Link><Link className="secondary" to="/leaderboard">Leaderboard</Link></div></section></div>}
    {(view === 'followers' || view === 'following' || view === 'friends') && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CONNECTIONS</span><h2>{view === 'followers' ? 'Followers' : view === 'following' ? 'Following' : 'Friends'}</h2></div><Users size={24}/></div>{(view === 'friends' ? friends : view === 'following' ? following : followers).length ? (view === 'friends' ? friends : view === 'following' ? following : followers).map(x => { const id = x.follower_id || x.following_id; const profile = x.profile || x.profiles; return <div className="business-row" key={id}><div><strong>{name(profile)}</strong><span>{view === 'followers' ? 'Following you' : 'Contributor you follow'}</span></div>{view === 'followers' && <button className="secondary" onClick={() => follow(id)}><UserPlus size={14}/>Follow back</button>}</div>; }) : <div className="empty-state"><Users size={30}/><h3>Build your network</h3><p>Follow contributors as you discover trusted local knowledge.</p><Link className="primary" to="/leaderboard"><ArrowRight size={15}/>Discover contributors</Link></div>}</section>}
  </main></WorkspaceShell>;
}