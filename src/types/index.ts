export type UserStatus = "solved" | "failed" | "unsolved";

export interface Problem {
    contestId?: number;
    index: string;
    name: string;
    type?: string;
    rating?: number;
    tags: string[];
    solvedCount?: number;
}