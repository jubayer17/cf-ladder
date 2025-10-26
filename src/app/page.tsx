"use client";

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Ladder from "../components/Ladder";
import Navbar from "../components/navbar/Navbar";
import PersonalInfo from "../components/PersonalInfo";
import type { Problem, UserStatus } from "../types";

type ProblemsResponse = Record<string, Problem[]>;

const BASE_URL = "https://cf-ladder-backend.vercel.app";

interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
}
interface CFSubmission {
  problem: CFProblem;
  verdict?: string;
}
interface CFUserInfo {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  titlePhoto: string;
}

const CACHE_KEY = "cf_problems_cache_v1";
const CACHE_TTL = 1000 * 60 * 60;
const USER_HANDLE_KEY = "cf_user_handle_v1";
const USER_INFO_KEY = "cf_user_info_v1";
const USER_SOLVED_KEY = "cf_user_solved_v1";
const TAG_COUNTS_KEY = "cf_tag_counts_v1";

const Home: NextPage = () => {
  const [problems, setProblems] = useState<Problem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts <= CACHE_TTL) return parsed.problems || [];
    } catch { }
    return [];
  });

  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  // <-- keep loading initially true only when no cached items, but we will set true at every fetch start
  const [loading, setLoading] = useState(problems.length === 0);
  const [error, setError] = useState<string | null>(null);

  // USER state
  const [handleSubmitted, setHandleSubmitted] = useState<string | null>(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem(USER_HANDLE_KEY) : null;
    } catch {
      return null;
    }
  });
  const [userInfo, setUserInfo] = useState<CFUserInfo | null>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(USER_INFO_KEY) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [userSolvedSet, setUserSolvedSet] = useState<Set<string>>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(USER_SOLVED_KEY) : null;
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // loading state for user-specific fetches
  const [userLoading, setUserLoading] = useState(false);

  const flattenProblemsResponse = (data: ProblemsResponse | Problem[]): Problem[] =>
    Array.isArray(data) ? data : Object.values(data).flat();

  const computeTagCounts = (list: Problem[]) => {
    const map: Record<string, number> = {};
    for (const p of list) for (const t of p.tags || []) map[t] = (map[t] || 0) + 1;
    return map;
  };

  // Fetch problems once (cache + update)
  useEffect(() => {
    let cancelled = false;
    const fetchProblems = async () => {
      // <-- ALWAYS show loading while fetching (so ProblemList gets empty problems and shows skeleton)
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/problems`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const allProblems = flattenProblemsResponse(data);
        if (cancelled) return;
        setProblems(allProblems);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), problems: allProblems }));
        const tc = computeTagCounts(allProblems);
        setTagCounts(tc);
        localStorage.setItem(TAG_COUNTS_KEY, JSON.stringify(tc));
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to fetch problems");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProblems();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- User data fetch: run submissions + user.info in parallel for speed ---
  const fetchAndMergeUserData = async (handle: string) => {
    setUserLoading(true);
    try {
      const [subRes, userRes] = await Promise.all([
        fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`),
        fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`)
      ]);

      const [subData, userData] = await Promise.all([subRes.json(), userRes.json()]);

      if (!subData || subData.status !== "OK") throw new Error("Failed to fetch submissions");
      if (!userData || userData.status !== "OK") throw new Error("Failed to fetch user info");

      const submissions: CFSubmission[] = subData.result || [];
      const newSolved = new Set<string>(userSolvedSet);
      for (const s of submissions) {
        if (s.verdict === "OK") newSolved.add(`${s.problem.contestId}-${s.problem.index}`);
      }
      setUserSolvedSet(newSolved);
      localStorage.setItem(USER_SOLVED_KEY, JSON.stringify([...newSolved]));

      const info = userData.result[0] as CFUserInfo;
      setUserInfo(info);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
    } catch (err) {
      console.warn("User data fetch failed:", err);
      throw err;
    } finally {
      setUserLoading(false);
    }
  };

  // handle submission: persists handle and returns when fetch completes (so EnterHandle can await)
  const handleSubmit = async (handle: string) => {
    setHandleSubmitted(handle);
    localStorage.setItem(USER_HANDLE_KEY, handle);
    await fetchAndMergeUserData(handle);
  };

  // reset user data & caches
  const handleReset = () => {
    setUserInfo(null);
    setHandleSubmitted(null);
    setUserSolvedSet(new Set());
    try {
      localStorage.removeItem(USER_HANDLE_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      localStorage.removeItem(USER_SOLVED_KEY);
    } catch {
      // ignore
    }
  };

  // lazy refresh of user data on mount if a handle was saved but no userInfo exists
  useEffect(() => {
    if (!handleSubmitted) return;
    if (userInfo && userSolvedSet && userSolvedSet.size > 0) return;
    const id = window.setTimeout(() => {
      fetchAndMergeUserData(handleSubmitted).catch(() => { });
    }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSolved = userSolvedSet.size;
  const totalUnsolved = Math.max(0, problems.length - totalSolved);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navbar
        handle={handleSubmitted ?? undefined}
        onHandleSubmit={handleSubmit}
        onHandleClear={handleReset}
        userLoading={userLoading}
      />

      {userInfo ? (
        <PersonalInfo
          profileImage={userInfo.titlePhoto}
          handle={userInfo.handle}
          currentRating={userInfo.rating}
          maxRating={userInfo.maxRating}
          totalSolved={totalSolved}
          totalUnsolved={totalUnsolved}
          isLoading={userLoading}
        />
      ) : userLoading ? (
        <div className="container mx-auto p-4">
          <div className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      ) : null}

      <main className="container mx-auto p-4">
        {loading ? (
          // pass empty list when loading so ProblemList shows its skeleton cards
          <Ladder problems={[]} userSolvedSet={userSolvedSet} />
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-500">Error: {error}</div>
        ) : (
          <Ladder problems={problems} userSolvedSet={userSolvedSet} />
        )}
      </main>
    </div>
  );
};

export default Home;
