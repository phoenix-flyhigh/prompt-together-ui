import { useRouter } from "next/router";
import { socket } from "..";
import { useEffect, useRef, useState } from "react";
import type { GetServerSideProps } from "next/types";
import { InputDialog } from "@/components/InputDialog";
import { useCollab } from "@/hooks/useCollabContext";
import { MessageBox } from "@/components/MessageBox";
import { MdSend, MdInfoOutline, MdPeople } from "react-icons/md";
import { useTheme } from "@/hooks/useTheme";

type QueryParams = { id: string };

export type TMessage =
  | {
      message: string;
      byUser: true;
      username: string;
    }
  | {
      message: string;
      byUser: false;
    };

type Toast = {
  id: number;
  message: string;
  type: "INFO";
};

export default function Session({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const { id } = router.query as QueryParams;
  const collabId = id ?? sessionId;
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";

  const {
    collabName,
    username,
    setUsername,
    setCollabName,
    setFailedToJoinMessage,
  } = useCollab();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [failedToSendMessage, setFailedToSendMessage] = useState(false);
  const [askingAI, setAskingAI] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const [notifications, setNotifications] = useState<Toast[]>([]);

  const dropdownRef = useRef<HTMLUListElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!username) {
      dialogRef.current?.showModal();
    }
  }, [username]);

  const addNotification = (message: string) => {
    const notificationId = Date.now();
    setNotifications((prev) => [
      {
        id: notificationId,
        message,
        type: "INFO",
      },
      ...prev,
    ]);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter(({ id }) => id !== notificationId)
      );
    }, 3000);
  };

  const handleDialogSubmit = (input: string) => {
    setFailedToJoinMessage("");
    setUsername(input);
    setIsLoading(true);

    socket.emit(
      "join room",
      { roomId: collabId, username: input },
      ({
        success,
        message,
        name,
        allMessages,
        members,
      }: {
        success: boolean;
        message: string;
        name: string;
        allMessages: TMessage[];
        members: string[];
      }) => {
        if (success) {
          setCollabName(name);
          setMessages(allMessages);
          setIsLoading(false);
          setAllUsers(members);
        } else {
          console.log(message);
          setFailedToJoinMessage(message);
          setUsername("");
          router.replace("/");
        }
      }
    );
  };

  const askAI = async () => {
    setError(false);
    setAskingAI(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: messages.reduce(
          (acc, msg) => (msg.byUser ? (acc += ` ${msg.message}`) : acc),
          ""
        ),
      }),
    });

    const data = await res.json();
    console.log("received", data);

    if (!data) {
      setError(true);
      setAskingAI(false);
      return;
    }

    socket.emit(
      "add message",
      {
        message: data.response,
        byUser: false,
        collabId,
        username: "AI",
      },
      () => {}
    );

    setAskingAI(false);
  };

  const handleSubmit = async () => {
    const message = inputText.trim();
    if (!message) return;

    setError(false);

    setFailedToSendMessage(false);
    socket.emit(
      "add message",
      {
        message,
        byUser: true,
        collabId,
        username,
      },
      ({ success }: { success: boolean }) => {
        if (success) {
          setInputText("");
          setMessages((prev) => [...prev, { message, byUser: true, username }]);
        } else {
          setFailedToSendMessage(true);
        }
      }
    );
  };

  useEffect(() => {
    socket.on("new message", ({ message, byUser, username }) => {
      setMessages((prev: TMessage[]) => [
        ...prev,
        { message, byUser, username },
      ]);
    });
    socket.on("typing", ({ users }) => {
      setTypingUsers(users);
    });

    socket.on("user joined", ({ username, members }) => {
      addNotification(`${username} has joined`);
      setAllUsers(members);
    });

    socket.on("user left", (username) => {
      addNotification(`${username} has left`);
    });

    socket.on("disconnect", () => {
      setUsername("");
      router.push("/");
    });

    const outsideClickHandler = (e: MouseEvent) => {
      if (!showDropdown) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", outsideClickHandler);

    return () => {
      socket.off("new message");
      socket.off("typing");
      socket.off("user joined");
      socket.off("user left");
      document.removeEventListener("click", outsideClickHandler);
    };
  }, [setUsername, showDropdown]);

  const enableAI = messages.length && !askingAI;

  if (!username) {
    return (
      <InputDialog
        title="Join collab as"
        onSubmit={handleDialogSubmit}
        inputPlaceholderText="Enter your name"
        suggestion="Min length: 3"
        ref={dialogRef}
      />
    );
  }

  if (isLoading || !collabName) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex w-full justify-start items-center flex-col flex-grow`}
    >
      <section
        className={`relative flex justify-between items-center py-4 px-6 md:px-10 w-full ${
          isDarkTheme
            ? "bg-gray-900 border-b border-gray-700"
            : "bg-gray-100 border-b border-gray-200"
        } shadow-sm`}
      >
        <div className="flex-1" />
        <h1 className="text-xl font-bold flex-1">{collabName}</h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-md ${
            isDarkTheme
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-blue-100 hover:bg-blue-200"
          } transition-colors justify-self-end`}
        >
          <MdPeople size={20} />
          <span>Users ({allUsers.length})</span>
        </button>
        {showDropdown && (
          <ul
            aria-label="members"
            className={`absolute right-4 top-16 z-10 rounded-md shadow-lg p-2 min-w-48 ${
              isDarkTheme
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
            ref={dropdownRef}
          >
            {allUsers.map((user) => (
              <li
                key={user}
                className={`p-2 ${user === username ? "font-bold" : ""} ${
                  isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-md`}
              >
                {user === username ? `${user} (You)` : user}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col w-full p-4 lg:w-3/4 overflow-y-auto flex-grow">
        <div className="flex flex-col gap-8 pb-4">
          {messages.map((msg, i) =>
            msg.byUser ? (
              <MessageBox
                key={i}
                message={msg.message}
                byUser={msg.byUser}
                username={msg.username === username ? "You" : msg.username}
              />
            ) : (
              <MessageBox key={i} message={msg.message} byUser={msg.byUser} />
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className={`flex flex-col gap-3 w-full p-4 lg:w-3/4 ${
          isDarkTheme ? "bg-gray-900" : "bg-gray-50"
        } border-t ${isDarkTheme ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex flex-col gap-2 w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="w-full relative"
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className={`w-full p-4 text-md rounded-lg border-2 ${
                isDarkTheme
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter your prompt"
              rows={4}
              maxLength={700}
              onFocus={() =>
                socket.emit("started typing", { username, collabId })
              }
              onBlur={() =>
                socket.emit("stopped typing", { username, collabId })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim()) {
                    handleSubmit();
                  }
                }
              }}
            />
            <button
              className={`absolute right-4 bottom-4 p-2 rounded-full ${
                !inputText.trim()
                  ? "text-gray-400 cursor-not-allowed"
                  : isDarkTheme
                  ? "text-blue-400 hover:text-blue-300 cursor-pointer"
                  : "text-blue-600 hover:text-blue-500 cursor-pointer"
              }`}
              type="submit"
              disabled={!inputText.trim()}
            >
              <MdSend size={24} />
            </button>
          </form>
          <div className="flex justify-between items-center text-xs">
            <span
              className={`${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
            >
              Press Enter to send, Shift+Enter for new line
            </span>
            {typingUsers.length > 0 && (
              <p
                className={`text-sm font-medium ${
                  isDarkTheme ? "text-blue-400" : "text-blue-600"
                } animate-pulse`}
              >
                {`${typingUsers.join(", ")} ${
                  typingUsers.length > 1 ? "are" : "is"
                } typing...`}
              </p>
            )}
          </div>
          {failedToSendMessage && (
            <p className="text-red-500 text-sm">
              Failed to send message. Please try again!
            </p>
          )}
        </div>

        <div className="flex flex-col items-center mt-2">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              !enableAI
                ? `${
                    isDarkTheme
                      ? "bg-gray-800 text-gray-600"
                      : "bg-gray-200 text-gray-400"
                  } cursor-not-allowed`
                : `${
                    isDarkTheme
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white cursor-pointer`
            }`}
            disabled={!enableAI}
            onClick={askAI}
          >
            {askingAI ? "Thinking..." : "Ask AI"}
          </button>
          {error && (
            <p className="text-red-500 mt-2">
              Failed to get AI response. Please try again!
            </p>
          )}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-2">
          {notifications.map(({ id, message }: Toast) => (
            <div
              key={id}
              role="alert"
              className={`p-3 rounded-md shadow-lg flex items-center gap-3 text-sm max-w-xs animate-fadeIn ${
                isDarkTheme
                  ? "bg-gray-800 text-white border border-gray-700"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              <MdInfoOutline className="text-blue-500" size={20} />
              {message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sessionId } = context.query;

  return {
    props: {
      sessionId: sessionId || null,
    },
  };
};
