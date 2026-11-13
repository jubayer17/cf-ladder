"use client";

import { storage } from "@/lib/codeforces";
import React, { useEffect, useState } from "react";
import { FaHandSparkles, FaHands } from "react-icons/fa"; // fixed import ✅

type ApplauseButtonProps = {
    initial?: number; // starting applause count
    storageKey?: string; // localStorage key for persistence
    onChange?: (count: number, applauded: boolean) => void;
    className?: string;
};

export default function ApplauseButton({
    initial = 3378,
    storageKey = "applause_user",
    onChange,
    className = "",
}: ApplauseButtonProps) {
    const [applauded, setApplauded] = useState(false);
    const [count, setCount] = useState(initial);
    const [bump, setBump] = useState(false);

    useEffect(() => {
        const saved = storage.get(storageKey) === 'true';
        // Hydrate the optional browser preference once after server rendering.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setApplauded(saved);
        setCount(initial + (saved ? 1 : 0));
    }, [initial, storageKey]);

    // bump animation
    useEffect(() => {
        if (!bump) return;
        const t = setTimeout(() => setBump(false), 300);
        return () => clearTimeout(t);
    }, [bump]);

    const toggleApplause = () => {
        const next = !applauded;
        const nextCount = next ? count + 1 : Math.max(initial,count - 1);
        setApplauded(next); setCount(nextCount); setBump(true);
        storage.set(storageKey,String(next)); onChange?.(nextCount,next);
    };

    return (
        <button
            onClick={toggleApplause}
            className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all duration-300 font-semibold shadow-md hover:shadow-lg focus:outline-none ${className}`}
            style={{
                background: applauded
                    ? "linear-gradient(135deg, #f59e0b, #f97316)"
                    : "var(--card-bg)",
                color: applauded ? "#fff" : "var(--foreground)",
                transform: bump ? "scale(1.08)" : "scale(1)",
            }}
        >
            {/* Left Icon */}
            <span
                className={`transition-transform duration-300 ${applauded ? "rotate-12" : "hover:scale-110"
                    }`}
            >
                {applauded ? (
                    <FaHands size={20} className="text-white" />
                ) : (
                    <FaHandSparkles size={20} className="text-yellow-500" />
                )}
            </span>

            {/* Count */}
            <span
                className="transition-transform duration-200"
                style={{
                    transform: bump ? "translateY(-2px)" : "none",
                }}
            >
                {count.toLocaleString()}
            </span>

            {/* Sparkle effect */}
            <span
                className={`transition-opacity duration-300 ${applauded ? "opacity-100" : "opacity-0"
                    }`}
            >
                ✨
            </span>
        </button>
    );
}
