import { useCollab } from "@/hooks/useCollabContext";
import { useRouter } from "next/router";
import { type FormEvent, useState } from "react";
import { io } from "socket.io-client";

export const socket = io("http://localhost:8080");
export default function Home() {
  const router = useRouter();

  const { setCollabName, failedToJoinMessage } = useCollab();

  const [sessionId, setSessionId] = useState("");
  const [creationErrorMessage, setCreationErrorMessage] = useState("");

  const joinSession = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/session/${sessionId}`);
  };

  type SuccessResponse = { success: true; collabId: string; name: string };
  type ErrorResponse = { success: false; message: string };

  const createSession = () => {
    socket.emit("create room", (props: SuccessResponse | ErrorResponse) => {
      if (props.success) {
        setCollabName(props.name);
        router.push(`/session/${props.collabId}`);
      } else {
        setCreationErrorMessage(props.message);
      }
    });
  };

  return (
    <div className="w-full h-screen">
      <main className="flex flex-col gap-8 justify-center items-center h-screen text-white text-lg">
        <section className="flex flex-col gap-2 items-center">
          <button
            className="py-4 px-3 rounded-md border-white border-2 cursor-pointer"
            onClick={createSession}
          >
            Create Session
          </button>
          {creationErrorMessage && <p>{creationErrorMessage}</p>}
        </section>
        <br />
        <p>OR</p>
        <br />
        <section className="flex flex-col gap-2 items-center">
          <form className="flex gap-6 items-center" onSubmit={joinSession}>
            <input
              className="text-black text-lg p-4 rounded-md bg-white"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.trim())}
            />
            <button
              className={`py-4 px-3 rounded-md border-2 ${
                !sessionId
                  ? "border-slate-500 text-slate-500"
                  : "border-white cursor-pointer"
              }`}
              type="submit"
              disabled={!sessionId}
            >
              Join Session
            </button>
          </form>
          {failedToJoinMessage && <p>Failed to join session. {failedToJoinMessage} !!</p>}
        </section>
      </main>
    </div>
  );
}
