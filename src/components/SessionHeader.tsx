import { useCollab } from "@/hooks/useCollabContext";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect, useRef, useState } from "react";
import { MdPeople, MdShare } from "react-icons/md";

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
      className={`z-10 fixed top-[72px] flex justify-between items-center py-4 px-6 md:px-10 w-full ${
        isDarkTheme
          ? "bg-gray-900 border-b border-gray-700"
          : "bg-gray-100 border-b border-gray-200"
      } shadow-sm`}
    >
      <div className="flex-1" />
      <h1 className="text-xl font-bold flex-1">{collabName}</h1>

      <div className="flex gap-2 justify-self-end">
        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            isDarkTheme
              ? "bg-blue-800 hover:bg-blue-700"
              : "bg-blue-100 hover:bg-blue-200"
          } transition-colors`}
          title="Copy session ID to clipboard"
        >
          <MdShare size={20} />
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            isDarkTheme
              ? "bg-blue-800 hover:bg-blue-700"
              : "bg-blue-100 hover:bg-blue-200"
          } transition-colors justify-self-end`}
        >
          <MdPeople size={20} />
          <span>Users ({allUsers.length})</span>
        </button>
      </div>
      {showDropdown && (
        <ul
          aria-label="members"
          className={`absolute right-4 top-16 z-10 rounded-md shadow-lg p-2 min-w-48 ${
            isDarkTheme
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          } divide-y divide-gray-300`}
          ref={dropdownRef}
        >
          {allUsers.map((user) => (
            <li
              key={user}
              className={`p-2 ${user === username ? "font-bold" : ""}`}
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
