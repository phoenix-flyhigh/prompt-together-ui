// components/Layout.tsx
import React, { ReactNode } from "react";
import Link from "next/link";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "@/hooks/useTheme";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  const isDarkTheme = theme === "dark";

  return (
    <div
      className={`min-h-screen ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } transition-colors duration-200 flex flex-col`}
    >
      <header
        className={`sticky top-0 z-10 ${
          isDarkTheme ? "bg-gray-800" : "bg-white border-b border-gray-200"
        } py-4 px-6 md:px-10`}
      >
        <div className="mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <h1
              className={`text-xl md:text-2xl font-bold ${
                isDarkTheme ? "text-white" : "text-gray-900"
              }`}
            >
              Prompt Together
            </h1>
          </Link>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDarkTheme
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
            aria-label={`Switch to ${isDarkTheme ? "light" : "dark"} mode`}
          >
            {isDarkTheme ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
          </button>
        </div>
      </header>

      <main className="flex flex-grow h-full">{children}</main>
    </div>
  );
}
