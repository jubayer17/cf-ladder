'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAppContext, makeKey } from '@/context/AppContext';
import { problemState } from '@/lib/progress';
import type { UserStatus } from '@/types';
import ProblemList from '@/components/ProblemList';
import ProfileSummary from "@/components/ProfileSummary";
import StatePanel from '@/components/StatePanel';
import ConnectHandleAction from '@/components/ConnectHandleAction';
export default function TopicDetailsPage() {
  const params = useParams();
  const topic = String(params.topic || '');
  const { problems, errorProblems, fetchProblems, loadingProblems, handle, userSolvedSet, attemptedUnsolvedProblems } = useAppContext();
  const data = useMemo(() => {
    const list = problems.filter(p => p.tags?.includes(topic));
    const attempts = new Map(attemptedUnsolvedProblems.map(p => [p.key,p]));
    const statuses: Record<string,UserStatus> = {};
    const counts = { solved:0,failed:0,pending:0,unsolved:0 };
    const difficulties: Record<string,number> = {};
    for (const p of list) {
      const key = makeKey(p.contestId,p.index), attempt = attempts.get(key);
      const state = problemState(userSolvedSet.has(key),!!attempt,attempt?.lastVerdict);
      statuses[key] = state; counts[state]++;
      const rating = p.rating ? String(p.rating) : 'unrated'; difficulties[rating] = (difficulties[rating] || 0)+1;
    }
    return { list,statuses,counts,difficulties };
  },[problems,topic,attemptedUnsolvedProblems,userSolvedSet]);
  const percent = data.list.length ? Math.round(data.counts.solved/data.list.length*100) : 0;
  return <main className="desk-page space-y-6"><Link href="/topics" className="desk-back-link">← All topics</Link><div className="desk-page-heading"><div><p className="desk-kicker">THE ARCHIVE / SUBJECT RECORD</p><h1 className="capitalize">{topic}</h1><p>{data.list.length.toLocaleString()} problems in this topic.{handle ? ` ${percent}% solved by ${handle}.` : ''}</p></div></div>
    <ProfileSummary />
    {errorProblems ? <StatePanel tone="error" title="The topic could not load" description={errorProblems} action={<button className="desk-action" onClick={() => void fetchProblems()}>Try again →</button>} /> : loadingProblems && !problems.length ? <StatePanel tone="loading" title="Loading this topic…" /> : !data.list.length ? <StatePanel tone="empty" title="No problems for this topic" description="This topic may no longer be part of the archive. Choose a subject from the current library." action={<Link className="desk-action" href="/topics">Browse topics →</Link>} /> : <>
      {handle ? <div className="desk-topic-metrics">{([{state:'solved',label:'Solved'},{state:'failed',label:'Attempted'},{state:'pending',label:'Awaiting judging'},{state:'unsolved',label:'Untouched'}] as const).map(item => <div key={item.state} className="problem-state" data-status={item.state}><span>{item.label}</span><strong>{data.counts[item.state].toLocaleString()}</strong></div>)}</div> : <StatePanel tone="info" title="See your progress in this topic" description="Connect your handle to distinguish solved, attempted, and untouched problems." action={<ConnectHandleAction />} compact />}
      <section className="desk-panel p-4"><h2 className="desk-kicker mb-3">DIFFICULTY DISTRIBUTION</h2><div className="flex flex-wrap gap-2">{Object.entries(data.difficulties).sort(([a],[b]) => a==='unrated' ? 1 : b==='unrated' ? -1 : Number(a)-Number(b)).map(([rating,count]) => <span className="desk-distribution-chip" key={rating}>{rating==='unrated' ? 'Unrated' : rating}<b>{count}</b></span>)}</div></section>
      <ProblemList key={topic} problems={data.list} userStatusMap={data.statuses} userSolvedSet={userSolvedSet} />
    </>}
  </main>;
}
