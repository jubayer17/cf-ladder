import React from "react";
import StatePanel from "@/components/StatePanel";
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
    <div className="desk-contest-table">
      {(loadingContests || loadingAllProblems) && <div className="p-4"><StatePanel tone="loading" title={loadingContests ? 'Loading the contest archive…' : 'Updating contest problems…'} description={contests.length ? 'The previous results stay available while the archive refreshes.' : 'Fetching finished rounds from Codeforces.'} compact /></div>}

      {errorContests && <div className="p-4"><StatePanel tone="error" title="Contest data could not be updated" description={errorContests} compact /></div>}

      {!!contests.length && (
        <div className="min-w-[900px]">
          <div className="flex items-center border-b bg-[var(--muted)] dark:border-slate-700 sticky top-0 z-10">
            <div className="flex items-center">
              <div className="p-2 w-[280px] font-semibold border-r text-foreground dark:border-slate-700">
                Contest
              </div>
            </div>
            <div className="flex items-center flex-1">
              {Array.from({ length: Math.max(1, maxProblemsOnPage) }).map(
                (_, i) => (
                  <div key={i} className="p-2 flex items-center justify-center">
                    <div className="w-[160px] font-semibold text-center text-foreground">
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
