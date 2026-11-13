import type { Problem, UserStatus } from '../types';
import { CheckCircle2, CircleDashed, Users, ArrowUpRight } from 'lucide-react';
import { cfRatingColors } from '../utils/cfRatingColors';
import { getContrastColor } from '../utils/tagColors';
interface ProblemCardProps {
  problem: Problem; status: UserStatus; number?: number; isDarkMode?: boolean; contestDivision?: string; contestName?: string;
}
export default function ProblemCard({ problem, status, number, contestDivision, contestName }: ProblemCardProps) {
  const color = cfRatingColors[problem.rating || 0] || '#2563eb';
  return <a href={`https://codeforces.com/${(problem.contestId || 0) >= 100000 ? 'gym' : 'contest'}/${problem.contestId}/problem/${problem.index}`} target="_blank" rel="noopener noreferrer" data-status={status} className="desk-problem group block p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <span className="mt-1 text-xs text-muted-foreground tabular-nums min-w-5">{number}</span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="desk-problem-id text-xs border px-2 py-1 font-mono text-muted-foreground">{problem.contestId}{problem.index}</span><h3 className="text-sm sm:text-base font-semibold group-hover:underline underline-offset-4 break-words">{problem.name}</h3>{status === 'solved' && <span className="desk-problem-status"><CheckCircle2 size={13} />Solved</span>}{status === 'failed' && <span className="desk-problem-status"><CircleDashed size={13} />Attempted</span>}</div>
        {contestName && <p className="desk-problem-meta mt-2 text-xs truncate">{contestName}{contestDivision ? ` · ${contestDivision}` : ''}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">{problem.rating && <span className="rounded-md px-2 py-1 text-xs font-semibold tabular-nums" style={{ backgroundColor: color, color: getContrastColor(color) }}>{problem.rating}</span>}{problem.tags.map(tag => <span key={tag} className="desk-problem-tag bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-normal text-slate-600 dark:text-slate-300">{tag}</span>)}</div>
      </div>
      <div className="flex flex-col items-end gap-3"><ArrowUpRight size={16} className="desk-problem-arrow" /><span className="desk-problem-meta flex items-center gap-1 text-xs tabular-nums" title="Codeforces users who solved this problem"><Users size={13} />{(problem.solvedCount || 0).toLocaleString()}</span></div>
    </div>
  </a>;
}
