import React from "react";
import Spinner from "@/components/contests/Spinner";
import ContestRow from "@/components/contests/ContestRow";
import type { ProblemInfo } from "@/components/contests/ProblemBox";
import type { ContestInfo } from "@/components/contests/ContestNameCell";

interface ContestListProps {
  loadingContests: boolean;
  loadingAllProblems: boolean;
  errorContests: string | null;
  contests: ContestInfo[];
  problemsMap: Record<number, ProblemInfo[]>;
  maxProblemsOnPage: number;
  perContestLoading: Record<number, boolean>;
  onRefreshContest: (id: number) => void;
}

export default function ContestList({
  loadingContests,
  loadingAllProblems,
  errorContests,
  contests,
  problemsMap,
  maxProblemsOnPage,
  perContestLoading,
  onRefreshContest,
}: ContestListProps) {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
      {(loadingContests || loadingAllProblems) && (
        <div className="p-4">
          <Spinner />
          <div className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            {loadingContests
              ? "Loading contests…"
              : "Loading contest problems… (background)"}
          </div>
        </div>
      )}

      {errorContests && (
        <div
          className={`p-4 ${
            errorContests.startsWith("✅")
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {errorContests}
        </div>
      )}

      {!loadingContests && !errorContests && (
        <div className="min-w-[900px]">
          <div className="flex items-center border-b bg-gray-50 dark:bg-slate-800 dark:border-slate-700 sticky top-0 z-10">
            <div className="flex items-center">
              <div className="p-2 w-[280px] font-semibold border-r text-gray-900 dark:text-gray-100 dark:border-slate-700">
                Contest
              </div>
            </div>
            <div className="flex items-center flex-1">
              {Array.from({ length: Math.max(1, maxProblemsOnPage) }).map(
                (_, i) => (
                  <div key={i} className="p-2 flex items-center justify-center">
                    <div className="w-[160px] font-semibold text-center text-gray-900 dark:text-gray-100">
                      Problem {i + 1}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {contests.map((c) => (
            <ContestRow
              key={c.id}
              contest={c}
              problems={problemsMap[c.id] || []}
              maxColumns={maxProblemsOnPage}
              onRefresh={() => onRefreshContest(c.id)}
              refreshing={!!perContestLoading[c.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
