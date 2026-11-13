'use client';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import ProblemRatings from '@/components/stats/problemRatings';
import TagsDonut from '@/components/stats/TagsDonut';
import Heatmap from '@/components/Heatmap';
import ProfileSummary from '@/components/ProfileSummary';
import StatePanel from '@/components/StatePanel';
import ConnectHandleAction from '@/components/ConnectHandleAction';
export default function StatsPage() {
  const { handle, submissions, dailySolveCounts, loadingUser, errorUser, fetchAndMergeUserData } = useAppContext();
  const hasSolves = submissions.some(s => s.verdict === 'OK');
  return <main className="desk-page space-y-6"><div className="desk-page-heading"><div><p className="desk-kicker">YOUR RECORD / THE NUMBERS</p><h1>Practice, on record.</h1><p>Activity, difficulty, and topics from your accepted Codeforces submissions.</p></div>{handle && <button className="desk-secondary" disabled={loadingUser} onClick={() => void fetchAndMergeUserData(handle)}><RefreshCw size={15} className={loadingUser ? 'animate-spin' : ''} />{loadingUser ? 'Syncing…' : 'Refresh record'}</button>}</div>
    <ProfileSummary />
    {!handle ? <StatePanel tone={loadingUser ? 'loading' : 'info'} title={loadingUser ? 'Loading your Codeforces record…' : 'Your statistics start with a handle'} description={loadingUser ? 'Gathering your submission history.' : 'Connect a handle to see your activity calendar, solved ratings, and topic breakdown.'} action={!loadingUser && <ConnectHandleAction />} /> : <>
      {errorUser && <StatePanel tone="error" title="Your latest refresh did not finish" description="Your previous statistics are still shown. Refresh the record to try again." compact />}
      {hasSolves ? <div className="space-y-6"><Heatmap dailyCounts={dailySolveCounts} /><ProblemRatings key={`ratings-${handle}`} handle={handle} /><TagsDonut key={`tags-${handle}`} handle={handle} /></div> : <StatePanel tone="empty" title="Your solving record is still ahead of you" description="Accepted solves will populate the activity, rating, and topic charts. Attempts without an accepted verdict remain in your unfinished list." action={<Link className="desk-action" href="/">Find a problem →</Link>} />}
    </>}
  </main>;
}
