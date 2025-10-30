"use client";

import type { NextPage } from "next";
import React from "react";
import Ladder from "../components/Ladder";
import Navbar from "../components/navbar/Navbar";
import PersonalInfo from "../components/PersonalInfo";
import Unsolved from "../components/Unsolved";
import { AppContextProvider, useAppContext } from "../context/AppContext";
import { Problem } from "@/types";
import Footer from "@/components/Footer";

const HomeContent: React.FC = () => {
  const {
    problems,
    tagCounts,
    unsolvedProblems,
    handle,
    userInfo,
    userSolvedSet,
    loadingProblems,
    loadingUser,
    errorProblems,
    setHandleAndFetch,
    clearUser,
  } = useAppContext();

  const totalSolved = userSolvedSet.size;
  const totalUnsolved = problems.length - totalSolved;

  return (
    <div className="min-h-screen font-mono bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navbar
        handle={handle ?? undefined}
        onHandleSubmit={async (h: string) => await setHandleAndFetch(h)}
        onHandleClear={() => clearUser()}
        userLoading={loadingUser}
      />

      {userInfo ? (
        <PersonalInfo
          profileImage={userInfo.titlePhoto}
          handle={userInfo.handle}
          currentRating={userInfo.rating}
          maxRating={userInfo.maxRating}
          isLoading={loadingUser}
        />
      ) : loadingUser ? (
        <div className="container mx-auto p-4">
          <div className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      ) : null}


      <main className="container mx-auto p-4">
        {loadingProblems ? (
          <Ladder problems={[]} userSolvedSet={userSolvedSet} />
        ) : errorProblems ? (
          <div className="text-center py-12 text-sm text-red-500">Error: {errorProblems}</div>
        ) : (
          <>
            <Ladder problems={problems} userSolvedSet={userSolvedSet} />
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Unsolved problems </h2>
              <Unsolved />
            </div>

          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <AppContextProvider>
      <HomeContent />
    </AppContextProvider>
  );
};

export default Home;
