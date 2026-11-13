'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { problemState, verdictLabel } from '@/lib/progress';
import ProfileSummary from "@/components/ProfileSummary";
import StatePanel from '@/components/StatePanel';
import ConnectHandleAction from '@/components/ConnectHandleAction';
import RetryCard from '@/components/RetryCard';
import ProgressLegend from '@/components/ProgressLegend';
export default function UnsolvedPage() {
  const { attemptedUnsolvedProblems, fetchAndMergeUserData, handle, loadingUser, errorUser } = useAppContext();
  const [search,setSearch] = useState(''), [filter,setFilter] = useState('all'), [sort,setSort] = useState('recent'), [page,setPage] = useState(1);
  const filtered = useMemo(() => attemptedUnsolvedProblems.filter(p => `${p.contestId}${p.index} ${p.name || ''} ${verdictLabel(p.lastVerdict)}`.toLowerCase().includes(search.toLowerCase().trim()) && (filter === 'all' || problemState(false,true,p.lastVerdict) === filter)).sort((a,b) => sort === 'attempts' ? b.attempts - a.attempts : (b.lastTime || 0) - (a.lastTime || 0)),[attemptedUnsolvedProblems,search,filter,sort]);
  const pages = Math.max(1,Math.ceil(filtered.length / 20)), currentPage = Math.min(page,pages);
  return <main className="desk-page space-y-6"><div className="desk-page-heading"><div><p className="desk-kicker">YOUR RECORD / UNFINISHED</p><h1>Finish what you started.</h1><p>Revisit your attempts, see the last verdict, and turn them into accepted solves.</p></div>{handle && <button className="desk-secondary" disabled={loadingUser} onClick={() => void fetchAndMergeUserData(handle)}><RefreshCw size={15} className={loadingUser ? 'animate-spin' : ''} />{loadingUser ? 'Syncing…' : 'Refresh record'}</button>}</div>
    <ProfileSummary />
    {!handle ? <StatePanel tone={loadingUser ? 'loading' : 'info'} title={loadingUser ? 'Loading your Codeforces record…' : 'Connect your handle to see your attempts'} description={loadingUser ? 'Fetching your submission history.' : 'Your unfinished list includes problems you tried but have not yet solved.'} action={!loadingUser && <ConnectHandleAction />} /> : <>
      {errorUser && <StatePanel tone="error" title="Your last refresh did not finish" description="Showing the previous synced record. Use Refresh record to try again." compact />}
      {!attemptedUnsolvedProblems.length ? <StatePanel tone="success" title="No unfinished attempts" description="No attempted problems are waiting for an accepted solve. This is a good time to choose a new challenge." action={<Link className="desk-action" href="/">Open the practice ladder →</Link>} /> : <>
        <div className="desk-toolbar"><label className="flex-1 min-w-0"><span className="sr-only">Search unfinished problems</span><input aria-label="Search unfinished problems" type="search" value={search} onChange={e => {setSearch(e.target.value);setPage(1);}} placeholder="Search name, ID, or verdict…" /></label><select aria-label="Attempt state" value={filter} onChange={e => {setFilter(e.target.value);setPage(1);}}><option value="all">All unfinished</option><option value="failed">Attempted</option><option value="pending">Awaiting judging</option></select><select aria-label="Sort unfinished problems" value={sort} onChange={e => {setSort(e.target.value);setPage(1);}}><option value="recent">Most recent</option><option value="attempts">Most attempts</option></select></div>
        <div className="flex flex-wrap gap-3 justify-between"><ProgressLegend /><p className="text-xs text-muted-foreground font-mono" role="status">{filtered.length} problems</p></div>
        {filtered.length ? <div className="grid gap-3 lg:grid-cols-2">{filtered.slice((currentPage-1)*20,currentPage*20).map((attempt,index) => <RetryCard key={attempt.key} attempt={attempt} number={(currentPage-1)*20+index+1} />)}</div> : <StatePanel tone="empty" title="No attempts match these filters" description="Try another name, ID, or state." action={<button className="desk-secondary" onClick={() => {setSearch('');setFilter('all');setPage(1);}}>Reset filters</button>} />}
        {pages > 1 && <nav className="desk-pagination" aria-label="Unfinished problem pagination"><button disabled={currentPage===1} onClick={() => setPage(currentPage-1)}>Previous</button><span>{currentPage} / {pages}</span><button disabled={currentPage===pages} onClick={() => setPage(currentPage+1)}>Next</button></nav>}
      </>}
    </>}
  </main>;
}
