import React from "react";

interface ContestHeaderProps {
  section: string;
  page: number;
  totalPages: number;
  loadingContests: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onUpdateContests: () => void;
  onClearCache: () => void;
}

export default function ContestHeader({
  section,
  page,
  totalPages,
  loadingContests,
  onPrevPage,
  onNextPage,
  onUpdateContests,
  onClearCache,
}: ContestHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevPage}
          disabled={page === 1}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          title="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.293 15.707a1 1 0 01-1.414 0L5.172 10l5.707-5.707a1 1 0 011.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold">CF Contests — {section}</h2>
        <button
          onClick={onNextPage}
          disabled={page === totalPages}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          title="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 4.293a1 1 0 00-1.414 1.414L11.586 10l-5.293 4.293a1 1 0 001.414 1.414L14.414 10 7.707 4.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-500"
          onClick={onUpdateContests}
          disabled={loadingContests}
          title="Sync latest contests from Codeforces API and save to MongoDB database"
        >
          Update contests
        </button>

        {/* New button: clear client caches and restore contests from DB */}
        <button
          className="px-3 py-1 rounded-md bg-gray-700 text-white text-sm hover:bg-gray-600"
          onClick={onClearCache}
          disabled={loadingContests}
          title="Clear client cache (localStorage, IndexedDB, Cache API) and restore contest list from backend DB"
        >
          Clear cache & restore
        </button>
      </div>
    </div>
  );
}
