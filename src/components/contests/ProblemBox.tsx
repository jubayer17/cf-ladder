"use client";
import React from "react";

export type ProblemInfo = {
    contestId?: number;
    index?: string;
    name?: string;
    points?: number;
    rating?: number;
    solved?: boolean; // <-- important flag from page logic
    failed?: boolean; // failed (submitted but not OK)
    verdict?: string; // Specific verdict (e.g. WRONG_ANSWER, TIME_LIMIT_EXCEEDED)
};

const normalizeIndex = (idx: any) => String(idx ?? "").toUpperCase().trim();

// rating -> colour classes (tailwind) - improved for both light and dark modes
const ratingToColor = (rating?: number) => {
    if (!rating) return "bg-gray-200 text-gray-900 dark:bg-slate-700 dark:text-gray-100 border border-gray-300 dark:border-slate-600";
    if (rating < 1200) return "bg-gray-200 text-gray-900 dark:bg-slate-700 dark:text-gray-100 border border-gray-300 dark:border-slate-600";
    if (rating < 1400) return "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 border border-green-300 dark:border-green-700";
    if (rating < 1600) return "bg-cyan-200 text-cyan-900 dark:bg-cyan-800 dark:text-cyan-100 border border-cyan-300 dark:border-cyan-700";
    if (rating < 1900) return "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700";
    if (rating < 2200) return "bg-violet-200 text-violet-900 dark:bg-violet-800 dark:text-violet-100 border border-violet-300 dark:border-violet-700";
    if (rating < 2400) return "bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100 border border-orange-300 dark:border-orange-700";
    return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100 border border-red-300 dark:border-red-700";
};

// verdict -> short text
const formatVerdict = (v?: string) => {
    if (!v) return "Failed";
    if (v === "WRONG_ANSWER") return "WA";
    if (v === "TIME_LIMIT_EXCEEDED") return "TLE";
    if (v === "COMPILATION_ERROR") return "CE";
    if (v === "RUNTIME_ERROR") return "RTE";
    if (v === "MEMORY_LIMIT_EXCEEDED") return "MLE";
    if (v === "CHALLENGED") return "Hacked";
    if (v === "SKIPPED") return "Skip";
    if (v === "TESTING") return "Testing";
    return "Failed";
};

// verdict -> color class
const verdictToColor = (v?: string) => {
    if (!v) return "bg-red-500 text-white dark:bg-red-600 dark:text-white border border-red-600 dark:border-red-500 shadow-md"; // Default fail

    switch (v) {
        case "WRONG_ANSWER":
            return "bg-red-500 text-white dark:bg-red-600 dark:text-white border border-red-600 dark:border-red-500 shadow-md";
        case "TIME_LIMIT_EXCEEDED":
        case "MEMORY_LIMIT_EXCEEDED":
            return "bg-orange-500 text-white dark:bg-orange-600 dark:text-white border border-orange-600 dark:border-orange-500 shadow-md";
        case "COMPILATION_ERROR":
            return "bg-slate-500 text-white dark:bg-slate-600 dark:text-white border border-slate-600 dark:border-slate-500 shadow-md";
        case "RUNTIME_ERROR":
            return "bg-rose-500 text-white dark:bg-rose-600 dark:text-white border border-rose-600 dark:border-rose-500 shadow-md";
        case "TESTING":
            return "bg-blue-500 text-white dark:bg-blue-600 dark:text-white border border-blue-600 dark:border-blue-500 shadow-md animate-pulse";
        default:
            return "bg-red-500 text-white dark:bg-red-600 dark:text-white border border-red-600 dark:border-red-500 shadow-md";
    }
};

const ProblemBox: React.FC<{ p?: ProblemInfo }> = ({ p }) => {
    const idx = normalizeIndex(p?.index);
    const title = p?.name ?? "-";
    const rating = p?.rating;
    const solved = !!p?.solved;
    const failed = !!p?.failed;
    const verdict = p?.verdict;

    // solved override is bold green; failed override is bold red (as requested)
    let colorClass = ratingToColor(rating);
    if (solved) {
        colorClass = "bg-green-500 text-white dark:bg-green-600 dark:text-white border border-green-600 dark:border-green-500 shadow-md";
    } else if (failed) {
        // Force RED for all failed states to ensure "FAILED" indicator is consistent
        colorClass = "bg-red-500 text-white dark:bg-red-600 dark:text-white border border-red-600 dark:border-red-500 shadow-md";
    }

    const url =
        p?.contestId && idx ? `https://codeforces.com/contest/${p.contestId}/problem/${idx}` : "#";

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block w-[160px] h-full transition-transform hover:scale-105">
            <div
                className={`p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow ${colorClass} w-full h-full flex flex-col justify-between min-h-[80px]`}
            >
                <div className="flex-1 flex items-center">
                    <div className="text-sm font-medium leading-tight break-words w-full">
                        {idx ? `${idx}. ${title}` : "-"}
                    </div>
                </div>

                <div className="mt-2 flex items-center justify-between flex-shrink-0">
                    <div className="text-xs opacity-90">{rating ? `${rating}` : "—"}</div>
                    {solved ? (
                        <div className="text-[10px] uppercase font-semibold tracking-wider">Solved</div>
                    ) : failed ? (
                        <div className="text-[10px] uppercase font-semibold tracking-wider" title={verdict || "Failed"}>FAILED</div>
                    ) : null}
                </div>
            </div>
        </a>
    );
};

export default ProblemBox;
