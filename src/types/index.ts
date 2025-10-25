export interface Problem {
    contestId: number;
    index: string;
    name: string;
    tags: string[];
    rating?: number;
    solvedCount?: number;
    attemptCount?: number;
}

export type UserStatus = 'unsolved' | 'solved' | 'failed';
