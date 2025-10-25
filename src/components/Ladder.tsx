"use client";

import React, { useMemo, useState } from "react";
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
  const [userStatusMap, setUserStatusMap] = useState<
    Record<string, UserStatus>
  >({});

  const problemsForRating = useMemo(
    () => problems.filter((p) => p.rating === selectedRating),
    [problems, selectedRating]
  );

  const tags = useMemo(
    () => Array.from(new Set(problemsForRating.flatMap((p) => p.tags || []))),
    [problemsForRating]
  );


  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    problemsForRating.forEach((p) => {
      (p.tags || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [problemsForRating]);


  const filteredProblems = useMemo(
    () =>
      problemsForRating.filter(
        (p) => !selectedTag || p.tags?.includes(selectedTag)
      ),
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
            tags={tags}
            tagCounts={tagCounts}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>
      </div>

      <ProblemList
        problems={filteredProblems}
        userStatusMap={userStatusMap}
        userSolvedSet={userSolvedSet}
      />
      <Footer />
    </div>
  );
};

export default Ladder;
