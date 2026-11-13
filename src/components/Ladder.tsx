"use client";

import React, { useMemo, useState } from "react";
import RatingSelector from "./RatingSelector";
import TagSelector from "./TagSelector";
import ProblemList from "./ProblemList";
import { useAppContext } from "@/context/AppContext";
import { Problem, UserStatus } from "../types";

interface LadderProps {
  problems: Problem[];
  userSolvedSet?: Set<string>;
}

const Ladder: React.FC<LadderProps> = ({
  problems,
  userSolvedSet = new Set(),
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(800);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { attemptedUnsolvedProblems } = useAppContext();
  const userStatusMap = useMemo(() => Object.fromEntries(attemptedUnsolvedProblems.map(p => [p.key, "failed" as UserStatus])), [attemptedUnsolvedProblems]);
  const [showTags, setShowTags] = useState<boolean>(false);


  const problemsForRating = useMemo(
    () => problems.filter((p) => p.rating === selectedRating),
    [problems, selectedRating]
  );


  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of problemsForRating) {
      for (const t of p.tags || []) counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [problemsForRating]);


  const sortedTags = useMemo(() => {
    const keys = Object.keys(tagCounts);
    keys.sort((a, b) => {
      const diff = (tagCounts[b] || 0) - (tagCounts[a] || 0);
      return diff !== 0 ? diff : a.localeCompare(b);
    });
    return keys;
  }, [tagCounts]);

  const filteredProblems = useMemo(
    () =>
      showTags && selectedTag
        ? problemsForRating.filter((p) => p.tags?.includes(selectedTag))
        : problemsForRating,
    [problemsForRating, selectedTag, showTags]
  );

  return (
    <div className="space-y-6 w-full font-sans">
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full">
          <RatingSelector
            selectedRating={selectedRating}
            onSelect={(rating) => { setSelectedRating(rating); setSelectedTag(null); }}
          />
        </div>

        <div className="w-full">
          <button
            aria-expanded={showTags}
            onClick={() => { setShowTags(!showTags); setSelectedTag(null); }}
            className="desk-filter-toggle px-3 py-2 text-xs font-mono"
            data-active={showTags}
          >
            {showTags ? "− Close topic filter" : "+ Filter by topic"}
          </button>
        </div>

        {showTags && (
          <div className="w-full">
            <TagSelector
              tags={sortedTags}
              tagCounts={tagCounts}
              selectedTag={selectedTag}
              onSelectTag={(t) => setSelectedTag(t)}
            />
          </div>
        )}
      </div>

      <ProblemList
        key={`${selectedRating}-${selectedTag || "all"}`}
        problems={filteredProblems}
        userStatusMap={userStatusMap}
        userSolvedSet={userSolvedSet}
        selectedTag={selectedTag}
      />

    </div>
  );
};

export default Ladder;
