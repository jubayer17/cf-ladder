"use client";
import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeToggleButton: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      // fallback to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return; // prevent SSR crash
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  if (!mounted) return null; // prevent mismatch on SSR

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center justify-center w-8 h-8 rounded-full 
        border border-gray-400 dark:border-gray-600 
        bg-white 
        text-yellow-500 dark:text-blue-400 
        shadow-md hover:scale-110 hover:shadow-lg 
        transition-all duration-300 ease-in-out
      `}
    >
      {theme === "light" ? (
        <FaMoon size={16} className="text-gray-700 dark:text-blue-300" />
      ) : (
        <FaSun size={16} className="text-yellow-500" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
