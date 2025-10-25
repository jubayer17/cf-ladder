import React from "react";
import { cfRatingColors } from "../utils/cfRatingColors";

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
    <div className="flex flex-wrap gap-2 p-2">
      {ratings.map((r) => {
        const isSelected = selectedRating === r;
        const bgColor = isSelected
          ? cfRatingColors[r] || "#000"
          : "var(--card-bg)";
        const textColor = isSelected ? "#fff" : "var(--foreground)";

        return (
          <button
            key={r}
            onClick={() => onSelect(r)}
            style={{ backgroundColor: bgColor, color: textColor }}
            className="
              px-4 py-2 rounded-md font-medium border border-gray-300
              transition-colors duration-200 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            {r}
          </button>
        );
      })}
    </div>
  );
};

export default RatingSelector;
