import React, { useState, useEffect } from "react";
import { UserStatus } from "../types";

interface EnterHandleProps {
  onStatusChange: (problemKey: string, status: UserStatus) => void;
}

interface UserInfo {
  name: string;
  rating: number;
  maxRating: number;
  solved: number;
  unsolved: number;
}

const EnterHandle: React.FC<EnterHandleProps> = ({ onStatusChange }) => {
  const [input, setInput] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);


  useEffect(() => {
    const saved = localStorage.getItem("cfUserInfo");
    if (saved) {

      setTimeout(() => setUserInfo(JSON.parse(saved)), 0);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    const parts = input.split(",");
    if (parts.length === 5) {
      const [name, ratingStr, maxRatingStr, solvedStr, unsolvedStr] = parts;
      const newUser: UserInfo = {
        name: name.trim(),
        rating: Number(ratingStr),
        maxRating: Number(maxRatingStr),
        solved: Number(solvedStr),
        unsolved: Number(unsolvedStr),
      };
      setUserInfo(newUser);
      localStorage.setItem("cfUserInfo", JSON.stringify(newUser));
      setInput("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Input field */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="name,rating,maxRating,solved,unsolved"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="px-2 py-1 rounded border w-full"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Enter
        </button>
      </form>

      {/* Display user info */}
      {userInfo && (
        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-3 rounded shadow-md mt-2">
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            Name: {userInfo.name}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Rating: {userInfo.rating}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Max Rating: {userInfo.maxRating}
          </span>
          <span className="flex items-center gap-1 font-medium text-green-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {userInfo.solved}
          </span>
          <span className="flex items-center gap-1 font-medium text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {userInfo.unsolved}
          </span>
        </div>
      )}
    </div>
  );
};

export default EnterHandle;
