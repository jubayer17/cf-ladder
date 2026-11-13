"use client";
import { RotateCcw } from "lucide-react";
import React from "react";

export type ContestInfo = {
    id: number;
    name: string;
    category?: string;
    phase?: string;
    type?: string;
    durationSeconds?: number;
    startTimeSeconds?: number;
};

const formatStart = (s?: number) => {
    if (!s) return "—";
    try {
        return new Date(s * 1000).toLocaleString();
    } catch {
        return "—";
    }
};

const ContestNameCell: React.FC<{
    c: ContestInfo;
    onRefresh?: () => void;
    refreshing?: boolean;
}> = ({ c, onRefresh, refreshing }) => {
    const contestUrl = `https://codeforces.com/contest/${c.id}`;
    return (
        <div className="p-2 sticky left-0 bg-[var(--card)] border-r border-[var(--border)] w-[280px] h-full flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center">
                <a
                    className="block text-foreground font-semibold text-sm hover:underline hover:text-blue-600 dark:hover:text-blue-400 leading-tight transition-colors"
                    href={contestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {c.name}
                </a>
                <div className="text-xs mt-1 text-foreground">ID: {c.id}</div>
                <div className="text-xs mt-1 text-foreground">Started: {formatStart(c.startTimeSeconds)}</div>
            </div>

            {/* refresh icon inside the cell */}
            <div className="flex justify-end">
                <button
                    onClick={onRefresh}
                    disabled={!!refreshing}
                    title="Refresh this contest (fetch problems from network)"
                    className="p-1 rounded-none hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
                >
                    {refreshing ? (
                        <svg className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    ) : (
                        <RotateCcw size={16} className="text-muted-foreground" aria-hidden="true" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ContestNameCell;
