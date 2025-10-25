import React from "react";
import { Problem, UserStatus } from "../types";
import { FaUser } from "react-icons/fa";
import { cfRatingColors } from "../utils/cfRatingColors";
import { getTagColor, getContrastColor } from "../utils/tagColors";

interface ProblemCardProps {
  problem: Problem;
  status: UserStatus;
  number?: number;
  isDarkMode?: boolean;
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  status,
  number,
  isDarkMode = false,
}) => {
  const bgColor =
    status === "solved"
      ? "var(--green-bg)"
      : status === "failed"
      ? "var(--red-bg)"
      : "var(--card-bg)";

  const contentColor =
    status === "solved" || status === "failed"
      ? "var(--button-text)"
      : "var(--foreground)";

  const problemURL =
    problem.contestId && problem.index
      ? `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
      : "#";

  return (
    <a
      href={problemURL}
      target="_blank"
      rel="noopener noreferrer"
      className="card w-full flex flex-col md:flex-row h-auto font-mono items-start md:items-center gap-4 p-5 rounded-lg shadow-md"
      style={{ backgroundColor: bgColor, color: contentColor }}
    >
      {/* Number + Problem name + index */}
      <div className="flex items-center gap-2 min-w-[50px] font-mono font-semibold text-md">
        {number && <span className="font-bold">{number}.</span>}
        <span>{problem.name}</span>
        <span
          className="px-2 py-1 border-2 mx-3 border-blue-700 text-xs rounded"
          style={{ backgroundColor: "var(--card-bg)", color: contentColor }}
        >
          {problem.index}
        </span>
      </div>

      {/* Rating */}
      {problem.rating && (
        <span
          className="px-3 py-1 ml-5 mr-5 rounded-full text-xs font-semibold min-w-[50px] text-center"
          style={{
            backgroundColor: cfRatingColors[problem.rating] || "#60a5fa",
            color: getContrastColor(cfRatingColors[problem.rating] || "#60a5fa"),
          }}
        >
          {problem.rating}
        </span>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 max-w-[600px]">
        {problem.tags.map((tag, idx) => {
          const { bg, text } = getTagColor(tag, isDarkMode);
          return (
            <span
              key={`${tag}-${idx}`} // ✅ unique key even if duplicate tag
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: bg, color: text }}
            >
              {tag}
            </span>
          );
        })}
      </div>

      {/* Submission icon + count */}
      <div className="ml-auto mr-5 flex items-center gap-1 font-semibold text-sm">
        <FaUser className="w-5 h-5" />
        <span>{problem.solvedCount ?? 0}</span>
      </div>
    </a>
  );
};

export default ProblemCard;
