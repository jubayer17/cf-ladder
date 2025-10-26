import React, { useState, useEffect, useMemo } from "react";
import ProblemCard from "./ProblemCard";
import ProblemSortControls from "./ProblemSortControls";
import { Problem, UserStatus } from "../types";
import { paginate } from "../utils/paginate";

interface ProblemListProps {
  problems: Problem[];
  userStatusMap: Record<string, UserStatus>;
  userSolvedSet?: Set<string>;
  perPage?: number;
}

const CACHE_KEY = "cf_problems_cache_v1";
const CACHE_TTL = 1000 * 60 * 60;

const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  userStatusMap,
  userSolvedSet = new Set(),
  perPage = 30,
}) => {
  const [page, setPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [sortOption, setSortOption] = useState<"acceptance" | "new" | "old">("new");
  const [localProblems, setLocalProblems] = useState<Problem[]>([]);
  const [hideSolved, setHideSolved] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { ts: number; problems: Problem[] };
      if (!parsed || Date.now() - parsed.ts > CACHE_TTL) return;
      setLocalProblems(parsed.problems);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!problems?.length) return;
    setLocalProblems(problems);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), problems }));
    } catch {
      // ignore
    }
  }, [problems]);

  const source = localProblems.length ? localProblems : problems;

  // show loading skeleton when there are no problems yet
  const isLoading = source.length === 0;

  const filteredSorted = useMemo(() => {
    let filtered = [...source];
    if (hideSolved) {
      filtered = filtered.filter((p) => {
        const key = `${p.contestId}-${p.index}`;
        const status: UserStatus =
          userStatusMap[key] ?? (userSolvedSet.has(key) ? "solved" : "unsolved");
        return status !== "solved";
      });
    }

    switch (sortOption) {
      case "acceptance":
        return filtered.sort((a, b) => (b.solvedCount ?? 0) - (a.solvedCount ?? 0));
      case "old":
        return filtered.sort((a, b) => (a.contestId ?? 0) - (b.contestId ?? 0));
      case "new":
      default:
        return filtered.sort((a, b) => (b.contestId ?? 0) - (a.contestId ?? 0));
    }
  }, [source, sortOption, hideSolved, userStatusMap, userSolvedSet]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / perPage));
  const paged = paginate(filteredSorted, page, perPage);

  useEffect(() => setPageInput(String(page)), [page]);

  const handlePageChange = (num: number) => {
    if (num < 1) num = 1;
    else if (num > totalPages) num = totalPages;
    setPage(num);
  };

  // simple skeleton card used while loading
  const SkeletonCard = () => (
    <div className="w-full p-4 rounded-lg shadow-sm bg-[var(--card-bg)] animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4" aria-busy={isLoading}>
      {/* Controls: if loading, show disabled controls */}
      {isLoading ? (
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-64 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      ) : (
        <ProblemSortControls
          sortOption={sortOption}
          onSortChange={(v) => {
            setSortOption(v);
            handlePageChange(1);
          }}
          hideSolved={hideSolved}
          onHideSolvedChange={(v) => setHideSolved(v)}
        />
      )}

      {/* Problem list or skeletons */}
      {isLoading ? (
        // show 6 skeleton cards for perceived speed
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {paged.map((p, idx) => {
            const key = `${p.contestId}-${p.index}`;
            const status: UserStatus =
              userStatusMap[key] ?? (userSolvedSet.has(key) ? "solved" : "unsolved");
            const problemNumber = (page - 1) * perPage + idx + 1;
            return <ProblemCard key={key} problem={p} status={status} number={problemNumber} />;
          })}

          <div className="flex justify-center gap-2 mt-4 items-center">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              Prev
            </button>

            <span className="px-2 py-1 text-[var(--foreground)]">Page</span>

            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const num = parseInt(pageInput, 10);
                  handlePageChange(isNaN(num) ? 1 : num);
                }
              }}
              className="w-16 px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700 text-center appearance-none"
              inputMode="numeric"
              pattern="[0-9]*"
            />

            <span className="px-2 py-1 text-[var(--foreground)]">of {totalPages}</span>

            <button
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProblemList;
