'use client';
import { useAppContext } from '@/context/AppContext';
import ProfileAvatar from './ProfileAvatar';
export default function ProfileSummary() {
  const { userInfo, loadingUser }=useAppContext();
  if (!userInfo) return null;
  return <aside className="desk-profile-summary" aria-label="Connected Codeforces profile" aria-busy={loadingUser}><span className="profile-summary-avatar"><ProfileAvatar key={userInfo.handle} handle={userInfo.handle} primary={userInfo.titlePhoto} fallback={userInfo.avatar} /></span><div className="min-w-0"><a className="font-semibold break-words" href={`https://codeforces.com/profile/${encodeURIComponent(userInfo.handle)}`} target="_blank" rel="noopener noreferrer">{userInfo.handle} ↗</a><p>{userInfo.rank || 'Unrated'} · Rating {userInfo.rating ?? '—'} · Best {userInfo.maxRating ?? '—'}</p></div><span className="desk-kicker ml-auto">{loadingUser ? 'SYNCING…' : 'CONNECTED'}</span></aside>;
}
