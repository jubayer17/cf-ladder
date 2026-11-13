"use client";

import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import TopicGrid from '@/components/topics/TopicGrid';

const TopicsPage = () => {
    const { problems, errorProblems, fetchProblems, loadingProblems } = useAppContext();

    const topics = useMemo(() => {
        const topicCounts: Record<string, number> = {};

        problems.forEach(problem => {
            if (problem.tags) {
                problem.tags.forEach(tag => {
                    topicCounts[tag] = (topicCounts[tag] || 0) + 1;
                });
            }
        });

        return Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count);
    }, [problems]);

    if (errorProblems) return <div role="alert" className="mx-auto max-w-lg p-8 text-center"><p>{errorProblems}</p><button className="mt-4 rounded-lg bg-blue-600 text-white px-4 py-2" onClick={() => void fetchProblems()}>Try again</button></div>;

    if (loadingProblems) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8 border-b-2 border-foreground pb-6"><p className="desk-kicker">THE ARCHIVE / BY SUBJECT</p><h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">Find your weak spot.</h1><p className="mt-3 text-sm text-muted-foreground">{topics.length} topics. {problems.length.toLocaleString()} problems. Pick a subject and put in the work.</p></div>

            {/* Grid */}
            <TopicGrid topics={topics} />
        </div>
    );
};

export default TopicsPage;
