"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    ReactNode,
} from "react";
import { Problem } from "@/types";

interface CFUserInfo {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    titlePhoto: string;
}

export interface AttemptInfo {
    key: string;
    contestId: number;
    index: string;
    name?: string;
    tags?: string[];
    attempts: number;
    lastVerdict?: string;
    lastTime?: number;
    link: string;
}

interface AppContextType {
    problems: Problem[];
    tagCounts: Record<string, number>;
    unsolvedProblems: Problem[];
    attemptedUnsolvedProblems: AttemptInfo[];
    handle: string | null;
    userInfo: CFUserInfo | null;
    userSolvedSet: Set<string>;
    loadingProblems: boolean;
    loadingUser: boolean;
    errorProblems: string | null;
    fetchProblems: () => Promise<void>;
    fetchAndMergeUserData: (handle: string) => Promise<void>;
    setHandleAndFetch: (handle: string) => Promise<void>;
    clearUser: () => void;

    solvedCountInProblems: number;
    attemptedCountInProblems: number;
    notTriedCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

/* constants */
const PRIMARY_BACKEND = "https://cf-problems-backend.vercel.app/api/problems";
const CF_PROBLEMSET = "https://codeforces.com/api/problemset.problems";
const CACHE_KEY = "cf_problems_cache_v1";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const USER_HANDLE_KEY = "cf_user_handle_v1";
const USER_INFO_KEY = "cf_user_info_v1";
const USER_SOLVED_KEY = "cf_user_solved_v1";
const TAG_COUNTS_KEY = "cf_tag_counts_v1";
const ATTEMPTED_KEY = "cf_attempted_unsolved_v1";

/* helpers */
const normalizeIndex = (idx: any) => String(idx ?? "").toUpperCase().trim();
export const makeKey = (contestId: number | string | undefined, index: any) =>
    `${String(contestId ?? "")}-${normalizeIndex(index)}`;

const flattenProblemsResponse = (data: any) => {
    if (!data) return [];
    if (data.result && Array.isArray(data.result.problems))
        return data.result.problems;
    if (Array.isArray(data)) return data;
    if (typeof data === "object") {
        const vals = Object.values(data).flat();
        return vals;
    }
    return [];
};

const computeTagCounts = (list: Problem[]) => {
    const map: Record<string, number> = {};
    for (const p of list)
        for (const t of p.tags || []) map[t] = (map[t] || 0) + 1;
    return map;
};

const validIndex = (idx: any) =>
    typeof idx === "string" && /^[A-Za-z0-9]+$/.test(idx);

const safeFetchText = async (url: string, timeoutMs = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        const text = await res.text();
        clearTimeout(id);
        return { ok: res.ok, text };
    } catch (err) {
        clearTimeout(id);
        return { ok: false, text: "" };
    }
};

/* provider */
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [errorProblems, setErrorProblems] = useState<string | null>(null);

    const [handle, setHandle] = useState<string | null>(() =>
        typeof window !== "undefined"
            ? localStorage.getItem(USER_HANDLE_KEY)
            : null
    );

    const [userInfo, setUserInfo] = useState<CFUserInfo | null>(null);
    const [userSolvedSet, setUserSolvedSet] = useState<Set<string>>(new Set());
    const [attemptedUnsolvedProblems, setAttemptedUnsolvedProblems] = useState<
        AttemptInfo[]
    >([]);
    const [loadingUser, setLoadingUser] = useState(false);

    const fetchProblemsPromiseRef = useRef<Promise<void> | null>(null);

    const fetchProblems = async () => {
        if (problems.length > 0) return;
        if (fetchProblemsPromiseRef.current)
            return fetchProblemsPromiseRef.current;

        const p = (async () => {
            setLoadingProblems(true);
            try {
                const r = await safeFetchText(PRIMARY_BACKEND);
                if (r.ok) {
                    const parsed = JSON.parse(r.text);
                    const allProblems = flattenProblemsResponse(parsed);
                    setProblems(allProblems);
                    setTagCounts(computeTagCounts(allProblems));
                    localStorage.setItem(
                        CACHE_KEY,
                        JSON.stringify({ ts: Date.now(), problems: allProblems })
                    );
                } else {
                    throw new Error("Primary failed");
                }
            } catch {
                const r2 = await safeFetchText(CF_PROBLEMSET);
                const parsed = JSON.parse(r2.text);
                const allProblems = flattenProblemsResponse(parsed);
                setProblems(allProblems);
                setTagCounts(computeTagCounts(allProblems));
            } finally {
                setLoadingProblems(false);
            }
        })();

        fetchProblemsPromiseRef.current = p;
        await p;
        fetchProblemsPromiseRef.current = null;
    };

    const fetchAllSubmissions = async (h: string) => {
        let from = 1;
        let all: any[] = [];
        const count = 1000;
        while (true) {
            const url = `https://codeforces.com/api/user.status?handle=${h}&from=${from}&count=${count}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.result?.length) break;
            all = all.concat(data.result);
            if (data.result.length < count) break;
            from += count;
        }
        return all;
    };

    const fetchAndMergeUserData = async (h: string) => {
        setLoadingUser(true);
        try {
            const [subs, infoRes] = await Promise.all([
                fetchAllSubmissions(h),
                fetch(`https://codeforces.com/api/user.info?handles=${h}`),
            ]);

            const userInfoJson = await infoRes.json();
            const info = userInfoJson?.result?.[0];
            if (info) setUserInfo(info);

            const newSolved = new Set<string>();
            const attempted: Record<string, AttemptInfo> = {};

            for (const s of subs) {
                const p = s.problem || {};
                const contestId = Number(p.contestId);
                const idx = normalizeIndex(p.index);
                if (!validIndex(idx)) continue;
                const key = makeKey(contestId, idx);

                if (s.verdict === "OK") newSolved.add(key);
                if (!attempted[key])
                    attempted[key] = {
                        key,
                        contestId,
                        index: idx,
                        name: p.name,
                        tags: p.tags || [],
                        attempts: 0,
                        link: `https://codeforces.com/contest/${contestId}/problem/${idx}`,
                    };
                attempted[key].attempts++;
            }

            const attemptedUnsolved = Object.values(attempted).filter(
                (a) => !newSolved.has(a.key)
            );

            setUserSolvedSet(newSolved);
            setAttemptedUnsolvedProblems(attemptedUnsolved);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUser(false);
        }
    };

    const setHandleAndFetch = async (h: string) => {
        setHandle(h);
        localStorage.setItem(USER_HANDLE_KEY, h);

        // 🧠 ensure problems are ready first
        if (problems.length === 0) await fetchProblems();

        // 🧩 now fetch user data after problems are guaranteed
        await fetchAndMergeUserData(h);
    };

    const clearUser = () => {
        setHandle(null);
        setUserInfo(null);
        setUserSolvedSet(new Set());
        setAttemptedUnsolvedProblems([]);
        localStorage.removeItem(USER_HANDLE_KEY);
    };

    // 🧮 derived counts
    const problemKeySet = useMemo(() => {
        const s = new Set<string>();
        for (const p of problems) {
            const k = makeKey(p.contestId, p.index);
            s.add(k);
        }
        return s;
    }, [problems]);

    const solvedCountInProblems = useMemo(() => {
        let c = 0;
        for (const k of problemKeySet) if (userSolvedSet.has(k)) c++;
        return c;
    }, [problemKeySet, userSolvedSet]);

    const attemptedCountInProblems = useMemo(() => {
        let c = 0;
        for (const a of attemptedUnsolvedProblems)
            if (problemKeySet.has(a.key)) c++;
        return c;
    }, [attemptedUnsolvedProblems, problemKeySet]);

    const notTriedCount = useMemo(() => {
        const total = problemKeySet.size;
        const count = Math.max(
            0,
            total - solvedCountInProblems - attemptedCountInProblems
        );
        return count;
    }, [problemKeySet, solvedCountInProblems, attemptedCountInProblems]);

    useEffect(() => {
        if (problems.length === 0) fetchProblems();
    }, []);

    useEffect(() => {
        if (!handle) return;
        // 👇 ensures data syncs even on reload
        if (
            problems.length > 0 &&
            (userSolvedSet.size === 0 || attemptedUnsolvedProblems.length === 0)
        ) {
            setHandleAndFetch(handle);
        }
    }, [handle, problems]);

    return (
        <AppContext.Provider
            value={{
                problems,
                tagCounts,
                unsolvedProblems: [],
                attemptedUnsolvedProblems,
                handle,
                userInfo,
                userSolvedSet,
                loadingProblems,
                loadingUser,
                errorProblems,
                fetchProblems,
                fetchAndMergeUserData,
                setHandleAndFetch,
                clearUser,
                solvedCountInProblems,
                attemptedCountInProblems,
                notTriedCount,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx)
        throw new Error("useAppContext must be used within AppContextProvider");
    return ctx;
};
