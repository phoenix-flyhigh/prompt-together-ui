import { useRouter } from "next/router";
import { socket } from "..";
import { useEffect, useRef, useState } from "react";
import type { GetServerSideProps } from "next/types";
import { InputDialog } from "@/components/InputDialog";
import { useCollab } from "@/hooks/useCollabContext";
import { MessageBox } from "@/components/MessageBox";

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
  console.log(!messages.length && askingAI);

  const handleSubmit = async () => {
    setError(false);

    setFailedToSendMessage(false);
    socket.emit(
      "add message",
      {
        message: inputText,
        byUser: true,
        collabId,
        username,
      },
      ({ success }: { success: boolean }) => {
        if (success) {
          setInputText("");
          setMessages((prev) => [
            ...prev,
            { message: inputText, byUser: true, username },
          ]);
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
    return <div>Loading</div>;
  }

  return (
    <div className="relative flex w-full justify-start flex-col gap-4 h-screen">
      <section className="relative flex justify-between p-4">
        <p className="text-xl font-bold">{collabName}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          }}
        >
          Users
        </button>
        {showDropdown && (
          <ul
            aria-label="members"
            className="absolute right-4 top-12"
            ref={dropdownRef}
          >
            {allUsers.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        )}
      </section>
      <div className="flex flex-col gap-8 items-center justify-center w-full p-4 lg:w-3/4">
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

        <div className="flex flex-col gap-2 items-start w-full">
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
              className="w-full border-2 border-white p-4 text-md bg-slate-800 rounded-lg"
              placeholder="Enter your prompt"
              rows={4}
              maxLength={700}
              onFocus={() =>
                socket.emit("started typing", { username, collabId })
              }
              onBlur={() =>
                socket.emit("stopped typing", { username, collabId })
              }
            />
            <button
              className="absolute right-3 bottom-3 text-white"
              type="submit"
              disabled={!inputText}
            >
              Send
            </button>
          </form>
          {typingUsers.length > 0 && (
            <p className="text-sm font-semibold text-slate-400">
              {`${typingUsers.join(", ")} ${
                typingUsers.length > 1 ? "" : "is"
              } typing...`}
            </p>
          )}
          {failedToSendMessage && (
            <p>Failed to send message. Please try again!!</p>
          )}
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button
            className={`border-2 ${
              !enableAI
                ? "border-slate-600 text-slate-600"
                : "border-white cursor-pointer"
            } px-4 py-2 w-fit`}
            disabled={!enableAI}
            onClick={askAI}
          >
            Ask AI
          </button>
          {error && <p>Failed to get AI response, Please try again!</p>}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="absolute bottom-12 right-12 gap-2 flex flex-col">
          {notifications.map(({ id, message }: Toast) => (
            <div key={id} role="alert" className="p-4 rounded-md bg-slate-700">
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
