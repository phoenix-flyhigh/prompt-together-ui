import { Geist } from "next/font/google";
import { useRouter } from "next/router";
import { useState } from "react";
import { io } from "socket.io-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  const socket = io("http://localhost:8080");

  const router = useRouter();
  const { sessionId } = router.query;

  const [sessionInput, setSessionInput] = useState("");

  const updateSessionId = (id: string | undefined) => {
    const query = { ...router.query, sessionId: id };

    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  const joinSession = () => {
    socket.emit(
      "join room",
      { roomId: sessionInput },
      ({ success, roomId }: { success: boolean; roomId: string }) => {
        if (success) {
          updateSessionId(roomId);
        }
      }
    );
  };

  const createSession = () => {
    socket.emit(
      "createRoom",
      ({ success, roomId }: { success: boolean; roomId: string }) => {
        if (success) {
          updateSessionId(roomId);
        }
      }
    );
  };

  return (
    <div
      className={`${geistSans.variable} flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className="flex flex-col gap-8">
        <h1>Prompt Together</h1>
        {sessionId ? (
          <div>Your session is {sessionId}</div>
        ) : (
          <>
            <button
              className="text-white border-white border-2 rounded-md p-4"
              onClick={createSession}
            >
              Start session
            </button>

            <div>
              <input
                type="text"
                placeholder="Enter session id"
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value.trim())}
                className="text-black w-40 p-2 rounded-md"
              />
              <button
                className="text-white border-white border-2 rounded-md p-4"
                onClick={joinSession}
              >
                Join session
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
