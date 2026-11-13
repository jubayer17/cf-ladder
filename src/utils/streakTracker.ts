import { storage, localDate } from "@/lib/codeforces";
// Track daily visit streaks using localStorage
interface StreakData {
    lastVisit: string; // ISO date string
    currentStreak: number;
    longestStreak: number;
}

const STREAK_KEY = 'cf-ladder-visit-streak';

export const updateVisitStreak = (): StreakData => {
    // Check if running in browser
    if (typeof window === 'undefined') {
        return { lastVisit: '', currentStreak: 0, longestStreak: 0 };
    }

    const today = localDate(new Date());

    const stored = storage.get(STREAK_KEY);
    let streakData: StreakData = stored
        ? parseStreak(stored)
        : { lastVisit: '', currentStreak: 0, longestStreak: 0 };

    if (!streakData.lastVisit) {
        streakData = {
            lastVisit: today,
            currentStreak: 1,
            longestStreak: 1
        };
    } else if (streakData.lastVisit === today) {
        return streakData;
    } else {
        const lastDate = new Date(streakData.lastVisit);
        const currentDate = new Date(today);
        const diffTime = currentDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streakData.currentStreak += 1;
            streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
        } else if (diffDays > 1) {
            streakData.currentStreak = 1;
        }

        streakData.lastVisit = today;
    }

    storage.set(STREAK_KEY, JSON.stringify(streakData));
    return streakData;
};

export const getVisitStreak = (): StreakData => {
    // Check if running in browser
    if (typeof window === 'undefined') {
        return { lastVisit: '', currentStreak: 0, longestStreak: 0 };
    }

    const stored = storage.get(STREAK_KEY);
    return stored
        ? parseStreak(stored)
        : { lastVisit: '', currentStreak: 0, longestStreak: 0 };
};

export const resetVisitStreak = (): void => {
    // Check if running in browser
    if (typeof window === 'undefined') {
        return;
    }

    storage.remove(STREAK_KEY);
};

function parseStreak(raw: string): StreakData {
    try {
        const data = JSON.parse(raw);
        if (typeof data.lastVisit === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.lastVisit) && Number.isInteger(data.currentStreak) && data.currentStreak >= 0 && Number.isInteger(data.longestStreak)) return data;
    } catch { /* Corrupt storage should never break navigation. */ }
    return { lastVisit: '', currentStreak: 0, longestStreak: 0 };
}
