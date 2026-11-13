"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { Problem } from '@/types';
import { cfRequest, CFUserInfo, Submission, makeKey, localDate, currentStreak, mergeSubmissions, storage } from '@/lib/codeforces';
export { makeKey } from '@/lib/codeforces';
export interface AttemptInfo {
  key: string; contestId: number; index: string; name?: string; tags?: string[];
  attempts: number; lastVerdict?: string; lastTime?: number; link: string;
}
interface AppContextType {
  submissions: Submission[]; problems: Problem[]; tagCounts: Record<string, number>; unsolvedProblems: Problem[];
  attemptedUnsolvedProblems: AttemptInfo[]; handle: string | null; userInfo: CFUserInfo | null;
  userSolvedSet: Set<string>; loadingProblems: boolean; loadingUser: boolean;
  errorProblems: string | null; errorUser: string | null;
  fetchProblems: () => Promise<void>; fetchAndMergeUserData: (handle: string) => Promise<void>;
  refreshUserSubmissions: (handle: string) => Promise<void>;
  refreshContestUserSubmissions: (contestId: number, handle: string) => Promise<void>;
  setHandleAndFetch: (handle: string) => Promise<void>; clearUser: () => void;
  solvedCountInProblems: number; attemptedCountInProblems: number; notTriedCount: number;
  solvingStreak: number; dailySolveCounts: Record<string, number>;
}
const AppContext = createContext<AppContextType | null>(null);
export function AppContextProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [errorProblems, setErrorProblems] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<CFUserInfo | null>(null);
  const [today, setToday] = useState(() => localDate(new Date()));
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const activeHandle = useRef<string | null>(null);
  const problemRequest = useRef<Promise<void> | null>(null);
  async function fetchProblems() {
    if (problemRequest.current) return problemRequest.current;
    problemRequest.current = (async () => {
      setLoadingProblems(true); setErrorProblems(null);
      let cached: Problem[] = [];
      try {
        const stored = JSON.parse(storage.get('cf_all_problems_v2') || 'null');
        if (Array.isArray(stored?.problems) && stored.problems.every((p: Problem) => p && typeof p.name === 'string' && Array.isArray(p.tags))) {
          cached = stored.problems; setProblems(cached);
          if (Number.isFinite(stored.ts) && Date.now() >= stored.ts && Date.now() - stored.ts < 3600000) return;
        }
      } catch { storage.remove('cf_all_problems_v2'); }
      try {
        const result = await cfRequest<{ problems: Problem[]; problemStatistics: { contestId: number; index: string; solvedCount: number }[] }>('problemset.problems');
        if (!Array.isArray(result.problems)) throw new Error('Invalid problem data');
        const stats = new Map(result.problemStatistics.map(s => [makeKey(s.contestId,s.index), s.solvedCount]));
        const list = result.problems.map(p => ({ ...p, tags: p.tags || [], solvedCount: stats.get(makeKey(p.contestId,p.index)) || 0 }));
        setProblems(list); storage.set('cf_all_problems_v2', JSON.stringify({ ts: Date.now(), problems: list }));
      } catch (error) { if (!cached.length) setErrorProblems(error instanceof Error ? error.message : 'Unable to load problems'); }
      finally { setLoadingProblems(false); }
    })().finally(() => { setLoadingProblems(false); problemRequest.current = null; });
    return problemRequest.current;
  }
  async function fetchAndMergeUserData(raw: string) {
    const h = raw.trim();
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(h)) { setErrorUser('Enter a valid Codeforces handle (3–24 characters).'); return; }
    const version = ++requestVersion.current;
    setLoadingUser(true); setErrorUser(null);
    try {
      const infos = await cfRequest<CFUserInfo[]>('user.info', { handles: h });
      if (!infos[0]) throw new Error('Handle not found');
      let all: Submission[] = [];
      for (let from = 1; ; from += 10000) {
        if (version !== requestVersion.current) return;
        const batch = await cfRequest<Submission[]>('user.status', { handle: h, from, count: 10000 });
        all = all.concat(batch);
        if (batch.length < 10000) break;
      }
      if (version !== requestVersion.current) return;
      activeHandle.current = infos[0].handle;
      setHandle(infos[0].handle); setUserInfo(infos[0]); setSubmissions(mergeSubmissions([], all));
      storage.set('cf_user_handle_v1', infos[0].handle);
    } catch (error) { if (version === requestVersion.current) setErrorUser(error instanceof Error ? error.message : 'Unable to load profile'); }
    finally { if (version === requestVersion.current) setLoadingUser(false); }
  }
  async function refresh(h: string, contestId?: number) {
    if (activeHandle.current?.toLowerCase() !== h.toLowerCase()) return;
    const version = requestVersion.current;
    try {
      const incoming = await cfRequest<Submission[]>(contestId ? 'contest.status' : 'user.status', { handle: h, from: 1, count: 10000, ...(contestId ? { contestId } : {}) });
      if (version === requestVersion.current) { setSubmissions(old => mergeSubmissions(old, incoming)); setErrorUser(null); }
    } catch (error) { if (version === requestVersion.current) setErrorUser(error instanceof Error ? error.message : 'Unable to refresh'); throw error; }
  }
  function clearUser() {
    ++requestVersion.current; activeHandle.current = null;
    setHandle(null); setUserInfo(null); setSubmissions([]); setLoadingUser(false); setErrorUser(null);
    storage.remove('cf_user_handle_v1');
  }
  useEffect(() => {
    void fetchProblems();
    const saved = storage.get('cf_user_handle_v1');
    // Hydrate the saved profile through a validated asynchronous request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) void fetchAndMergeUserData(saved);
    // Initial requests run once; request versions discard outdated profile responses.
  }, []);
  useEffect(() => {
    const id = setInterval(() => setToday(localDate(new Date())),60000);
    return () => clearInterval(id);
  }, []);
  const computed = useMemo(() => {
    const userSolvedSet = new Set<string>();
    const attempted = new Map<string, AttemptInfo>();
    const firstSolve = new Map<string, number>();
    for (const s of submissions) {
      const p = s.problem; const id = p.contestId ?? s.contestId;
      if (!id || !p.index) continue;
      const key = makeKey(id,p.index);
      if (s.verdict === 'OK') { userSolvedSet.add(key); firstSolve.set(key, Math.min(firstSolve.get(key) ?? Infinity, s.creationTimeSeconds)); }
      const a = attempted.get(key);
      if (a) a.attempts++;
      else attempted.set(key, { key, contestId: id, index: p.index, name: p.name, tags: p.tags, attempts: 1, lastVerdict: s.verdict, lastTime: s.creationTimeSeconds, link: `https://codeforces.com/${id >= 100000 ? 'gym' : 'contest'}/${id}/problem/${p.index}` });
    }
    const dailySolveCounts: Record<string, number> = {};
    for (const ts of firstSolve.values()) { const date = localDate(new Date(ts * 1000)); dailySolveCounts[date] = (dailySolveCounts[date] || 0) + 1; }
    const attemptedUnsolvedProblems = [...attempted.values()].filter(a => !userSolvedSet.has(a.key));
    const problemKeys = new Set(problems.map(p => makeKey(p.contestId,p.index)));
    const solvedCountInProblems = [...problemKeys].filter(k => userSolvedSet.has(k)).length;
    const attemptedCountInProblems = attemptedUnsolvedProblems.filter(a => problemKeys.has(a.key)).length;
    const tagCounts: Record<string, number> = {};
    for (const p of problems) for (const tag of p.tags) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    return { userSolvedSet, dailySolveCounts, attemptedUnsolvedProblems, solvedCountInProblems, attemptedCountInProblems, tagCounts, notTriedCount: Math.max(0, problemKeys.size - solvedCountInProblems - attemptedCountInProblems), solvingStreak: currentStreak(dailySolveCounts, new Date(`${today}T12:00:00`)), unsolvedProblems: problems.filter(p => !userSolvedSet.has(makeKey(p.contestId,p.index))) };
  }, [problems, submissions, today]);
  return <AppContext.Provider value={{ submissions, problems, handle, userInfo, loadingProblems, loadingUser, errorProblems, errorUser, fetchProblems, fetchAndMergeUserData, setHandleAndFetch: fetchAndMergeUserData, clearUser, refreshUserSubmissions: h => refresh(h), refreshContestUserSubmissions: (id,h) => refresh(h,id), ...computed }}>{children}</AppContext.Provider>;
}
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppContextProvider');
  return context;
}
