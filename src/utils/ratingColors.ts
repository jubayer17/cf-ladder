export type RatingItem = {
    name: string;
    color: string;
    range: [number, number | null];
};

export const RATING_COLORS: RatingItem[] = [
    { name: "Newbie", color: "#808080", range: [0, 1199] },
    { name: "Pupil", color: "#00C853", range: [1200, 1399] },
    { name: "Specialist", color: "#00B0FF", range: [1400, 1599] },
    { name: "Expert", color: "#0077FF", range: [1600, 1899] },
    { name: "Candidate Master", color: "#7C4DFF", range: [1900, 2199] },
    { name: "Master", color: "#FF8C00", range: [2200, 2299] },
    { name: "International Master", color: "#FF8C00", range: [2300, 2599] },
    { name: "Grandmaster", color: "#FF3B30", range: [2600, 2899] },
    { name: "Legendary Grandmaster", color: "#FF3B30", range: [2900, null] }
];

export function getColorForRating(rating?: number | null): string {
    if (typeof rating !== "number" || Number.isNaN(rating)) return "#808080";
    for (const r of RATING_COLORS) {
        const lo = r.range[0];
        const hi = r.range[1];
        if (hi === null) {
            if (rating >= lo) return r.color;
        } else {
            if (rating >= lo && rating <= hi) return r.color;
        }
    }
    return "#808080";
}

export function getRatingName(rating?: number | null): string {
    if (typeof rating !== "number" || Number.isNaN(rating)) return "Unrated";
    for (const r of RATING_COLORS) {
        const lo = r.range[0];
        const hi = r.range[1];
        if (hi === null) {
            if (rating >= lo) return r.name;
        } else {
            if (rating >= lo && rating <= hi) return r.name;
        }
    }
    return "Unrated";
}

export function getHandleParts(handle: string, rating?: number | null) {
    const isLgm = typeof rating === "number" && rating >= 2900;
    if (!isLgm) return [{ text: handle, color: getColorForRating(rating) }];
    const first = handle.charAt(0) || "";
    const rest = handle.slice(1) || "";
    return [
        { text: first, color: "var(--lgm-first)" },
        { text: rest, color: "#FF3B30" }
    ];
}
