"use client";
import React from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";

const Unsolved: React.FC = () => {
    const { attemptedUnsolvedProblems } = useAppContext();

    if (!attemptedUnsolvedProblems || attemptedUnsolvedProblems.length === 0) {
        return (
            <div className="text-sm text-gray-400">
                No attempted-but-unsolved problems.
            </div>
        );
    }

    const filtered = attemptedUnsolvedProblems.filter(
        (p) =>
            p.contestId &&
            Number.isInteger(p.contestId) &&
            p.contestId > 0 &&
            /^[A-Z0-9]+$/.test(p.index)
    );

    if (filtered.length === 0) {
        return (
            <div className="text-sm text-gray-400">
                No valid attempted problems to show.
            </div>
        );
    }

    const sorted = [...filtered].sort(
        (a, b) => (b.lastTime ?? 0) - (a.lastTime ?? 0)
    );

    // Show only first 40 problems
    const limited = sorted.slice(0, 40);
    const hasMore = sorted.length > 40;

    return (
        <div className="flex flex-col gap-6">
            {/* Problems Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-4">
                {limited.map((p) => {
                    const id = `${p.contestId}-${p.index}`;
                    return (
                        <a
                            key={p.key}
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="focus:outline-none"
                        >
                            <div
                                className="flex items-center justify-center rounded-xl p-3 cursor-pointer select-none 
                                    transform transition hover:-translate-y-1 hover:shadow-md"
                                style={{
                                    background: "var(--card-bg)",
                                    color: "var(--foreground)",
                                }}
                            >
                                <span className="text-sm font-semibold font-mono">{id}</span>
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* See All Button */}
            {hasMore && (
                <div className="flex justify-center mt-4">
                    <Link
                        href="/unsolved"
                        className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                        See All Unsolved Problems →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Unsolved;
