'use client';
import { useMemo } from 'react';
import { useAppContext, makeKey } from '@/context/AppContext';
import TopicGrid from '@/components/topics/TopicGrid';
import ProfileSummary from "@/components/ProfileSummary";
import StatePanel from '@/components/StatePanel';
export default function TopicsPage() {
  const { problems, errorProblems, fetchProblems, loadingProblems, handle, userSolvedSet, attemptedUnsolvedProblems } = useAppContext();
  const topics = useMemo(() => {
    const attempts = new Set(attemptedUnsolvedProblems.map(p => p.key));
    const map = new Map<string,{ topic: string; count: number; solved: number; attempted: number }>();
    for (const p of problems) for (const tag of p.tags || []) {
      const item = map.get(tag) || { topic: tag, count: 0, solved: 0, attempted: 0 };
      const key = makeKey(p.contestId,p.index);
      item.count++; if (userSolvedSet.has(key)) item.solved++; else if (attempts.has(key)) item.attempted++;
      map.set(tag,item);
    }
    return [...map.values()].sort((a,b) => b.count-a.count);
  },[problems,userSolvedSet,attemptedUnsolvedProblems]);
  return <main className="desk-page space-y-7"><div className="desk-page-heading"><div><p className="desk-kicker">THE ARCHIVE / BY SUBJECT</p><h1>Find your weak spot.</h1><p>{topics.length} topics · {problems.length.toLocaleString()} problems. {handle ? 'Your progress is shown for each topic.' : 'Choose a subject and start practicing.'}</p></div></div>
    <ProfileSummary />
    {errorProblems ? <StatePanel tone="error" title="The topic library could not load" description={errorProblems} action={<button className="desk-action" onClick={() => void fetchProblems()}>Try again →</button>} /> : loadingProblems && !problems.length ? <StatePanel tone="loading" title="Opening the topic library…" description="Organizing Codeforces problems by subject." /> : topics.length ? <TopicGrid topics={topics} connected={!!handle} /> : <StatePanel tone="empty" title="No topics available yet" description="Refresh the library to try fetching the latest problem data." action={<button className="desk-secondary" onClick={() => void fetchProblems()}>Refresh library</button>} />}
  </main>;
}
