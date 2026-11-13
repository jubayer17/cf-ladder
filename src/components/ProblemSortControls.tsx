import React from "react";

interface ProblemSortControlsProps {
    sortOption: "acceptance" | "new" | "old";
    onSortChange: (v: "acceptance" | "new" | "old") => void;
    hideSolved: boolean;
    onHideSolvedChange: (v: boolean) => void;
}

const ProblemSortControls: React.FC<ProblemSortControlsProps> = ({
    sortOption,
    onSortChange,
    hideSolved,
    onHideSolvedChange,
}) => {
    return (
        <div className="desk-sort flex flex-wrap gap-3 justify-between items-center border-y py-3 text-xs font-mono">
            <div className="flex items-center gap-4">
                <label htmlFor="problem-sort" className="font-semibold">ORDER</label>
                <select
                    id="problem-sort"
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value as "acceptance" | "new" | "old")}
                    className="px-3 py-2 border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                >
                    <option value="new">Newest First</option>
                    <option value="old">Oldest First</option>
                    <option value="acceptance">Most Solved</option>
                </select>
            </div>

            <label className="flex items-center gap-2 text-[var(--foreground)] cursor-pointer">
                <input
                    type="checkbox"
                    checked={hideSolved}
                    onChange={(e) => onHideSolvedChange(e.target.checked)}
                    className="w-4 h-4 rounded border dark:bg-gray-800 dark:border-gray-700"
                />
                Hide Solved
            </label>
        </div>
    );
};

export default ProblemSortControls;
