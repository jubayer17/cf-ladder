"use client";

import React, { useMemo, useState, useEffect } from "react";
import RatingSelector from "./RatingSelector";
import TagSelector from "./TagSelector";
import ProblemList from "./ProblemList";
import { Problem, UserStatus } from "../types";
import Footer from "./Footer";

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
  const [userStatusMap, setUserStatusMap] = useState<Record<string, UserStatus>>({});

  // clear selectedTag when rating changes (so stale tag won't remain)
  useEffect(() => {
    setSelectedTag(null);
  }, [selectedRating]);

  const problemsForRating = useMemo(
    () => problems.filter((p) => p.rating === selectedRating),
    [problems, selectedRating]
  );

  // compute counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of problemsForRating) {
      for (const t of p.tags || []) counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [problemsForRating]);

  // sort tags by count desc, then alphabetically
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
      problemsForRating.filter((p) => !selectedTag || p.tags?.includes(selectedTag)),
    [problemsForRating, selectedTag]
  );

  const handleStatusChange = (problemKey: string, status: UserStatus) => {
    setUserStatusMap((prev) => ({ ...prev, [problemKey]: status }));
  };

  return (
    <div className="space-y-6 w-full font-mono font-semibold">
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full">
          <RatingSelector
            selectedRating={selectedRating}
            onSelect={setSelectedRating}
          />
        </div>

        <div className="w-full">
          <TagSelector
            tags={sortedTags}
            tagCounts={tagCounts}
            selectedTag={selectedTag}
            onSelectTag={(t) => setSelectedTag(t)}
          />
        </div>
      </div>

      <ProblemList
        problems={filteredProblems}
        userStatusMap={userStatusMap}
        userSolvedSet={userSolvedSet}
        selectedTag={selectedTag}
        onStatusChange={handleStatusChange}
      />
      <Footer />
    </div>
  );
};

export default Ladder;
