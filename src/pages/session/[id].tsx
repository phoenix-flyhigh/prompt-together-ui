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

export default function Session({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const { id } = router.query as QueryParams;
  const collabId = id ?? sessionId;

  const { collabName, username, setUsername, setCollabName } = useCollab();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [askingAI, setAskingAI] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!username) {
      dialogRef.current?.showModal();
    }
  }, [username]);

  const handleDialogSubmit = (input: string) => {
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
      }: {
        success: boolean;
        message: string;
        name: string;
        allMessages: TMessage[];
      }) => {
        if (success) {
          setCollabName(name);
          setMessages(allMessages);
          setIsLoading(false);
        } else {
          console.log(message);

          router.replace("/");
        }
      }
    );
  };

  const askAI = async () => {
    if (!inputText) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: inputText }),
    });

    const data = await res.json();
    console.log("received", data);

    if (!data) {
      setError(true);
      return;
    }

    socket.emit("add message", {
      message: data.response,
      byUser: false,
      collabId,
      username: "AI",
    });
  };

  const handleSubmit = async () => {
    setError(false);
    socket.emit("add message", {
      message: inputText,
      byUser: true,
      collabId,
      username,
    });

    try {
      setAskingAI(true);
      await askAI();
      setInputText("");
      setMessages((prev) => [
        ...prev,
        { message: inputText, byUser: true, username },
      ]);
      setAskingAI(false);
    } catch (e) {
      console.error("error occured", e);
    }
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

    socket.on("disconnect", () => {
      console.log("left room");

      router.push("/");
    });

    return () => {
      socket.off("new message");
      socket.off("typing");
    };
  }, []);

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
    <div className="flex w-full justify-center">
      <div className="flex flex-col gap-8 items-center justify-center w-full p-4 lg:w-3/4">
        <p className="text-xl font-bold">{collabName}</p>
        <p className="text-lg">welcome , {username}</p>

        {messages.map((msg, i) =>
          msg.byUser ? (
            <MessageBox
              key={i}
              message={msg.message}
              byUser={msg.byUser}
              username={msg.username}
            />
          ) : (
            <MessageBox key={i} message={msg.message} byUser={msg.byUser} />
          )
        )}

        <div className="flex flex-col gap-2 items-start w-full">
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
            onBlur={() => socket.emit("stopped typing", { username, collabId })}
          />
          {typingUsers.length > 0 && (
            <p className="text-sm font-semibold text-slate-400">
              {`${typingUsers.join(", ")} ${
                typingUsers.length > 1 ? "" : "is"
              } typing...`}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button
            className={`border-2 ${
              !inputText
                ? "border-slate-600 text-slate-600"
                : "border-white cursor-pointer"
            } px-4 py-2 w-fit`}
            disabled={!inputText || askingAI}
            onClick={handleSubmit}
          >
            Ask AI
          </button>
          {error && <p>Failed to get AI response, Please try again!</p>}
        </div>
      </div>
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
