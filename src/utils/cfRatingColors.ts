

export const cfRatingColors: Record<number, string> = {};

// Gray (Newbie)
for (let r = 800; r < 1200; r += 100) cfRatingColors[r] = "#808080";

// Green (Pupil)
for (let r = 1200; r < 1400; r += 100) cfRatingColors[r] = "#4CAF50";

// Cyan (Specialist)
for (let r = 1400; r < 1600; r += 100) cfRatingColors[r] = "#00BCD4";

// Blue (Expert)
for (let r = 1600; r < 1900; r += 100) cfRatingColors[r] = "#2196F3";

// Purple (Candidate Master)
for (let r = 1900; r < 2100; r += 100) cfRatingColors[r] = "#9C27B0";

// Orange (Master / International Master)
for (let r = 2100; r < 2400; r += 100) cfRatingColors[r] = "#FF5722";

// Red gradient (Grandmaster → International Grandmaster → Legendary Grandmaster)
for (let r = 2400; r <= 3500; r += 100) {
    const startRed = 139; // #8b0000
    const endRed = 255;   // #ff0000
    const redIntensity = startRed + Math.floor(((r - 2400) / 1100) * (endRed - startRed));
    cfRatingColors[r] = `rgb(${redIntensity}, 0, 0)`; // smooth gradient from deep red to bright red
}
