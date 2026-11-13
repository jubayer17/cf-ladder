"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { cfRequest } from '@/lib/codeforces';
import { makeKey, useAppContext } from '@/context/AppContext';
import ContestList from '@/components/contests/ContestList';
import type { ContestInfo } from '@/components/contests/ContestNameCell';
import type { ProblemInfo } from '@/components/contests/ProblemBox';
import type { Problem } from '@/types';
const sections = ['All', 'Div. 1', 'Div. 2', 'Div. 3', 'Div. 4', 'Div 1+2', 'Educational', 'Global', 'Other'];
function category(name: string) {
  if (/educational/i.test(name)) return 'Educational';
  if (/global/i.test(name)) return 'Global';
  const has1 = /Div\.?\s*1\b/i.test(name), has2 = /Div\.?\s*2\b/i.test(name);
  if (has1 && has2) return 'Div 1+2';
  for (let d = 1; d <= 4; d++) if (new RegExp(`Div\\.?\\s*${d}\\b`, 'i').test(name)) return `Div. ${d}`;
  return 'Other';
}
export default function ContestsPage() {
  const { problems, userSolvedSet, attemptedUnsolvedProblems, handle, refreshContestUserSubmissions } = useAppContext();
  const [contests, setContests] = useState<ContestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [extra, setExtra] = useState<Record<number, Problem[]>>({});
  const [refreshing, setRefreshing] = useState<Record<number, boolean>>({});
  const pending = useRef(new Set<number>());
  async function load() {
    setLoading(true); setError(null);
    try {
      const list = await cfRequest<ContestInfo[]>('contest.list', { gym: 'false' });
      setContests(list.filter(c => c.phase === 'FINISHED').map(c => ({ ...c, category: category(c.name) })).sort((a,b) => (b.startTimeSeconds || 0) - (a.startTimeSeconds || 0)));
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load contests'); }
    finally { setLoading(false); }
  }
    // Start the initial asynchronous archive request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => contests.filter(c => (section === 'All' || c.category === section) && `${c.id} ${c.name}`.toLowerCase().includes(search.trim().toLowerCase())), [contests, section, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 15));
  const currentPage = Math.min(page,totalPages);
  const visible = filtered.slice((currentPage - 1) * 15, currentPage * 15);
  const problemsMap = useMemo(() => {
    const grouped: Record<number, Problem[]> = {};
    for (const p of problems) if (p.contestId) (grouped[p.contestId] ||= []).push(p);
    const attempted = new Map(attemptedUnsolvedProblems.map(a => [a.key,a]));
    const result: Record<number, ProblemInfo[]> = {};
    for (const c of contests) result[c.id] = (extra[c.id] || grouped[c.id] || []).map(p => {
      const key = makeKey(p.contestId,p.index);
      return { ...p, solved: userSolvedSet.has(key), failed: !userSolvedSet.has(key) && attempted.has(key), verdict: attempted.get(key)?.lastVerdict };
    }).sort((a,b) => a.index.localeCompare(b.index, undefined, { numeric: true }));
    return result;
  }, [problems, contests, extra, userSolvedSet, attemptedUnsolvedProblems]);
  async function refreshContest(id: number) {
    if (pending.current.has(id)) return;
    pending.current.add(id); setRefreshing(old => ({ ...old, [id]: true })); setError(null);
    try {
      const data = await cfRequest<{ problems: Problem[] }>('contest.standings', { contestId: id, from: 1, count: 1 });
      setExtra(old => ({ ...old, [id]: data.problems.map(p => ({ ...p, contestId: id })) }));
      if (handle) await refreshContestUserSubmissions(id,handle);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to refresh contest'); }
    finally { pending.current.delete(id); setRefreshing(old => ({ ...old, [id]: false })); }
  }
  return <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-6">
    <div><p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">THE ARCHIVE / BY ROUND</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Contest archive</h1><p className="mt-2 text-muted-foreground">Explore past rounds, track your solves, and revisit unfinished challenges.</p></div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Contest category">{sections.map(s => <button key={s} aria-pressed={section === s} onClick={() => { setSection(s); setPage(1); }} className={`px-4 py-2  text-sm border font-medium ${section === s ? 'bg-foreground text-background border-foreground' : 'bg-[var(--card)] hover:bg-muted'}`}>{s}</button>)}</div>
    <div className="flex flex-wrap items-center gap-3"><input aria-label="Search contests" type="search" placeholder="Search contest name or ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="flex-1 min-w-0 border  px-4 py-3 bg-[var(--card)]" /><button disabled={loading} onClick={() => void load()} className="border  px-4 py-3 text-sm bg-[var(--card)] disabled:opacity-50">Refresh archive</button></div>
    {error && <div role="alert" className=" border border-red-300 p-4 text-red-600">{error}</div>}
    <p className="text-sm text-muted-foreground">{filtered.length.toLocaleString()} contests · Swipe horizontally to explore problems. Use a round’s refresh button to fetch its latest problem list.</p>
    <div className="overflow-x-auto "><ContestList loadingContests={loading} loadingAllProblems={false} errorContests={null} contests={visible} problemsMap={problemsMap} maxProblemsOnPage={Math.max(1,...visible.map(c => problemsMap[c.id]?.length || 0))} perContestLoading={refreshing} onRefreshContest={id => void refreshContest(id)} /></div>
    {!loading && !visible.length && <p className="text-center py-10 text-muted-foreground">No contests match your filters.</p>}
    <nav aria-label="Contest pagination" className="flex items-center justify-center gap-4"><button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="border px-4 py-2  disabled:opacity-40">Previous</button><span className="text-sm">{currentPage} / {totalPages}</span><button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="border px-4 py-2  disabled:opacity-40">Next</button></nav>
  </main>;
}
