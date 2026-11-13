"use client";

import React, { useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/codeforces";
import ProblemCard from "./ProblemCard";
import ProblemSortControls from "./ProblemSortControls";
import { Problem, UserStatus } from "../types";
import { paginate } from "../utils/paginate";
import { loadContestMap, parseDivisionFromContestName } from "../utils/cfContests";

interface ProblemListProps {
  problems: Problem[];
  userStatusMap: Record<string, UserStatus>;
  userSolvedSet?: Set<string>;
  perPage?: number;
  selectedTag?: string | null;
  onStatusChange?: (problemKey: string, status: UserStatus) => void;
}

const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  userStatusMap,
  userSolvedSet = new Set(),
  perPage = 30,
}) => {
  const [page, setPage] = useState<number>(1);

  const [sortOption, setSortOption] = useState<"acceptance" | "new" | "old">("new");
  const [search, setSearch] = useState("");
  const [hideSolved, setHideSolved] = useState<boolean>(false);

  useEffect(() => {
    const saved = storage.get("cf_hide_solved");
    if (saved !== null) {
      // Hydrate the persisted preference after server rendering.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHideSolved(saved === "true");
    }
  }, []);

  const handleHideSolvedChange = (v: boolean) => {
    setHideSolved(v);
    storage.set("cf_hide_solved", String(v));
    setPage(1);
  };

  const [contestMap, setContestMap] = useState<Record<number, string> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const map = await loadContestMap();
        if (!mounted) return;
        setContestMap(map);
      } catch {
        if (!mounted) return;
        setContestMap(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const source = problems;

  const filteredSorted = useMemo(() => {
    let list = source.filter(p => `${p.contestId}${p.index} ${p.name}`.toLowerCase().includes(search.toLowerCase().trim()));

    if (hideSolved) {
      list = list.filter((p) => {
        const key = `${p.contestId}-${p.index}`;
        const status: UserStatus =
          userStatusMap[key] ?? (userSolvedSet.has(key) ? "solved" : "unsolved");
        return status !== "solved";
      });
    }

    switch (sortOption) {
      case "acceptance":
        list.sort((a, b) => (b.solvedCount ?? 0) - (a.solvedCount ?? 0));
        break;
      case "old":
        list.sort((a, b) => (a.contestId ?? 0) - (b.contestId ?? 0));
        break;
      case "new":
      default:
        list.sort((a, b) => (b.contestId ?? 0) - (a.contestId ?? 0));
        break;
    }
    return list;
  }, [source, sortOption, hideSolved, userStatusMap, userSolvedSet, search]);

  const contestDivisionMap = useMemo(() => {
    if (!contestMap) return null;
    const m: Record<number, string | null> = {};
    for (const idStr of Object.keys(contestMap)) {
      const id = Number(idStr);
      m[id] = parseDivisionFromContestName(contestMap[id]);
    }
    return m;
  }, [contestMap]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = paginate(filteredSorted, currentPage, perPage);



  const handlePageChange = (num: number) => {
    if (num < 1) num = 1;
    else if (num > totalPages) num = totalPages;
    setPage(num);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex-1 max-w-lg"><span className="sr-only">Search problems</span><input type="search" aria-label="Search problems" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or problem ID…" className="w-full border border-foreground bg-[var(--card)] px-4 py-3 text-sm font-sans" /></label>
        <p className="text-sm text-muted-foreground font-sans" role="status">{filteredSorted.length.toLocaleString()} problems</p>
      </div>
      <ProblemSortControls
        sortOption={sortOption}
        onSortChange={(v) => {
          setSortOption(v);
          handlePageChange(1);
        }}
        hideSolved={hideSolved}
        onHideSolvedChange={handleHideSolvedChange}
      />

      {filteredSorted.length === 0 && <div className="border border-dashed py-16 text-center font-sans"><p className="font-semibold">No matching problems</p><p className="mt-2 text-sm text-muted-foreground">Try another rating, search term, or turn off Hide solved.</p></div>}
      {paged.map((p, idx) => {
        const key = `${p.contestId}-${p.index}`;
        const status: UserStatus =
          userStatusMap[key] ?? (userSolvedSet.has(key) ? "solved" : "unsolved");
        const problemNumber = (currentPage - 1) * perPage + idx + 1;

        const contestId = p.contestId ?? undefined;
        const division =
          contestId && contestDivisionMap && contestDivisionMap[contestId] ? contestDivisionMap[contestId] : null;

        const contestName = contestId && contestMap ? contestMap[contestId] : undefined;

        return (
          <ProblemCard
            key={key}
            problem={p}
            status={status}
            number={problemNumber}
            contestDivision={division ?? undefined}
            contestName={contestName}
          // onChangeStatus={(s) => onStatusChange?.(key, s)}
          />
        );
      })}

      <div className="flex justify-center gap-2 mt-4 items-center">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-2 py-1 text-[var(--foreground)]">Page</span>

        <input
          type="text"
          aria-label="Page number"
          key={currentPage}
          defaultValue={currentPage}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const num = parseInt(e.currentTarget.value, 10);
              const valid = Math.min(totalPages, Math.max(1, isNaN(num) ? 1 : num));
              e.currentTarget.value = String(valid);
              handlePageChange(valid);
            }
          }}
          className="w-16 px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700 text-center appearance-none"
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <span className="px-2 py-1 text-[var(--foreground)]">of {totalPages}</span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 dark:text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProblemList;
