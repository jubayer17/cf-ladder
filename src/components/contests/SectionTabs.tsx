import React from "react";

interface SectionTabsProps {
  sections: string[];
  currentSection: string;
  onSelectSection: (section: string) => void;
}

export default function SectionTabs({
  sections,
  currentSection,
  onSelectSection,
}: SectionTabsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {sections.map((c) => {
        const active = currentSection === c;
        return (
          <button
            key={c}
            onClick={() => onSelectSection(c)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-shadow ${
              active
                ? "bg-blue-600 text-white shadow"
                : "bg-white border text-gray-700 hover:shadow-sm"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
