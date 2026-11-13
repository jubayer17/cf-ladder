"use client";

import React from "react";
import ProblemRatings from "@/components/stats/problemRatings";
import TagsDonut from "@/components/stats/TagsDonut";
import Heatmap from "@/components/Heatmap";
import { useAppContext } from "@/context/AppContext";

/* --------------------- Final Stats Page --------------------- */
export default function StatsPage(): React.ReactElement {
    const { handle, dailySolveCounts } = useAppContext();

    return (
        <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)] transition-colors">
            <div className="p-6">
                <div className="mb-6 mt-6">
                    <p className="desk-kicker">YOUR RECORD / THE NUMBERS</p><h1 className="text-4xl font-bold tracking-tight mt-3">Practice, on record.</h1>
                </div>

                {!handle && <div className="text-gray-600">Enter your Codeforces handle above to see problem rating and tag statistics.</div>}

                {handle && (
                    <div className="flex flex-col gap-6">
                        {/* Heatmap */}
                        <Heatmap dailyCounts={dailySolveCounts} />

                        {/* ProblemRatings appears first */}
                        <ProblemRatings key={`ratings-${handle}`} handle={handle} />

                        {/* TagsDonut appears below the ratings */}
                        <TagsDonut key={`tags-${handle}`} handle={handle} />
                    </div>
                )}
            </div>
        </div>
    );
}
