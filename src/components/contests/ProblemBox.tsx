'use client';
import { topicTone } from "@/lib/topicPalette";
import { cfRatingColors } from '@/utils/cfRatingColors';
import { getContrastColor } from '@/utils/tagColors';
import { problemState } from '@/lib/progress';
import ProblemStatusBadge from '@/components/ProblemStatusBadge';
export type ProblemInfo = { contestId?: number; index?: string; name?: string; points?: number; rating?: number; solved?: boolean; failed?: boolean; verdict?: string; tags?: string[] };
export default function ProblemBox({ p }: { p?: ProblemInfo }) {
  if (!p?.contestId || !p.index) return <div className="desk-contest-empty" aria-label="No problem in this column">—</div>;
  const state = problemState(!!p.solved, !!p.failed, p.verdict);
  const ratingColor = cfRatingColors[p.rating || 0] || '#6b7280';
  return <a href={`https://codeforces.com/contest/${p.contestId}/problem/${encodeURIComponent(p.index)}`} target="_blank" rel="noopener noreferrer" data-status={state} className="problem-state desk-contest-problem">
    <span className="desk-kicker desk-problem-meta">{p.index} / {p.contestId}</span><h3>{p.name || `Problem ${p.index}`}</h3>{!!p.tags?.length && <div className="flex flex-wrap gap-1 mt-2">{p.tags.slice(0,2).map(tag => <span key={tag} data-tone={topicTone(tag)} className="desk-problem-tag px-1.5 py-0.5 text-[9px]">{tag}</span>)}</div>}<div className="desk-contest-problem-footer">{p.rating ? <span className="desk-rating-pill" style={{ background: ratingColor, color: getContrastColor(ratingColor) }}>{p.rating}</span> : <span className="text-xs desk-problem-meta">Unrated</span>}<ProblemStatusBadge state={state} verdict={p.verdict} /></div>
  </a>;
}
