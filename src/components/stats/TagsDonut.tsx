"use client";
import StatePanel from "@/components/StatePanel";
import React, { useMemo, useState } from 'react';
import { useAppContext, makeKey } from '@/context/AppContext';
const MAX_TAGS = 30;
export default function TagsDonut({ handle: propHandle }: { handle?: string | null }) {
    const { problems, submissions, loadingUser } = useAppContext();
    const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
    const loading = loadingUser && !submissions.length;
    const { tagCounts, otherCount, uniqueSolvedCount } = useMemo(() => {
        const problemMap = new Map(problems.map(p => [makeKey(p.contestId,p.index),p]));
        const seen = new Set<string>(); const counts: Record<string, number> = {}; let other = 0;
        for (const s of submissions) {
            if (s.verdict !== 'OK') continue;
            const key = makeKey(s.problem.contestId ?? s.contestId,s.problem.index);
            if (seen.has(key)) continue; seen.add(key);
            const tags = problemMap.get(key)?.tags || s.problem.tags || [];
            if (!tags.length) other++;
            for (const tag of tags) counts[tag] = (counts[tag] || 0) + 1;
        }
        return { tagCounts: counts, otherCount: other, uniqueSolvedCount: seen.size };
    }, [problems, submissions]);
    // entries sorted by count desc; include 'Other' as last if present
    const entries = useMemo(() => {
        const arr = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
        arr.sort((a, b) => b.count - a.count);
        let top = arr.slice(0, MAX_TAGS);
        // if there are more tag buckets beyond MAX_TAGS, collapse remainder to "Other-tags"
        if (arr.length > MAX_TAGS) {
            const rest = arr.slice(MAX_TAGS);
            const restSum = rest.reduce((s, r) => s + r.count, 0);
            top = top.concat([{ tag: "Other-tags", count: restSum }]);
        }
        // finally append the truly uncategorized "Other" (no tags) if any
        if (otherCount > 0) {
            top = top.concat([{ tag: "Other", count: otherCount }]);
        }
        return top;
    }, [tagCounts, otherCount]);

    // total must be the sum of the right-side counts (so center equals legend)
    const total = useMemo(() => entries.reduce((s, e) => s + e.count, 0), [entries]);

    // svg geometry
    const size = 420;
    const outerR = 180;
    const innerR = 92;

    // Build arcs precisely and force last arc to end at start+360 to avoid seams caused by rounding
    const arcs = useMemo(() => {
        if (total <= 0 || entries.length === 0) return [];
        const arr: Array<{ tag: string; count: number; start: number; end: number; frac: number }> = [];
        let accDeg = 0;
        for (let i = 0; i < entries.length; i++) {
            const e = entries[i];
            const frac = total ? e.count / total : 0;
            const deg = frac * 360;
            const start = -90 + accDeg;
            const end = (i === entries.length - 1) ? (-90 + 359.9999) : (-90 + accDeg + deg);
            arr.push({ tag: e.tag, count: e.count, start, end, frac });
            accDeg += deg;
        }

        return arr;
    }, [entries, total]);

    function makePath(outer: number, inner: number, startDeg: number, endDeg: number) {
        const toRad = (d: number) => (d * Math.PI) / 180;
        const x1 = outer * Math.cos(toRad(startDeg));
        const y1 = outer * Math.sin(toRad(startDeg));
        const x2 = outer * Math.cos(toRad(endDeg));
        const y2 = outer * Math.sin(toRad(endDeg));
        const x3 = inner * Math.cos(toRad(endDeg));
        const y3 = inner * Math.sin(toRad(endDeg));
        const x4 = inner * Math.cos(toRad(startDeg));
        const y4 = inner * Math.sin(toRad(startDeg));
        const diff = endDeg - startDeg;
        const largeArc = Math.abs(diff) > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    }

    const colors = useMemo(() => entries.map((_, i) => {
        const hue = Math.round((i / Math.max(1, entries.length)) * 360);
        return `hsl(${hue} 72% 56%)`;
    }), [entries]);

    if (!propHandle) {
        return (
            <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
                Enter your handle to load tags.
            </div>
        );
    }

    return (
        <div className="desk-panel desk-chart-panel p-4 sm:p-6">
            <div className="flex flex-col items-center mb-6">
                <h3 className="text-2xl font-bold mb-2">
                    Solved by topic
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Top {MAX_TAGS} categories. A problem can contribute to multiple tags.</p>
            </div>

            {loading && <StatePanel tone="loading" title="Updating topic statistics…" compact />}

            {!loading && entries.length > 0 && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Donut Chart - Left side */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center">
                        <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} className="w-full h-auto max-w-[420px]" role="img" aria-label="tags donut">
                            <circle cx={0} cy={0} r={outerR} fill="#f5f7fb" className="dark:fill-slate-800/50" />
                            {arcs.map((a, i) => {
                                const path = makePath(outerR, innerR, a.start, a.end);
                                const fill = colors[i] ?? `hsl(${(i * 40) % 360} 72% 56%)`;
                                return (
                                    <path
                                        key={a.tag}
                                        d={path}
                                        fill={fill}
                                        stroke="none"
                                        onMouseMove={(ev) => setTip({ x: ev.clientX, y: ev.clientY, text: `${a.tag} : ${a.count} (${(a.frac * 100).toFixed(1)}%)` })}
                                        onMouseLeave={() => setTip(null)}
                                    />
                                );
                            })}
                            <circle cx={0} cy={0} r={innerR} fill="var(--card)" />
                            <text x={0} y={-2} textAnchor="middle" fontSize={30} fill="var(--foreground)" fontWeight={800}>{uniqueSolvedCount.toLocaleString()}</text>
                            <text x={0} y={22} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">unique solves</text>
                        </svg>
                    </div>

                    {/* Legend Right */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tags ({entries.length})</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Scroll to view all tags</p>
                        </div>

                        <div className="overflow-y-auto max-h-[420px] pr-2 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                            {entries.map((e, i) => {
                                const fill = colors[i];
                                const pct = total ? (e.count / total * 100).toFixed(1) : "0.0";
                                return (
                                    <div
                                        key={e.tag}
                                        className="desk-tag-legend-row flex items-center gap-3 p-3 border border-[var(--border)]"
                                        onMouseMove={(ev) => setTip({ x: ev.clientX, y: ev.clientY, text: `${e.tag}: ${e.count} (${pct}%)` })}
                                        onMouseLeave={() => setTip(null)}
                                    >
                                        <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ backgroundColor: fill }} />
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{e.tag}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{pct}%</span>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-[var(--card)] px-3 py-1 rounded-md min-w-[50px] text-center">{e.count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {!loading && entries.length === 0 && (
                <div className="text-center py-16 text-gray-600 dark:text-gray-400">No tags data available.</div>
            )}

            {tip && (
                <div style={{ position: "fixed", left: tip.x + 12, top: tip.y + 12, pointerEvents: "none", zIndex: 999 }}>
                    <div className="desk-chart-tooltip px-3 py-2 text-white text-sm font-medium border border-gray-700 dark:border-slate-600 whitespace-nowrap">
                        {tip.text}
                    </div>
                </div>
            )}
        </div>
    );
}
