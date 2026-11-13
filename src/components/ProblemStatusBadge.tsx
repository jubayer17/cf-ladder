import { CheckCircle2, CircleDashed, LoaderCircle } from 'lucide-react';
import type { UserStatus } from '@/types';
import { progressLabels, verdictLabel } from '@/lib/progress';
export default function ProblemStatusBadge({ state, verdict }: { state: UserStatus; verdict?: string }) {
  if (state === 'unsolved') return null;
  const Icon = state === 'solved' ? CheckCircle2 : state === 'pending' ? LoaderCircle : CircleDashed;
  return <span className="desk-problem-status" title={state === 'failed' ? verdictLabel(verdict) : undefined}><Icon size={13} aria-hidden="true" className={state === 'pending' ? 'animate-spin' : ''} />{progressLabels[state]}</span>;
}
