import type { Problem } from '@/types';
export interface CFUserInfo {
  handle: string; rating?: number; maxRating?: number; rank?: string; titlePhoto: string; avatar?: string;
}
export interface Submission {
  id: number; contestId?: number; creationTimeSeconds: number; verdict?: string; problem: Problem;
}
export const makeKey = (contestId: number | string | undefined, index: unknown) => `${contestId ?? ''}-${String(index ?? '').trim().toUpperCase()}`;
export const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function currentStreak(counts: Record<string, number>, now = new Date()): number {
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!counts[localDate(day)]) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (counts[localDate(day)]) { streak++; day.setDate(day.getDate() - 1); }
  return streak;
}
export function mergeSubmissions(existing: Submission[], incoming: Submission[]): Submission[] {
  const byId = new Map(existing.map(s => [s.id, s]));
  for (const submission of incoming) byId.set(submission.id, submission);
  return [...byId.values()].sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds || b.id - a.id);
}
export async function cfRequest<T>(method: string, params: Record<string, string | number> = {}): Promise<T> {
  const query = new URLSearchParams(Object.entries(params).map(([k,v]) => [k, String(v)]));
  const response = await fetch(`/api/codeforces/${method}?${query}`, { signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  if (!response.ok || data.status !== 'OK') throw new Error(data.comment || 'Codeforces is temporarily unavailable. Please try again.');
  return data.result as T;
}
export const storage = {
  get(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } },
  remove(key: string) { try { localStorage.removeItem(key); } catch { /* Storage is optional. */ } },
};
