"use client";

import React, { useMemo } from "react";
import { getTagColor } from "../utils/tagColors";

interface TagSelectorProps {
  tags: string[]; // expected to be sorted by count desc, then alphabetically
  tagCounts?: Record<string, number>;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  isDarkMode?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  tagCounts = {},
  selectedTag,
  onSelectTag,
  isDarkMode = false,
}) => {
  // defensive: if tags passed unsorted, sort by counts desc then alpha
  const orderedTags = useMemo(() => {
    const copy = [...tags];
    copy.sort((a, b) => {
      const diff = (tagCounts[b] || 0) - (tagCounts[a] || 0);
      return diff !== 0 ? diff : a.localeCompare(b);
    });
    return copy;
  }, [tags, tagCounts]);

  const allTags = [null, ...orderedTags];

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {allTags.map((tag, idx) => {
        const label = tag === null ? "All" : tag;
        const { bg, text } = getTagColor(tag, isDarkMode);

        const count = tag ? tagCounts[tag] ?? 0 : Object.values(tagCounts).reduce((a, b) => a + b, 0);

        return (
          <button
            key={`${label}-${idx}`}
            onClick={() => onSelectTag(tag)}
            style={{
              backgroundColor: bg,
              color: text,
              opacity: selectedTag === tag ? 1 : 0.95,
            }}
            className={`px-4 py-2 mx-1 my-1 rounded-lg font-medium transition-colors duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${selectedTag === tag ? "border-2 border-blue-700" : ""
              }`}
          >
            <span className="mr-2">{label}</span>
            <span className="text-sm opacity-80">({count})</span>
          </button>
        );
      })}
    </div>
  );
};

export default TagSelector;
