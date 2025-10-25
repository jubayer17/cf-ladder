import React from "react";
import SuccessChart from "./SuccessChart";
import { getColorForRating, getRatingName, getHandleParts } from "../utils/ratingColors";

interface PersonalInfoProps {
  profileImage: string;
  handle: string;
  currentRating?: number | null;
  maxRating?: number | null;
  totalSolved?: number;
  totalUnsolved?: number;
  profileUrl?: string;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({
  profileImage,
  handle,
  currentRating = null,
  maxRating = null,
  totalSolved = 0,
  totalUnsolved = 0,
  profileUrl,
}) => {
  const color = getColorForRating(currentRating ?? undefined);
  const ratingName = getRatingName(currentRating ?? undefined);
  const handleParts = getHandleParts(handle, currentRating ?? undefined);

  const progress =
    typeof currentRating === "number" && typeof maxRating === "number" && maxRating > 0
      ? Math.max(0, Math.min(100, Math.round((currentRating / maxRating) * 100)))
      : 0;

  const bg = (c: string, a = 0.12) => {
    const hex = c.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  return (
    <div className="w-full pl-15 max-w-7xl mx-auto p-6 shadow-md rounded-2xl mt-4"
      style={{ backgroundColor: "var(--card-bg)", color: "var(--foreground)", transition: "background 0.3s, color 0.3s" }}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img src={profileImage} alt={`${handle} profile`}
            className="w-27 h-27 rounded-full border-2 object-cover"
            style={{ borderColor: "var(--blue-bg)" }} />

          <div className="flex flex-col gap-1">
            <div className="flex flex-col items-left gap-2">
              <span className="text-2xl font-semibold">
                {handleParts.map((p, i) => {
                  const isVar = typeof p.color === "string" && p.color.startsWith("var(");
                  const style: React.CSSProperties = isVar ? {} : { color: p.color };
                  const cls = p.color === "var(--lgm-first)" ? "lgm-first" : "";
                  return <span key={i} className={cls} style={style}>{p.text}</span>;
                })}
              </span>

              <span style={{ color, border: `1px solid ${bg(color, 0.18)}`, padding: "0.18rem 0.45rem", borderRadius: 8, fontWeight: 600, marginLeft: 1, width: "fit-content" }}>
                {ratingName}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <span className="px-2 py-1 rounded" style={{ backgroundColor: "var(--blue-bg)", color: "var(--button-text)" }}>
                Current Rating: {currentRating}
              </span>
              <span className="px-2 py-1 rounded" style={{ backgroundColor: "var(--green-bg)", color: "var(--button-text)" }}>
                Max Rating: {maxRating}
              </span>
              <span className="px-2 py-1 rounded" style={{ backgroundColor: "var(--blue-bg)", color: "var(--button-text)" }}>
                Solved: {totalSolved}
              </span>
              <span className="px-2 py-1 rounded cursor-pointer hover:opacity-80 transition"
                style={{ backgroundColor: "var(--red-bg)", color: "var(--button-text)" }}>
                Remaining: {totalUnsolved}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center sm:justify-end w-full sm:w-auto">
          <SuccessChart totalSolved={totalSolved} totalUnsolved={totalUnsolved} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="progress-wrap" aria-hidden style={{ width: 200, height: 10, marginTop: 12 }}>
          <div className="progress-inner" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color})` }} />
        </div>

      </div>
    </div>
  );
};

export default PersonalInfo;
