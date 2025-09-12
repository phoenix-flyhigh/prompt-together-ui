import { useCollab } from "@/hooks/useCollabContext";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import { MdPeople, MdShare, MdDone } from "react-icons/md";

const SessionHeader = ({
  collabId,
  allUsers,
}: {
  collabId: string;
  allUsers: string[];
}) => {
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";
  const [showDropdown, setShowDropdown] = useState(false);

  const { collabName, username } = useCollab();

  const dropdownRef = useRef<HTMLUListElement>(null);

  const outsideClickHandler = (e: MouseEvent) => {
    if (!showDropdown) return;

    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", outsideClickHandler);
    return () => {
      document.removeEventListener("click", outsideClickHandler);
    };
  }, []);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleShare = () => {
    navigator.clipboard.writeText(collabId);
    setCopied(true);
  };
  return (
    <section
      className={`z-10 fixed top-[56px] flex flex-row justify-between items-center py-2 px-2 sm:py-4 md:px-8 w-full ${
        isDarkTheme
          ? "bg-gray-900 border-b border-gray-700"
          : "bg-gray-100 border-b border-gray-200"
      } shadow-sm`}
    >
      <div className="md:flex-1 hidden md:block" />
      <h1 className="flex-1 text-base sm:text-xl font-semibold sm:font-bold truncate text-left">
        {collabName}
      </h1>
      <div className="flex gap-1 sm:gap-2 items-center">
        <button
          onClick={handleShare}
          className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-base ${
            isDarkTheme
              ? "bg-blue-800 hover:bg-blue-700"
              : "bg-blue-100 hover:bg-blue-200"
          } transition-colors whitespace-nowrap`}
          title="Copy session ID to clipboard"
        >
          {copied ? (
            <MdDone size={16} className="sm:size-5" />
          ) : (
            <MdShare size={16} className="sm:size-5" />
          )}
          <span className="hidden md:inline">
            {copied ? "Copied!" : "Share"}
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          }}
          className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-base ${
            isDarkTheme
              ? "bg-blue-800 hover:bg-blue-700"
              : "bg-blue-100 hover:bg-blue-200"
          } transition-colors whitespace-nowrap`}
        >
          <MdPeople size={16} className="sm:size-5" />
          <span className="md:hidden">({allUsers.length})</span>
          <span className="hidden md:inline">Users ({allUsers.length})</span>
        </button>
      </div>
      {showDropdown && (
        <ul
          aria-label="members"
          className={`absolute right-2 md:right-8 top-14 sm:top-16 z-10 rounded-md shadow-lg p-2 min-w-40 max-h-40 sm:max-h-64 overflow-y-auto ${
            isDarkTheme
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          } md:divide-y md:divide-gray-300 text-xs sm:text-base`}
          ref={dropdownRef}
        >
          {allUsers.map((user) => (
            <li
              key={user}
              className={`md:p-2 ${user === username ? "font-bold" : ""}`}
            >
              {user === username ? `${user} (You)` : user}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SessionHeader;
