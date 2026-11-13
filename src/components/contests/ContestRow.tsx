"use client";
import React from "react";
import ContestNameCell, { ContestInfo } from "./ContestNameCell";
import ProblemBox, { ProblemInfo } from "./ProblemBox";
import EmptyBox from "./EmptyBox";

interface Props {
    contest: ContestInfo;
    problems: ProblemInfo[];
    maxColumns: number;
    onRefresh?: () => void; // passed down to ContestNameCell
    refreshing?: boolean;
}

const ContestRow: React.FC<Props> = ({ contest, problems, maxColumns, onRefresh, refreshing }) => {
    const cells = Array.from({ length: maxColumns }).map((_, idx) => {
        const p = problems[idx];
        return (
            <div key={idx} className="p-2 h-full flex items-stretch">
                {p ? <ProblemBox p={p} /> : <EmptyBox />}
            </div>
        );
    });

    return (
        <div className="flex border-b border-[var(--border)] min-h-[100px]">
            <div className="flex items-stretch">
                <ContestNameCell c={contest} onRefresh={onRefresh} refreshing={refreshing} />
            </div>
            <div className="flex items-stretch flex-1">
                {problems.length ? cells : <div className="desk-contest-missing"><p>{refreshing ? 'Fetching the problem list…' : 'Problem list not loaded'}</p><span>Use the round’s refresh button to fetch its problems.</span></div>}
            </div>
        </div>
    );
};

export default ContestRow;
