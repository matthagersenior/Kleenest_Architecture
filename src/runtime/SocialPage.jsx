import{useEffect,useMemo,useState}from'react';
import{Heart,MessageCircle,RefreshCw,Trophy,UserRound,Users,Share2,ShieldCheck,MapPin,Camera,ArrowRight,UserPlus,Star,Send,UserCheck,UserRoundPlus,FileText}from'lucide-react';
import{Link}from'react-router-dom';
import{useAppContext}from'../AppContext.jsx';
import{supabase}from'../infrastructure/supabase/client.js';
import WorkspaceShell from'./WorkspaceShell.jsx';

const safeRows=v=>Array.isArray(v)?v:[];
const displayName=p=>p?.display_name||p?.full_name||p?.username||'Kleenest member';

export default function SocialPage(){
 const{services,user}=useAppContext();
 const[reviews,setReviews]=useState([]),[leaders,setLeaders]=useState([]),[posts,setPosts]=useState([]),[followers,setFollowers]=useState([]),[following,setFollowing]=useState([]),[messages,setMessages]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[action,setAction]=useState(''),[shared,setShared]=useState(''),[post,setPost]=useState('');
 const load=async()=>{setLoading(true);setError('');try{
   const[feed,board,postResult]=await Promise.all([services.community.listRecentReviews(20),user?services.progression.leaderboard(10):Promise.resolve([]),supabase?.from('social_posts').select('*').order('created_at',{ascending:false}).limit(20)]);
   if(postResult?.error)throw postResult.error;
   setReviews(safeRows(feed));setLeaders(safeRows(board));setPosts(safeRows(postResult?.data));
   if(user&&supabase){
     const[followerResult,followingResult,messageResult]=await Promise.all([
       supabase.from('follows').select('follower_id,created_at').eq('following_id',user.id).order('created_at',{ascending:false}).limit(50),
       supabase.from('follows').select('following_id,created_at').eq('follower_id',user.id).order('created_at',{ascending:false}).limit(50),
       supabase.from('messages').select('id,from_id,to_id,content,status,created_at,read_at').or(`from_id.eq.${user.id},to_id.eq.${user.id}`).order('created_at',{ascending:false}).limit(30)
     ]);
     if(followerResult.error)throw followerResult.error;if(followingResult.error)throw followingResult.error;if(messageResult.error)throw messageResult.error;
     const followerIds=safeRows(followerResult.data).map(x=>x.follower_id),followingIds=safeRows(followingResult.data).map(x=>x.following_id),ids=[...new Set([...followerIds,...followingIds,...safeRows(messageResult.data).flatMap(x=>[x.from_id,x.to_id]).filter(Boolean)])];
     const profiles=ids.length?(await supabase.from('profiles').select('id,display_name,full_name,username').in('id',ids)).data||[]:[];
     const byId=new Map(safeRows(profiles).map(p=>[p.id,p]));
     setFollowers(safeRows(followerResult.data).map(x=>({...x,profile:byId.get(x.follower_id)})));
     setFollowing(safeRows(followingResult.data).map(x=>({...x,profile:byId.get(x.following_id)})));
     setMessages(safeRows(messageResult.data).map(x=>({...x,other:byId.get(x.from_id===user.id?x.to_id:x.from_id)})));
   }else{setFollowers([]);setFollowing([]);setMessages([])}
 }catch(e){setError(e.message||'Community activity is temporarily unavailable.')}finally{setLoading(false)}};
 useEffect(()=>{void load()},[user?.id]);
 useEffect(()=>{const refresh=()=>void load();['kleenest:checkin-completed','kleenest:location-activity','kleenest:rewards-updated','kleenest:progression-updated'].forEach(n=>window.addEventListener(n,refresh));return()=>['kleenest:checkin-completed','kleenest:location-activity','kleenest:rewards-updated','kleenest:progression-updated'].forEach(n=>window.removeEventListener(n,refresh))},[user?.id]);
 const friends=useMemo(()=>{const a=new Set(following.map(x=>x.following_id));return followers.filter(x=>a.has(x.follower_id))},[followers,following]);
 const share=async r=>{const rating=r.rating??r.stars;const body=r.body??r.comment??'Community discovery';const place=r.places?.name||'Kleenest discovery';const url=`${window.location.origin}${window.location.pathname}#/place/${encodeURIComponent(r.place_id||r.location_id||'')}`;try{if(navigator.share)await navigator.share({title:`${place} · Kleenest`,text:`${rating??'—'}/5 ${body}`,url});else{await navigator.clipboard?.writeText(`${rating??'—'}/5 ${body}\n${url}`);setShared(String(r.id))}setAction('Community activity shared.');setTimeout(()=>setShared(''),1800)}catch(e){if(e?.name!=='AbortError')setAction('Sharing is unavailable on this device.')}};
 const publish=async e=>{e.preventDefault();const content=post.trim();if(!user||!content)return;setAction('Publishing…');try{const{error:e}=await supabase.from('social_posts').insert({user_id:user.id,content,kind:'post'});if(e)throw e;setPost('');setAction('Post published.');await load()}catch(e){setAction(e.message||'Unable to publish post.')}};
 return <WorkspaceShell workspace="consumer"><main className="page community-page">
  <div className="page-header"><div><span className="eyebrow">KLEENEST COMMUNITY</span><h1>Social network</h1><p>Find people, follow contributors, share trusted discoveries, publish posts, and keep conversations connected to the places that matter.</p></div><div className="hero-actions"><button className="secondary" onClick={load} disabled={loading}><RefreshCw size={16}/>Refresh</button><Link className="secondary" to="/map"><MapPin size={16}/>Explore map</Link></div></div>
  {action&&<div className="state success" role="status">{action}</div>}{error&&<div className="empty-state"><p>{error}</p><button className="secondary" onClick={load}>Retry</button></div>}
  <section className="social-capability-grid" aria-label="Social capabilities">
   <Link className="social-capability-card" to="/social?view=followers"><span className="social-capability-icon"><Users size={20}/></span><strong>Followers</strong><b>{followers.length}</b><span>People following your activity.</span><span className="social-capability-action">View followers →</span></Link>
   <Link className="social-capability-card" to="/social?view=following"><span className="social-capability-icon"><UserCheck size={20}/></span><strong>Following</strong><b>{following.length}</b><span>Contributors and people you follow.</span><span className="social-capability-action">View following →</span></Link>
   <Link className="social-capability-card" to="/social?view=friends"><span className="social-capability-icon"><UserRoundPlus size={20}/></span><strong>Friends</strong><b>{friends.length}</b><span>Mutual connections on Kleenest.</span><span className="social-capability-action">View friends →</span></Link>
   <Link className="social-capability-card" to="/social?view=messages"><span className="social-capability-icon"><MessageCircle size={20}/></span><strong>Messages</strong><b>{messages.length}</b><span>Your private conversation history.</span><span className="social-capability-action">Open messages →</span></Link>
  </section>
  <section className="community-loop"><div><MapPin/><strong>Discover</strong><span>Find places worth knowing.</span></div><ArrowRight/><div><ShieldCheck/><strong>Verify</strong><span>Ground signals in real visits.</span></div><ArrowRight/><div><FileText/><strong>Post</strong><span>Share useful local knowledge.</span></div><ArrowRight/><div><Users/><strong>Connect</strong><span>Build trusted relationships.</span></div></section>
  {user&&<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">CREATE</span><h2>Share with the network</h2></div><Share2 size={22}/></div><form className="button-row" onSubmit={publish}><input value={post} onChange={e=>setPost(e.target.value)} maxLength={1000} placeholder="Share a place, tip, verification, or community update…" aria-label="Create social post"/><button className="primary" type="submit" disabled={!post.trim()}><Send size={15}/>Post</button></form></section>}
  {!loading&&<div className="social-grid"><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">POSTS</span><h2>Community posts</h2></div><FileText size={24}/></div>{posts.length?posts.map(r=><article className="social-post" key={r.id}><div className="social-avatar"><UserRound size={18}/></div><div><strong>{r.user_id===user?.id?'You':'Kleenest member'}</strong><span className="social-time">{r.created_at?new Date(r.created_at).toLocaleDateString():''}</span><p>{r.content}</p><div className="social-actions"><span><Heart size={14}/> Helpful</span><span><MessageCircle size={14}/> Comment</span></div></div></article>):<div className="empty-state"><FileText size={30}/><h3>No posts yet</h3><p>Start the community feed with a useful local update.</p></div>}</section>
  <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR NETWORK</span><h2>Friends & messages</h2></div><Users size={24}/></div>{friends.length?<div className="business-list">{friends.slice(0,8).map(x=><div className="business-row" key={x.follower_id}><div><strong>{displayName(x.profile)}</strong><span>Mutual connection</span></div><Link className="button secondary" to="/social?view=messages"><MessageCircle size={14}/>Message</Link></div>)}</div>:<div className="empty-state"><Users size={30}/><h3>Build your network</h3><p>Follow contributors as you discover trusted local knowledge.</p><Link className="primary" to="/social?view=followers"><UserPlus size={15}/>Explore connections</Link></div>}</section></div>}
  <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">TRUSTED ACTIVITY</span><h2>Recent reviews & contributor rankings</h2></div><Trophy size={24}/></div>{reviews.length?reviews.slice(0,10).map(r=><article className="social-post" key={r.id}><div className="social-avatar"><UserRound size={18}/></div><div><strong>{r.profiles?.display_name||'Kleenest member'}</strong><span className="social-time">{r.created_at?new Date(r.created_at).toLocaleDateString():''}</span><p><b>{r.places?.name||'A Kleenest location'}</b> — {r.rating??r.stars}</p><p>{r.body??r.comment??'A community member shared a location signal.'}</p><div className="social-actions"><span><Heart size={14}/> Helpful signal</span><button className="secondary compact" onClick={()=>share(r)}>{shared===String(r.id)?'Copied':'Share'}</button></div></div></article>):<div className="empty-state">No reviews yet. Verify a visit and contribute the first trusted signal.</div>}<div className="hero-actions"><Link className="primary" to="/rewards"><Trophy size={15}/>Earn rewards</Link><Link className="secondary" to="/leaderboard">Leaderboard</Link></div></section>
 </main></WorkspaceShell>;
}
