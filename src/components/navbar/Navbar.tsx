"use client";

import React from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import ReportBug from "./ReportBug";
import EnterHandle from "./EnterHandle";
import ApplauseCounter from "./ApplauseCounter";

interface NavbarProps {
  handle?: string;
  onHandleSubmit: (handle: string) => Promise<void>; // return Promise so EnterHandle can await
  onHandleClear: () => void;
  userLoading?: boolean; // forward loading state
}

const Navbar: React.FC<NavbarProps> = ({ handle, onHandleSubmit, onHandleClear, userLoading = false }) => {
  return (
    <header className="w-full px-6 sm:px-28 font-mono font-semibold sticky top-0 z-40 bg-[var(--card-bg)] shadow-md p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-code-branch" />
        <span className="font-semibold text-xl">CF Ladder</span>
      </div>

      <div className="flex items-center gap-3">
        {handle ? (
          <div className="flex items-center gap-2 px-3 py-1 border rounded-full bg-gray-100 dark:bg-gray-700">
            <button
              onClick={() => onHandleSubmit(handle)}
              className="font-medium dark:text-white cursor-pointer hover:underline flex items-center gap-2"
              title="Click to re-fetch submissions"
              disabled={userLoading}
            >
              <span>{handle}</span>
              {userLoading && (
                <svg className="w-4 h-4 animate-spin text-gray-600" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <button className="text-red-500 font-bold ml-1" onClick={onHandleClear} title="Remove handle and cached data">
              ✕
            </button>
          </div>
        ) : (
          // forward userLoading to EnterHandle so it can show its spinner
          <EnterHandle onSubmitHandle={onHandleSubmit} onClear={onHandleClear} isLoading={userLoading} />
        )}

        <ThemeToggleButton />
        <ReportBug />
        <ApplauseCounter />
      </div>
    </header>
  );
};

export default Navbar;
