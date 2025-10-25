"use client";

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Ladder from "../components/Ladder";
import Navbar from "../components/navbar/Navbar";
import EnterHandle from "../components/navbar/EnterHandle";
import PersonalInfo from "../components/PersonalInfo";
import type { Problem, UserStatus } from "../types";

type ProblemsResponse = Record<string, Problem[]>;

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

// keys
const CACHE_KEY = "cf_problems_cache_v1";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const USER_HANDLE_KEY = "cf_user_handle_v1";
const USER_INFO_KEY = "cf_user_info_v1";
const USER_SOLVED_KEY = "cf_user_solved_v1";
const TAG_COUNTS_KEY = "cf_tag_counts_v1";

const Home: NextPage = () => {
  // problems - initialize from cache synchronously for instant UI
  const [problems, setProblems] = useState<Problem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as {
        ts: number;
        problems: Problem[];
      } | null;
      if (!parsed) return [];
      if (Date.now() - parsed.ts <= CACHE_TTL) {
        return parsed.problems || [];
      }
    } catch (err) {
      console.warn("problems cache read failed:", err);
    }
    return [];
  });

  // tag counts: map tag -> total problems for that tag (cached)
  const [tagCounts, setTagCounts] = useState<Record<string, number>>(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(TAG_COUNTS_KEY)
          : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [loading, setLoading] = useState<boolean>(problems.length === 0);
  const [error, setError] = useState<string | null>(null);

  // restore user data from localStorage (lazy)
  const [handleSubmitted, setHandleSubmitted] = useState<string | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(USER_HANDLE_KEY);
    } catch {
      return null;
    }
  });

  const [userInfo, setUserInfo] = useState<CFUserInfo | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(USER_INFO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [userSolvedSet, setUserSolvedSet] = useState<Set<string>>(() => {
    try {
      if (typeof window === "undefined") return new Set();
      const raw = localStorage.getItem(USER_SOLVED_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  // helpers
  const flattenProblemsResponse = (
    data: ProblemsResponse | Problem[]
  ): Problem[] =>
    Array.isArray(data) ? (data as Problem[]) : Object.values(data).flat();

  const computeTagCounts = (list: Problem[]): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const p of list) {
      if (!Array.isArray(p.tags)) continue;
      for (const t of p.tags) map[t] = (map[t] || 0) + 1;
    }
    return map;
  };

  const saveProblemsCache = (list: Problem[]) => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), problems: list })
      );
    } catch (err) {
      console.warn("Failed to save problems cache:", err);
    }
  };

  const saveTagCountsCache = (map: Record<string, number>) => {
    try {
      localStorage.setItem(TAG_COUNTS_KEY, JSON.stringify(map));
    } catch (err) {
      console.warn("Failed to save tag counts cache:", err);
    }
  };

  const saveUserSolvedCache = (set: Set<string>) => {
    try {
      localStorage.setItem(USER_SOLVED_KEY, JSON.stringify(Array.from(set)));
    } catch (err) {
      console.warn("Failed to save user solved cache:", err);
    }
  };

  const saveUserInfoCache = (info: CFUserInfo | null) => {
    try {
      if (info) localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
      else localStorage.removeItem(USER_INFO_KEY);
    } catch (err) {
      console.warn("Failed to save user info cache:", err);
    }
  };

  // background fetch problems once on mount (silent update if cache exists)
  useEffect(() => {
    let cancelled = false;
    const fetchProblems = async () => {
      if (problems.length === 0) setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:4000/api/problems");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = (await res.json()) as ProblemsResponse | Problem[];
        const allProblems = flattenProblemsResponse(data);
        if (cancelled) return;
        setProblems(allProblems);
        saveProblemsCache(allProblems);

        // compute & cache tag counts immediately (so TagSelector has instant accurate counts next reload)
        const tc = computeTagCounts(allProblems);
        setTagCounts(tc);
        saveTagCountsCache(tc);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("Error fetching problems:", err);
        setError((err as Error)?.message ?? "Failed to fetch problems");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProblems();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // fetch submissions & user info helper (merges solved set so old cached solved remain instantly)
  const fetchAndMergeUserData = async (handle: string) => {
    try {
      // fetch submissions
      const resSub = await fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
          handle
        )}`
      );
      const dataSub = await resSub.json();
      if (dataSub.status !== "OK")
        throw new Error("Invalid handle submissions");

      const submissions: CFSubmission[] = dataSub.result || [];
      // start from cached solves so cached green marks persist instantly
      const newSolved = new Set<string>(userSolvedSet);
      submissions.forEach((sub) => {
        if (sub.verdict === "OK") {
          newSolved.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
      });

      setUserSolvedSet(newSolved);
      saveUserSolvedCache(newSolved);

      // fetch user info
      const resUser = await fetch(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(
          handle
        )}`
      );
      const dataUser = await resUser.json();
      if (dataUser.status !== "OK")
        throw new Error("Failed to fetch user info");
      const u = dataUser.result[0] as CFUserInfo;
      setUserInfo(u);
      saveUserInfoCache(u);
    } catch (err) {
      console.warn("Failed to refresh user data:", err);
      // don't blow up UI; cached data remains
    }
  };

  // If we have a saved handle on mount, do a background refresh of user data (after short delay)
  useEffect(() => {
    if (!handleSubmitted) return;
    const id = window.setTimeout(() => {
      fetchAndMergeUserData(handleSubmitted);
    }, 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSubmitted]);

  // called when EnterHandle or Navbar submits a handle explicitly
  const handleSubmit = async (handle: string) => {
    try {
      // Persist handle immediately so UI + EnterHandle stay consistent
      setHandleSubmitted(handle);
      localStorage.setItem(USER_HANDLE_KEY, handle);

      // fetch & merge user data
      await fetchAndMergeUserData(handle);
    } catch (err: unknown) {
      console.error("handleSubmit failed:", err);
      alert("Failed to fetch user submissions. Make sure handle is correct.");
    }
  };

  // called to clear the handle and cached user data
  const handleReset = () => {
    setUserInfo(null);
    setHandleSubmitted(null);
    setUserSolvedSet(new Set());
    try {
      localStorage.removeItem(USER_HANDLE_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      localStorage.removeItem(USER_SOLVED_KEY);
    } catch (err) {
      console.warn("Failed to remove user cache:", err);
    }
  };

  // compute totals for PersonalInfo from cached problems + cached solved set
  const totalSolved = userSolvedSet.size;
  const totalUnsolved = Math.max(0, problems.length - userSolvedSet.size);

  // collect unique tags for TagSelector (order stable)
  const allTags = Array.from(
    new Set(problems.flatMap((p) => p.tags || []))
  ).sort();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navbar onHandleSubmit={handleSubmit} onHandleClear={handleReset} />

      {/* PersonalInfo component (show immediately if cached) */}
      {userInfo && (
        <PersonalInfo
          profileImage={userInfo.titlePhoto}
          handle={userInfo.handle}
          ratingName={userInfo.rank}
          currentRating={userInfo.rating}
          maxRating={userInfo.maxRating}
          totalSolved={totalSolved}
          totalUnsolved={totalUnsolved}
        />
      )}

      <main className="container mx-auto p-4">
        {loading && problems.length === 0 ? (
          <div className="w-full text-center py-12 text-sm text-gray-500">
            Loading problems…
          </div>
        ) : error && problems.length === 0 ? (
          <div className="w-full text-center py-12 text-sm text-red-500">
            Error: {error}
          </div>
        ) : (
          // pass problems (could be cached) to Ladder and also pass tagCounts if needed
          <Ladder
            problems={problems}
            userSolvedSet={userSolvedSet}
          // optional: you can pass tagCounts/allTags to Ladder if it renders TagSelector internally
          // e.g. tagCounts={tagCounts} allTags={allTags}
          />
        )}
      </main>
    </div>
  );
};

export default Home;
