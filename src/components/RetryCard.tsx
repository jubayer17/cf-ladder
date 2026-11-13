import { topicTone } from "@/lib/topicPalette";
import { ArrowUpRight } from 'lucide-react';
import type { AttemptInfo } from '@/context/AppContext';
import { problemState, verdictLabel } from '@/lib/progress';
import ProblemStatusBadge from './ProblemStatusBadge';
export default function RetryCard({ attempt, number }: { attempt: AttemptInfo; number?: number }) {
  const state = problemState(false, true, attempt.lastVerdict);
  return <a className="problem-state desk-problem desk-retry-card" data-status={state} href={attempt.link} target="_blank" rel="noopener noreferrer">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="desk-problem-id px-2 py-1 border font-mono text-xs">{attempt.contestId}{attempt.index}</span><ProblemStatusBadge state={state} verdict={attempt.lastVerdict} /></div><h3 className="mt-3 font-semibold text-sm sm:text-base break-words">{number ? `${number}. ` : ''}{attempt.name || `Problem ${attempt.index}`}</h3></div><ArrowUpRight size={17} className="desk-problem-arrow shrink-0" aria-hidden="true" /></div>
    <div className="desk-retry-meta"><span>{verdictLabel(attempt.lastVerdict)}</span><span>{attempt.attempts} {attempt.attempts === 1 ? 'attempt' : 'attempts'}</span></div>
    {!!attempt.tags?.length && <div className="mt-3 flex flex-wrap gap-1.5">{attempt.tags.slice(0,4).map(tag => <span key={tag} data-tone={topicTone(tag)} className="desk-problem-tag px-2 py-1 text-[11px]">{tag}</span>)}</div>}
  </a>;
}
