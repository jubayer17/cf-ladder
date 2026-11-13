import React from "react";

interface MissingProblemsWarningProps {
  count: number;
  loading: boolean;
}

export default function MissingProblemsWarning({
  count,
  loading,
}: MissingProblemsWarningProps) {
  if (count <= 0 || loading) return null;

  return (
    <div className="mt-4 text-xs text-yellow-700">
      Note: {count} contest(s) missing problems in cache for this section. Use
      per-row refresh or &quot;Start loading (network)&quot; to populate them.
    </div>
  );
}
