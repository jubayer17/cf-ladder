// utils/cfContests.ts
export type ContestMap = Record<number, string>;

const CF_CONTEST_LIST = "https://codeforces.com/api/contest.list";
const LOCAL_KEY = "cf_contest_list_cache_v1";
const TTL = 1000 * 60 * 60 * 24; // 24h

async function fetchContestListFromAPI(): Promise<ContestMap> {
    const res = await fetch(CF_CONTEST_LIST);
    if (!res.ok) throw new Error("Failed to fetch contest list");
    const data = await res.json();
    if (data.status !== "OK" || !Array.isArray(data.result)) {
        throw new Error("Unexpected contest.list response");
    }
    const map: ContestMap = {};
    for (const c of data.result) {
        // contest object has id and name fields (see API docs)
        if (typeof c.id === "number" && typeof c.name === "string") {
            map[c.id] = c.name;
        }
    }
    return map;
}

export async function loadContestMap(forceRefresh = false): Promise<ContestMap> {
    try {
        if (!forceRefresh) {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as { ts: number; map: ContestMap };
                if (Date.now() - parsed.ts < TTL) return parsed.map;
            }
        }
    } catch {
        // ignore parse errors
    }

    const map = await fetchContestListFromAPI();
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ ts: Date.now(), map }));
    } catch {
        // ignore
    }
    return map;
}

/** parse human-friendly division/label from contest name.
 * examples it matches:
 *  - "Codeforces Round #1234 (Div. 2)"
 *  - "Codeforces Round #1234 (Div. 1 + Div. 2)"
 *  - "Codeforces Round #1234 (Div. 3)"
 *  - "Educational Codeforces Round 10 (Rated for Div. 2)"
 *  - "Global Round 16"
 */
export function parseDivisionFromContestName(name?: string | null): string | null {
    if (!name) return null;
    // common patterns for Div:
    const divRegex = /\bDiv(?:ision|\.?)\s*\.?\s*(\d+)(?:\s*\+\s*(\d+))?/i;
    const divAlt = /\b(Div(?:\.)?\s*\d+(?:\+\d+)?)\b/i; // keep literal "Div.1+2"
    const educational = /\bEducational\b/i;
    const global = /\bGlobal Round\b/i;
    const gym = /\bGym\b/i;

    const m = name.match(divRegex);
    if (m) {
        if (m[2]) return `Div.${m[1]}+${m[2]}`; // e.g. Div.1+2
        return `Div.${m[1]}`;
    }
    const m2 = name.match(divAlt);
    if (m2) return m2[1];
    if (educational.test(name)) return "Educational";
    if (global.test(name)) return "Global";
    if (gym.test(name)) return "Gym";
    // fallback: attempt to extract something like "Div" or "Round" token
    return null;
}

/** Convenience: get division label for given contestId using cached contest map */
export async function getContestDivision(contestId: number | null | undefined): Promise<string | null> {
    if (!contestId && contestId !== 0) return null;
    try {
        const map = await loadContestMap();
        const name = map[contestId];
        if (!name) return null;
        return parseDivisionFromContestName(name);
    } catch {
        // fallback null on error
        return null;
    }
}
