import type { UserStatus } from '@/types';

export function problemState(solved: boolean, attempted = false, verdict?: string): UserStatus {
  if (solved) return 'solved';
  if (!attempted) return 'unsolved';
  if (!verdict || ['TESTING', 'RUNNING', 'PENDING', 'QUEUED'].includes(verdict)) return 'pending';
  return 'failed';
}
export const progressLabels: Record<UserStatus, string> = {
  solved: 'Solved', failed: 'Attempted', pending: 'Awaiting judging', unsolved: 'Untouched',
};
export function verdictLabel(verdict?: string) {
  if (!verdict) return 'Awaiting judging';
  if (['TESTING', 'RUNNING', 'PENDING', 'QUEUED'].includes(verdict)) return 'Awaiting judging';
  return verdict.toLowerCase().replace(/_/g, ' ').replace(/^./, letter => letter.toUpperCase());
}
