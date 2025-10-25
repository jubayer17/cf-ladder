"use client";

import React, { useState, useEffect } from "react";

const USER_HANDLE_KEY = "cf_user_handle_v1";
const USER_INFO_KEY = "cf_user_info_v1";
const USER_SOLVED_KEY = "cf_user_solved_v1";

interface EnterHandleProps {
  onSubmitHandle: (handle: string) => void;
  onClear?: () => void;
}

const EnterHandle: React.FC<EnterHandleProps> = ({ onSubmitHandle, onClear }) => {
  const [handle, setHandle] = useState("");
  const [savedHandle, setSavedHandle] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_HANDLE_KEY);
      if (stored) {
        const id = window.setTimeout(() => setSavedHandle(stored), 0);
        return () => clearTimeout(id);
      }
    } catch {

    }
  }, []);

  const submit = () => {
    const trimmed = handle.trim();
    if (!trimmed) return;
    setSavedHandle(trimmed);
    localStorage.setItem(USER_HANDLE_KEY, trimmed);
    setHandle("");
    try {
      onSubmitHandle(trimmed);
    } catch {

    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  const removeHandle = () => {
    setSavedHandle(null);
    try {
      localStorage.removeItem(USER_HANDLE_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      localStorage.removeItem(USER_SOLVED_KEY);
    } catch {

    }
    if (onClear) {
      try {
        onClear();
      } catch {

      }
    }

    window.location.reload();
  };

  return (
    <div className="flex gap-2 items-center">
      {!savedHandle ? (
        <>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter your handle, e.g. tourist"
            className="px-3 py-2 w-[300px] rounded border focus:outline-none focus:ring focus:ring-blue-500
              dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <button
            onClick={submit}
            className="px-3 py-2  rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded">
          <span
            onClick={() => savedHandle && onSubmitHandle(savedHandle)}
            className="font-medium dark:text-white cursor-pointer hover:underline"
            title="Click to re-fetch submissions"
          >
            {savedHandle}
          </span>
          <button
            onClick={removeHandle}
            className="text-red-500 hover:text-red-700 font-bold"
            title="Remove handle and cached data"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default EnterHandle;
