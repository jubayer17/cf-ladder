"use client";

import { useMemo } from "react";
import { Check, SlidersHorizontal } from "lucide-react";

interface TagSelectorProps {
  tags: string[];
  tagCounts: Record<string, number>;
  totalCount: number;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}
const tones = ["lilac", "mint", "blue", "coral"];
function toneFor(tag: string) {
  return tones[Array.from(tag).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % tones.length];
}

export default function TagSelector({ tags, tagCounts, totalCount, selectedTag, onSelectTag }: TagSelectorProps) {
  const orderedTags = useMemo(() => [...new Set(tags)].sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0) || a.localeCompare(b)), [tags, tagCounts]);
  return <section id="practice-topic-filter" className="desk-tag-panel" aria-label="Filter problems by topic">
    <div className="desk-tag-panel-heading"><div><SlidersHorizontal size={14} aria-hidden="true" /><h3>CHOOSE A TOPIC</h3></div><span>{orderedTags.length} TOPICS</span></div>
    <div className="desk-tag-options" role="group" aria-label="Problem topics">
      {[null, ...orderedTags].map(tag => {
        const active = selectedTag === tag;
        const count = tag === null ? totalCount : tagCounts[tag] || 0;
        return <button key={tag ?? "all"} type="button" className="desk-tag-chip" data-tone={tag === null ? "all" : toneFor(tag)} aria-pressed={active} onClick={() => onSelectTag(tag)}>
          <span className="desk-tag-mark" aria-hidden="true">{active && <Check size={11} strokeWidth={3} />}</span>
          <span className="desk-tag-label">{tag ?? "All problems"}</span><span className="desk-tag-count">{count.toLocaleString()}</span>
        </button>;
      })}
    </div>
    <p className="desk-tag-hint">One topic at a time. Counts overlap because problems can have multiple topics.</p>
  </section>;
}
