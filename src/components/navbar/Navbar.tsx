"use client";
import { Flame } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggleButton from "./ThemeToggleButton";
import ReportBug from "./ReportBug";
import SupportLink from "@/components/SupportLink";
import EnterHandle from "./EnterHandle";
import ApplauseCounter from "./ApplauseCounter";
import { updateVisitStreak } from "@/utils/streakTracker";

interface NavbarProps {
  handle?: string;
  onHandleSubmit: (handle: string) => Promise<void>;
  onHandleClear: () => void;
  userLoading?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  handle,
  onHandleSubmit,
  onHandleClear,
  userLoading = false,
}) => {
  const pathname = usePathname();
  const [visitStreak, setVisitStreak] = useState(0);

  useEffect(() => {
    // Initialize streak
    const streak = updateVisitStreak();
    // Hydrate the visit count from browser storage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisitStreak(streak.currentStreak);
  }, []);

  return (
    <header className="w-full px-4 sm:px-8 sticky top-0 z-50 bg-[var(--background)] border-b-2 border-foreground py-3 flex flex-wrap gap-3 justify-between items-center font-sans">
      <div className="flex w-full lg:w-auto items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-base sm:text-xl tracking-tight whitespace-nowrap shrink-0"><span aria-hidden="true" className="desk-logo">↗</span> CF LADDER</Link>
        <ThemeToggleButton />
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {[["/", "Practice"], ["/contests", "Contests"], ["/topics", "Topics"], ["/stats", "Stats"]].map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className={`desk-nav-link px-1.5 sm:px-3 py-2 text-[11px] sm:text-sm font-medium transition-colors ${pathname === href ? 'desk-nav-active' : 'text-muted-foreground hover:underline'}`}>{label}</Link>)}
        </nav>
      </div>

      <div className="desk-header-tools flex items-center gap-2 w-full lg:w-auto">
        {handle ? (
          <div className="desk-connected flex items-center gap-2 px-3 py-1 border">
            <button
              onClick={() => { void onHandleSubmit(handle); }}
              className="font-medium dark:text-white cursor-pointer hover:underline flex items-center gap-2"
              disabled={userLoading}
            >
              <span className="truncate max-w-28">{handle}</span>
              {userLoading && (
                <svg
                  className="w-4 h-4 animate-spin text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    d="M22 12a10 10 0 00-10-10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-md">
              <Flame size={14} className="text-orange-500" aria-hidden="true" />
              <span className="text-xs font-semibold">{visitStreak}</span>
            </div>
            <button
              aria-label="Disconnect Codeforces handle"
              className="text-red-500 font-bold ml-1"
              onClick={onHandleClear}
            >
              ✕
            </button>
          </div>
        ) : (
          <EnterHandle
            onSubmitHandle={onHandleSubmit}
            onClear={onHandleClear}
            isLoading={userLoading}
          />
        )}

        <ReportBug />
        <SupportLink />
        <ApplauseCounter />
      </div>
    </header >
  );
};

export default Navbar;
