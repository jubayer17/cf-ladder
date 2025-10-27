import React, { useEffect, useState } from "react";
import { Problem, UserStatus } from "../types";
import { FaUser } from "react-icons/fa";
import { cfRatingColors } from "../utils/cfRatingColors";
import { getTagColor, getContrastColor } from "../utils/tagColors";

interface ProblemCardProps {
  problem: Problem;
  status: UserStatus;
  number?: number;
  isDarkMode?: boolean;
  contestDivision?: string;
  contestName?: string;
}

const getDivisionFromRating = (rating?: number | null) => {
  if (typeof rating !== "number") return null;
  if (rating >= 1900) return "Div. 1";
  if (rating >= 1600) return "Div. 2";
  if (rating >= 1300) return "Div. 3";
  return "Div. 4";
};

const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  status,
  number,
  isDarkMode = false,
}) => {
  // detect theme so we can apply black text for solved cards in light mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return isDarkMode;
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
    if (document.documentElement.classList.contains("dark")) return true;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const update = () => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark") return setIsDark(true);
      if (attr === "light") return setIsDark(false);
      if (document.documentElement.classList.contains("dark")) return setIsDark(true);
      const sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(!!sys);
    };

    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    const onStorage = (e: StorageEvent) => { if (e.key === "theme") update(); };
    window.addEventListener("storage", onStorage);

    return () => {
      mo.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const division = getDivisionFromRating(problem.rating);

  const bgColor =
    status === "solved"
      ? "var(--green-bg)"
      : status === "failed"
        ? "var(--red-bg)"
        : "var(--card-bg)";

  // for solved/failed cards: dark -> var(--button-text), light -> black
  const solvedOrFailed = status === "solved" || status === "failed";
  const contentColor = solvedOrFailed ? (isDark ? "var(--button-text)" : "#000000") : "var(--foreground)";

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
      <div className="flex items-center gap-2 min-w-[50px] font-mono font-semibold text-md" style={{ color: contentColor }}>
        {number && <span className="font-bold" style={{ color: contentColor }}>{number}.</span>}
        <span style={{ color: contentColor }}>{problem.name}</span>

        <span
          className="px-2 py-1 border-2 mx-3 border-blue-700 text-xs rounded"
          style={{ backgroundColor: "var(--card-bg)", color: contentColor }}
        >
          {problem.index}
        </span>

        {/* {division && (
          <span
            aria-hidden
            className={`ml-1 px-2 py-0.5 rounded text-sm font-medium flex-shrink-0 ${isDark ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-800"
              }`}
            style={{
              border: isDark
                ? "1px solid rgba(96,165,250,0.12)"
                : "1px solid rgba(59,130,246,0.12)",
              // ensure badge text follows computed content color (black in light solved cards, white in dark)
              color: solvedOrFailed ? (isDark ? "var(--button-text)" : "#000000") : "var(--foreground)"
            }}
            title={division}
          >
            {division}
          </span>
        )} */}

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
          const { bg, text } = getTagColor(tag, isDark);
          return (
            <span
              key={`${tag}-${idx}`}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: bg, color: text }}
            >
              {tag}
            </span>
          );
        })}
      </div>

      {/* Submission icon + count */}
      <div className="ml-auto mr-5 flex items-center gap-1 font-semibold text-sm" style={{ color: contentColor }}>
        <FaUser className="w-5 h-5" style={{ color: contentColor }} />
        <span style={{ color: contentColor }}>{problem.solvedCount ?? 0}</span>
      </div>
    </a>
  );
};

export default ProblemCard;
