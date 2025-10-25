"use client";

import React, { useEffect, useState } from "react";

type Props = {
    initial?: number;
    className?: string;
    pollInterval?: number | 0;
};

export default function ApplauseCounter({
    initial,
    className = "",
    pollInterval = 7000,
}: Props) {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch("/api/applause");
                if (!res.ok) throw new Error("Failed to fetch count");
                const data = await res.json();
                if (mounted && typeof data.count === "number") setCount(data.count);
            } catch (err: any) {
                if (mounted) setError("Could not load count");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false };
    }, []);

    useEffect(() => {
        if (!pollInterval || pollInterval <= 0) return;
        const id = setInterval(async () => {
            try {
                const res = await fetch("/api/applause");
                if (!res.ok) return;
                const data = await res.json();
                if (typeof data.count === "number") setCount(data.count);
            } catch { }
        }, pollInterval);
        return () => clearInterval(id);
    }, [pollInterval]);

    const handleClick = async () => {
        if (pending) return;
        setPending(true);
        setError(null);
        setCount((c) => (typeof c === "number" ? c + 1 : (initial ?? 0) + 1));

        try {
            const res = await fetch("/api/applause", { method: "POST" });
            if (!res.ok) throw new Error("Increment failed");
            const data = await res.json();
            if (typeof data.count === "number") setCount(data.count);
        } catch (err: any) {
            setCount((c) => (typeof c === "number" ? Math.max(0, c - 1) : null));
            setError(err?.message ?? "Failed to clap");
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="inline-flex items-center gap-3">
            <button
                onClick={handleClick}
                disabled={pending}
                className={`flex items-center gap-2 px-5 py-1 rounded-md font-semibold shadow-md transition-all duration-150 transform active:scale-95 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 ${className}`}
                style={{
                    background: "linear-gradient(135deg,#14b8a6,#06b6d4)",
                    color: "#fff",
                    border: "1px solid rgba(20,184,166,0.7)",
                }}
                aria-busy={pending || loading}
                aria-label="Applause / Clap"
                title={error ? error : "Give a clap"}
            >
                <i className="fa-solid fa-hands-clapping text-xl"></i>
                <span className="text-lg font-bold">
                    {loading
                        ? "…"
                        : typeof count === "number"
                            ? count.toLocaleString()
                            : initial !== undefined
                                ? initial.toLocaleString()
                                : "—"}
                </span>
            </button>

            {error && (
                <div style={{ color: "#ef4444", fontSize: 12 }} role="status" aria-live="polite">
                    {error}
                </div>
            )}
        </div>
    );
}
