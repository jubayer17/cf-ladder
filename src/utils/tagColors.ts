// frontend/src/utils/tagColors.ts

const predefinedColors = [
    "#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444",
    "#22c55e", "#f59e0b", "#6366f1", "#14b8a6", "#7c3aed", "#0ea5e9", "#facc15",
];

const tagColorMap: Record<string, string> = {};

// Utility to lighten hex color
function lightenColor(hex: string, percent: number) {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = r > 255 ? 255 : r;
    g = g > 255 ? 255 : g;
    b = b > 255 ? 255 : b;
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Utility to get contrast color (black/white)
export function getContrastColor(hex: string) {
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? "#000000" : "#FFFFFF";
}

// Return both background and text
export function getTagColor(tag: string | null, isDarkMode = false): { bg: string; text: string } {
    if (tag === null) {
        const bg = isDarkMode ? "#9CA3AF" : "#6B7280"; // gray variant
        return { bg, text: getContrastColor(bg) };
    }

    if (!tagColorMap[tag]) {
        const index = Object.keys(tagColorMap).length % predefinedColors.length;
        const baseColor = predefinedColors[index];
        tagColorMap[tag] = isDarkMode ? lightenColor(baseColor, 20) : baseColor;
    }

    const bg = tagColorMap[tag];
    const text = getContrastColor(bg);
    return { bg, text };
}
