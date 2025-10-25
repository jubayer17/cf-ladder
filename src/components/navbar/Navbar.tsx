"use client";

import React from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import ReportBug from "./ReportBug";
import EnterHandle from "./EnterHandle";

import ApplauseCounter from "./ApplauseCounter";

interface NavbarProps {
  handle?: string;
  onHandleSubmit: (handle: string) => void;
  onHandleClear: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  handle,
  onHandleSubmit,
  onHandleClear,
}) => {
  return (
    <header className="w-full px-28  font-mono font-semibold sticky top-0 z-40 bg-[var(--card-bg)] shadow-md p-3 flex justify-between items-center">

      <div className="flex items-center gap-3">
        <i className="fa-solid fa-code-branch"></i>
        <span className="font-semibold text-xl">CF Ladder</span>
      </div>

      <div className="flex items-center gap-3">
        {handle ? (
          <div className="flex items-center gap-2 px-3 py-1 border rounded-full bg-gray-100 dark:bg-gray-700">
            <span>{handle}</span>
            <button className="text-red-500 font-bold" onClick={onHandleClear}>
              ✕
            </button>
          </div>
        ) : (
          <EnterHandle onSubmitHandle={onHandleSubmit} />
        )}

        <ThemeToggleButton />
        <ReportBug />
        <ApplauseCounter className="" />
      </div>
    </header>
  );
};

export default Navbar;
