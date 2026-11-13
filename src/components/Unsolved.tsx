'use client';
import { useAppContext } from '@/context/AppContext';
import RetryCard from './RetryCard';
import StatePanel from './StatePanel';
export default function Unsolved() {
  const { attemptedUnsolvedProblems, loadingUser } = useAppContext();
  if (!attemptedUnsolvedProblems.length) return <StatePanel tone={loadingUser ? 'loading' : 'success'} title={loadingUser ? 'Updating your attempts…' : 'No unfinished attempts'} description={loadingUser ? 'Your previous record stays available while we sync.' : 'Nothing is waiting in your attempted list. Choose a problem from the ladder to start your next session.'} compact />;
  const recent = [...attemptedUnsolvedProblems].sort((a,b) => (b.lastTime || 0) - (a.lastTime || 0)).slice(0,6);
  return <><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{recent.map(attempt => <RetryCard key={attempt.key} attempt={attempt} />)}</div>{attemptedUnsolvedProblems.length > 6 && <p className="mt-3 text-xs text-muted-foreground font-mono">Showing the 6 most recent of {attemptedUnsolvedProblems.length} unfinished attempts.</p>}</>;
}
