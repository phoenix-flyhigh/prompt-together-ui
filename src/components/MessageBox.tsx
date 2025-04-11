import { useEffect, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { useTheme } from "@/hooks/useTheme";
import { TMessage } from "@/pages/session/[id]";
import Markdown from "react-markdown";

export const MessageBox = (props: TMessage) => {
  const { message, byUser } = props;
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    if (byUser) return;

    let index = 0;
    const interval = setInterval(() => {
      setVisibleText((prev) => prev + message.slice(index, index + 5));
      index += 5;
      if (index >= message.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [message, byUser]);

  return (
    <div
      className={`flex flex-col gap-2 w-full ${
        byUser ? "items-end" : "items-start"
      } transition-all duration-200 ease-out transform opacity-0 scale-95 animate-fade-in`}
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
        <div className="break-words">
          <Markdown
            components={{
              h1: ({ ...props }) => (
                <h1 className="text-xl font-bold mb-2" {...props} />
              ),
              h2: ({ ...props }) => (
                <h2 className="text-lg font-bold mb-2" {...props} />
              ),
              h3: ({ ...props }) => (
                <h3 className="text-md font-bold mb-1" {...props} />
              ),
              p: ({ ...props }) => (
                <p
                  className={`${
                    message.length > 400 ? "mb-4" : ""
                  } leading-relaxed`}
                  {...props}
                />
              ),
              ul: ({ ...props }) => (
                <ul className="mb-4 ml-6 list-disc" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="mb-4 ml-6 list-decimal" {...props} />
              ),
              li: ({ ...props }) => <li className="mb-1" {...props} />,
            }}
          >
            {byUser ? message : visibleText}
          </Markdown>
        </div>
      </div>
    </div>
  );
};
