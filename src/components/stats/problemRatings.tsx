"use client";
import StatePanel from "@/components/StatePanel";
import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext, makeKey } from '@/context/AppContext';
import { cfRequest } from '@/lib/codeforces';
function nice(n: number) { return n.toLocaleString(); }
function colorForRating(r: number) {
    if (r < 1200) return "#9CA3AF";
    if (r < 1400) return "#16A34A";
    if (r < 1600) return "#06B6D4";
    if (r < 1900) return "#3B82F6";
    if (r < 2100) return "#8B5CF6";
    if (r < 2300) return "#F97316";
    if (r < 2400) return "#EF4444";
    return "#9F1239";
}


interface RatingChange { contestId: number; contestName: string; rank: number; oldRating: number; newRating: number }
export default function ProblemRatings({ handle }: { handle: string | null }) {
    const { submissions, problems, loadingUser } = useAppContext();
    const loading = loadingUser && !submissions.length;
    const [ratingReload,setRatingReload] = useState(0);
    const [ratings, setRatings] = useState<RatingChange[]>([]);
    const [ratingError, setRatingError] = useState(false);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; rating: number; count: number } | null>(null);
    useEffect(() => {
        let cancelled = false;
        if (handle) cfRequest<RatingChange[]>('user.rating', { handle }).then(data => { if (!cancelled) { setRatings(data); setRatingError(false); } }).catch(() => { if (!cancelled) setRatingError(true); });
        return () => { cancelled = true; };
    }, [handle, ratingReload]);
    const { ratingCounts, maxSolvedRating, totalSolved, totalTried, avgAttempts, maxAttempts, solvedWithOne, solvedWithOnePct, maxACs, validatedSolved, unvalidatedSolved, firstSolvedAt, lastSolvedAt } = useMemo(() => {
        const problemMap = new Map(problems.map(p => [makeKey(p.contestId,p.index),p]));
        const records = new Map<string, { attempts: number; untilAC: number | null; acs: number; rating?: number }>();
        let firstSolvedAt: number | null = null, lastSolvedAt: number | null = null;
        for (const s of [...submissions].reverse()) {
            const key = makeKey(s.problem.contestId ?? s.contestId,s.problem.index);
            const rec = records.get(key) || { attempts: 0, untilAC: null, acs: 0, rating: problemMap.get(key)?.rating ?? s.problem.rating };
            rec.attempts++;
            if (s.verdict === 'OK') {
                rec.acs++;
                if (rec.untilAC === null) {
                    rec.untilAC = rec.attempts;
                    const ts = s.creationTimeSeconds * 1000;
                    firstSolvedAt = Math.min(firstSolvedAt ?? ts,ts); lastSolvedAt = Math.max(lastSolvedAt ?? ts,ts);
                }
            }
            records.set(key,rec);
        }
        const ratingCounts: Record<number, number> = {};
        let totalSolved = 0, sum = 0, solvedWithOne = 0, validatedSolved = 0;
        let maxAttempts: { attempts: number } | null = null, maxACs: { acs: number } | null = null;
        for (const [key,rec] of records) {
            if (rec.untilAC === null) continue;
            totalSolved++; sum += rec.untilAC;
            if (rec.untilAC === 1) solvedWithOne++;
            if (problemMap.has(key)) validatedSolved++;
            if (!maxAttempts || rec.untilAC > maxAttempts.attempts) maxAttempts = { attempts: rec.untilAC };
            if (!maxACs || rec.acs > maxACs.acs) maxACs = { acs: rec.acs };
            if (rec.rating) ratingCounts[rec.rating] = (ratingCounts[rec.rating] || 0) + 1;
        }
        return { ratingCounts, maxSolvedRating: Math.max(800,...Object.keys(ratingCounts).map(Number)), totalSolved, totalTried: records.size, avgAttempts: totalSolved ? Math.round(sum / totalSolved * 100) / 100 : 0, maxAttempts, solvedWithOne, solvedWithOnePct: totalSolved ? Math.round(solvedWithOne / totalSolved * 100) : 0, maxACs, validatedSolved, unvalidatedSolved: totalSolved - validatedSolved, firstSolvedAt, lastSolvedAt };
    }, [submissions, problems]);
    const contestCount = ratings.length;
    const ranked = [...ratings].sort((a,b) => a.rank - b.rank);
    const bestRank = ranked[0], worstRank = ranked.at(-1);
    const changes = ratings.map(r => ({ diff: r.newRating - r.oldRating })).sort((a,b) => b.diff - a.diff);
    const maxUp = changes[0], maxDown = changes.at(-1);
    /* RESPONSIVE sizing: read container width and adapt bar width so entire bucket set fits */
    const [parentWidth, setParentWidth] = useState<number | null>(1200);
    useEffect(() => {
        const setW = () => setParentWidth(Math.max(760, Math.min(window.innerWidth - 120, 1400)));
        setW();
        window.addEventListener("resize", setW);
        return () => window.removeEventListener("resize", setW);
    }, []);

    const visibleBuckets = useMemo(() => {
        const maxB = typeof maxSolvedRating === "number" && maxSolvedRating >= 800 ? maxSolvedRating : 1200;
        const arr: number[] = [];
        for (let r = 800; r <= Math.max(maxB, 1200); r += 100) arr.push(r);
        return arr;
    }, [maxSolvedRating]);

    const leftPad = 60;
    const rightPad = 60;
    const gutter = 6;
    // compute perBucket to fit into parentWidth (but keep a minimum bar width)
    const computed = useMemo(() => {
        const n = visibleBuckets.length || 1;
        const maxCanvas = parentWidth ?? 1200;
        const available = Math.max(600, maxCanvas - leftPad - rightPad);
        const perBucket = Math.max(10, Math.floor((available - (n - 1) * gutter) / n));
        const chartBaseWidth = leftPad + rightPad + perBucket * n + gutter * (n - 1);
        const rotateLabels = n > 20; // rotate if too many buckets
        return { perBucket, chartBaseWidth, rotateLabels, n, available };
    }, [visibleBuckets, parentWidth]);

    const barWidth = computed.perBucket;
    const chartBaseWidth = computed.chartBaseWidth;
    const chartHeight = 400;

    const entries = useMemo(() => visibleBuckets.map((b) => ({ rating: b, count: ratingCounts[b] || 0 })), [visibleBuckets, ratingCounts]);
    const maxCountVisible = useMemo(() => Math.max(1, ...entries.map((e) => e.count)), [entries]);

    const fmtDate = (ts: number | null) => (ts ? new Date(ts).toLocaleString() : "—");

    return (
        <div className="desk-panel desk-chart-panel p-4 sm:p-6">
            <div className="flex flex-col items-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                    Solved by rating
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Codeforces problem-solving journey</p>
            </div>

            {ratingError && <StatePanel tone="error" title="Contest rating history is unavailable" description="Your solve statistics are still available. Retry to load rated contest metrics." action={<button className="desk-secondary" onClick={() => setRatingReload(value => value+1)}>Retry rating history</button>} compact />}
            {loading && <StatePanel tone="loading" title="Updating solve statistics…" compact />}

            {!loading && (
                <>
                    <div className="flex justify-center mb-6">
                        <div className="desk-chart-scroll" role="region" aria-label="Solved problem ratings chart; scroll horizontally" tabIndex={0}>
                            <div className="min-w-max">
                                <svg width={chartBaseWidth} height={chartHeight} role="img" aria-label="Count of accepted problems at each difficulty">
                                    <defs>
                                        <linearGradient id="chartBgLight" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#f8fafc" />
                                            <stop offset="100%" stopColor="#ffffff" />
                                        </linearGradient>
                                        <linearGradient id="chartBgDark" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#1e293b" />
                                            <stop offset="100%" stopColor="#0f172a" />
                                        </linearGradient>
                                        <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
                                        </filter>
                                    </defs>

                                    {/* Background rect - light mode */}
                                    <rect x={0} y={0} width={chartBaseWidth} height={chartHeight} rx={12} fill="url(#chartBgLight)" stroke="#cbd5e1" strokeWidth={1} className="dark:hidden" />
                                    {/* Background rect - dark mode */}
                                    <rect x={0} y={0} width={chartBaseWidth} height={chartHeight} rx={12} fill="url(#chartBgDark)" stroke="#334155" strokeWidth={1} className="hidden dark:block" />

                                    {/* Y grid lines */}
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const barMaxH = chartHeight - 110;
                                        const y = (chartHeight - 55) - (i * barMaxH / 4);
                                        const label = Math.round((i / 4) * maxCountVisible);
                                        return (
                                            <g key={i}>
                                                {/* Grid line - light mode */}
                                                <line x1={leftPad} y1={y} x2={chartBaseWidth - rightPad} y2={y} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="5,5" className="dark:hidden" />
                                                {/* Grid line - dark mode */}
                                                <line x1={leftPad} y1={y} x2={chartBaseWidth - rightPad} y2={y} stroke="#475569" strokeWidth={1} strokeDasharray="5,5" className="hidden dark:block" />
                                                {/* Label - light mode */}
                                                <text x={leftPad - 12} y={y + 4} fontSize={13} fill="#1e293b" textAnchor="end" fontWeight="600" className="dark:hidden">{label}</text>
                                                {/* Label - dark mode */}
                                                <text x={leftPad - 12} y={y + 4} fontSize={13} fill="#e2e8f0" textAnchor="end" fontWeight="600" className="hidden dark:block">{label}</text>
                                            </g>
                                        );
                                    })}

                                    {/* Bars */}
                                    {entries.map((e, i) => {
                                        const x = leftPad + i * (barWidth + gutter);
                                        const barMaxH = chartHeight - 110;
                                        const h = Math.round((e.count / maxCountVisible) * barMaxH);
                                        const y = chartHeight - 55 - h;
                                        const color = colorForRating(e.rating);
                                        const opacity = e.count > 0 ? 1 : 0.3;

                                        return (
                                            <g key={e.rating} transform={`translate(${x},0)`}>
                                                {/* Baseline - light mode */}
                                                <rect x={0} y={chartHeight - 55} width={barWidth} height={2} rx={1} fill="#94a3b8" className="dark:hidden" />
                                                {/* Baseline - dark mode */}
                                                <rect x={0} y={chartHeight - 55} width={barWidth} height={2} rx={1} fill="#475569" className="hidden dark:block" />
                                                <rect
                                                    x={0}
                                                    y={y}
                                                    width={barWidth}
                                                    height={h}
                                                    rx={4}
                                                    fill={color}
                                                    opacity={opacity}
                                                    filter={e.count > 0 ? "url(#barShadow)" : undefined}
                                                    style={{
                                                        transition: "all 0.3s ease",
                                                        transformOrigin: "bottom",
                                                        cursor: e.count > 0 ? "pointer" : "default",
                                                    }}
                                                    className="hover:opacity-90"
                                                    onMouseMove={(ev) => {
                                                        if (e.count > 0) {
                                                            setTooltip({ x: ev.clientX, y: ev.clientY, rating: e.rating, count: e.count });
                                                        }
                                                    }}
                                                    onMouseLeave={() => setTooltip(null)}
                                                />
                                                {/* Rating label - light mode */}
                                                <text x={barWidth / 2} y={chartHeight - 28} textAnchor="middle" fontSize={computed.rotateLabels ? 11 : 12} fill="#0f172a" fontWeight="700" className="dark:hidden"
                                                    transform={computed.rotateLabels ? `rotate(-45 ${barWidth / 2} ${chartHeight - 28})` : undefined}
                                                >
                                                    {e.rating}
                                                </text>
                                                {/* Rating label - dark mode */}
                                                <text x={barWidth / 2} y={chartHeight - 28} textAnchor="middle" fontSize={computed.rotateLabels ? 11 : 12} fill="#f1f5f9" fontWeight="700" className="hidden dark:block"
                                                    transform={computed.rotateLabels ? `rotate(-45 ${barWidth / 2} ${chartHeight - 28})` : undefined}
                                                >
                                                    {e.rating}
                                                </text>
                                                {e.count > 0 && (
                                                    <>
                                                        {/* Count label - light mode */}
                                                        <text x={barWidth / 2} y={y - 10} textAnchor="middle" fontSize={13} fill="#0f172a" fontWeight="700" className="dark:hidden">{e.count}</text>
                                                        {/* Count label - dark mode */}
                                                        <text x={barWidth / 2} y={y - 10} textAnchor="middle" fontSize={13} fill="#ffffff" fontWeight="700" className="hidden dark:block">{e.count}</text>
                                                    </>
                                                )}
                                            </g>
                                        );
                                    })}

                                    {/* axis labels - light mode */}
                                    <text x={leftPad} y={chartHeight - 8} fontSize={14} fill="#0f172a" fontWeight="700" className="dark:hidden">Rating →</text>
                                    <text x={16} y={36} fontSize={14} fill="#0f172a" fontWeight="700" className="dark:hidden">Count ↑</text>
                                    {/* axis labels - dark mode */}
                                    <text x={leftPad} y={chartHeight - 8} fontSize={14} fill="#f1f5f9" fontWeight="700" className="hidden dark:block">Rating →</text>
                                    <text x={16} y={36} fontSize={14} fill="#f1f5f9" fontWeight="700" className="hidden dark:block">Count ↑</text>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Two stat cards side-by-side (responsive) */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-sm border border-gray-200 dark:border-slate-700 p-6 bg-[var(--background)] ">
                            <h4 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-300 flex items-center gap-2">

                                Solve Metrics
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tried</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{nice(totalTried)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solved</span>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{nice(totalSolved)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Validated / Others</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{nice(validatedSolved)} / {nice(unvalidatedSolved)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average attempts</span>
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{avgAttempts}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max attempts</span>
                                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{maxAttempts?.attempts ?? "—"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">One-shot solves</span>
                                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{nice(solvedWithOne)} ({solvedWithOnePct}%)</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max AC(s) on problem</span>
                                    <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{maxACs?.acs ?? "—"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-sm border border-gray-200 dark:border-slate-700 p-6 bg-[var(--background)] ">
                            <h4 className="text-xl font-bold mb-4 text-purple-900 dark:text-purple-300 flex items-center gap-2">

                                Contest Metrics
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contests</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{ratingError ? '—' : contestCount}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Best rank</span>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{bestRank?.rank ?? "—"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Worst rank</span>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{worstRank?.rank ?? "—"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max up</span>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{maxUp ? `${maxUp.diff > 0 ? "+" : ""}${maxUp.diff}` : "—"}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max down</span>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{maxDown?.diff ?? "—"}</span>
                                </div>
                                <div className="flex flex-col gap-1 p-3 bg-[var(--card)] rounded-lg ">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Period</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">First: {fmtDate(firstSolvedAt)}</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Latest: {fmtDate(lastSolvedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Tooltip */}
            {tooltip && (
                <div
                    style={{
                        position: "fixed",
                        left: tooltip.x + 12,
                        top: tooltip.y + 12,
                        pointerEvents: "none",
                        zIndex: 999
                    }}
                >
                    <div className="desk-chart-tooltip px-4 py-2 text-white text-sm font-medium border border-gray-700 dark:border-slate-600 whitespace-nowrap">
                        <div className="font-bold text-base">Rating: {tooltip.rating}</div>
                        <div className="text-gray-300 dark:text-gray-300">Problems Solved: {tooltip.count}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
