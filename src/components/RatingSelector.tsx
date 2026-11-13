import React from "react";

interface RatingSelectorProps {
  selectedRating: number;
  onSelect: (rating: number) => void;
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  selectedRating,
  onSelect,
}) => {
  const ratings = Array.from({ length: 28 }, (_, i) => 800 + i * 100);

  return (
    <div className="desk-ratings flex flex-wrap gap-2">
      {ratings.map((r) => {
        const isSelected = selectedRating === r;

        return (
          <button
            key={r}
            aria-pressed={isSelected}
            onClick={() => onSelect(r)}
            data-band={r < 1200 ? "base" : r < 1600 ? "green" : r < 2000 ? "blue" : r < 2400 ? "purple" : "coral"}
            className="desk-rating px-3 py-2 font-mono text-xs font-semibold"
          >
            {r}
          </button>
        );
      })}
    </div>
  );
};

export default RatingSelector;
