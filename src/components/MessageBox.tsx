import { useEffect, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { useTheme } from "@/hooks/useTheme";
import { TMessage } from "@/pages/session/[id]";

export const MessageBox = (props: TMessage) => {
  const { message, byUser } = props;
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copied]);

  return (
    <div
      className={`flex flex-col gap-2 w-full ${
        byUser ? "items-end" : "items-start"
      }`}
    >
      {byUser && (
        <p
          className={`text-sm font-semibold ${
            isDarkTheme ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {props.username}
        </p>
      )}
      <div
        className={`rounded-lg p-4 max-w-3xl ${
          byUser
            ? isDarkTheme
              ? "bg-blue-900 bg-opacity-30 border border-blue-800"
              : "bg-blue-100 border border-blue-200"
            : isDarkTheme
            ? "bg-indigo-900 bg-opacity-20 border border-indigo-700"
            : "bg-indigo-100 border border-indigo-200 shadow-sm"
        }`}
      >
        {!byUser && (
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-medium ${
                isDarkTheme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              AI
            </span>
            <button
              className={`p-1 rounded-md hover:bg-opacity-10 ${
                isDarkTheme ? "hover:bg-gray-600" : "hover:bg-gray-200"
              } transition-colors`}
              onClick={() => {
                navigator.clipboard.writeText(message);
                setCopied(true);
              }}
              aria-label="Copy message"
              title="Copy to clipboard"
            >
              {copied ? (
                <span
                  className={`text-xs font-medium ${
                    isDarkTheme ? "text-green-400" : "text-green-600"
                  }`}
                >
                  Copied!
                </span>
              ) : (
                <MdContentCopy
                  className={isDarkTheme ? "text-gray-400" : "text-gray-500"}
                />
              )}
            </button>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{message}</div>
      </div>
    </div>
  );
};
