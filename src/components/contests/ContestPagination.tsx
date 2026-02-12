import React from "react";

interface ContestPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ContestPagination({
  page,
  totalPages,
  onPageChange,
}: ContestPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 dark:text-black flex justify-center">
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-60"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages })
            .slice(Math.max(0, page - 4), Math.min(totalPages, page + 3))
            .map((_, i) => {
              const p = i + Math.max(1, page - 3);
              return (
                <button
                  key={p}
                  onClick={() => {
                    onPageChange(p);
                    window.scrollTo({ top: 0 });
                  }}
                  className={`px-2 py-1 rounded ${
                    p === page ? "bg-blue-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
        </div>
        <button
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-60"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
