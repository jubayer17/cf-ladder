"use client";
import Link from 'next/link';
import Ladder from '@/components/Ladder';
import PersonalInfo from '@/components/PersonalInfo';
import Unsolved from '@/components/Unsolved';
import { useAppContext } from '@/context/AppContext';
export default function Home() {
  const { problems, userInfo, userSolvedSet, loadingProblems, loadingUser, errorProblems, fetchProblems, solvedCountInProblems, solvingStreak, attemptedUnsolvedProblems } = useAppContext();
  const metrics = [
    { label: 'In the archive', value: problems.length.toLocaleString(), unit: 'problems' },
    { label: 'Your progress', value: solvedCountInProblems.toLocaleString(), unit: 'ladder solves' },
    { label: 'Current streak', value: solvingStreak, unit: 'days in a row' },
    { label: 'Unfinished business', value: attemptedUnsolvedProblems.length.toLocaleString(), unit: 'to revisit' },
  ];
  return <main className="desk mx-auto max-w-7xl px-4 sm:px-8 py-7 sm:py-10 space-y-7">
    <section className="desk-intro flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-7 border-b-2 border-foreground">
      <div><p className="desk-kicker mb-3">CODEFORCES / PRACTICE DESK</p><h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.02] tracking-[-0.055em]">Pick a rating.<br /><span className="desk-title-mark">Get to work<span className="desk-dot">.</span></span></h1><p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">A problem ladder, a record of your solves, and a place to pick up where you left off.</p></div>
      <div className="desk-stamp self-start sm:self-auto"><span className="desk-kicker">28 RUNGS / ONE DIRECTION</span><p className="font-mono text-2xl font-bold mt-2">800 <span aria-hidden="true">↗</span> 3500</p><Link href="/topics" className="mt-3 inline-block text-xs underline underline-offset-4">Or practice by topic →</Link></div>
    </section>
    <section aria-label="Practice overview" className="desk-metrics grid grid-cols-2 lg:grid-cols-4">{metrics.map(({label,value,unit}, index) => <div key={label} className={`desk-metric desk-metric-${index} p-4 sm:p-5`}><span className="desk-metric-index" aria-hidden="true">0{index + 1} ↗</span><p className="desk-kicker text-muted-foreground">{label}</p><p className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">{loadingProblems && !problems.length ? '—' : value}</p><p className="mt-1 text-xs text-muted-foreground">{unit}</p></div>)}</section>
    {!userInfo && <p className="text-xs font-mono text-muted-foreground"><span className="desk-note">NOTE</span> Enter your handle above to sync solved problems and build your record.</p>}
    {userInfo && <PersonalInfo key={userInfo.handle} profileImage={userInfo.titlePhoto} fallbackImage={userInfo.avatar} rank={userInfo.rank} handle={userInfo.handle} currentRating={userInfo.rating} maxRating={userInfo.maxRating} isLoading={loadingUser} />}
    <section id="practice" className="scroll-mt-40 space-y-5">
      <div className="desk-section-title"><h2><span className="desk-section-number">01</span> THE PROBLEM SET</h2><span className="hidden sm:block text-xs font-mono text-muted-foreground">Choose your difficulty below ↓</span></div>
      {loadingProblems && !problems.length ? <div role="status" aria-label="Loading problems" className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse border bg-muted" />)}<p className="text-sm text-muted-foreground">Opening the archive…</p></div> : errorProblems ? <div role="alert" className="desk-panel p-6"><p>{errorProblems}</p><button onClick={() => void fetchProblems()} className="desk-action mt-4">Try again →</button></div> : <Ladder problems={problems} userSolvedSet={userSolvedSet} />}
    </section>
    {userInfo && <section className="space-y-5"><div className="desk-section-title"><h2><span className="desk-section-number">02</span> UNFINISHED BUSINESS</h2><Link href="/unsolved" className="text-xs underline underline-offset-4">View all →</Link></div><Unsolved /></section>}
  </main>;
}
