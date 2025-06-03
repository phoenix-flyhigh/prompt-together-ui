import { useCollab } from "@/hooks/useCollabContext";
import { useRouter } from "next/router";
import { type FormEvent, useState } from "react";
import { io } from "socket.io-client";
import { useTheme } from "@/hooks/useTheme";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";

export const socket = io(process.env.NEXT_PUBLIC_API_URL);

export default function Home() {
  const router = useRouter();

  const { setCollabName, failedToJoinMessage, setUsername } = useCollab();

  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [creationErrorMessage, setCreationErrorMessage] = useState("");
  const { theme } = useTheme();

  const joinSession = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/session/${sessionId}`);
  };

  type SuccessResponse = { success: true; collabId: string; name: string };
  type ErrorResponse = { success: false; message: string };

  const createSession = () => {
    setLoading(true);
    setUsername("");
    socket.emit("create room", (props: SuccessResponse | ErrorResponse) => {
      if (props.success) {
        setCollabName(props.name);
        router.push(`/session/${props.collabId}`);
      } else {
        setCreationErrorMessage(props.message);
      }
    });
    setLoading(false);
  };

  return (
    <div className="w-full">
      <section className="relative flex flex-col gap-8 justify-center items-center min-h-screen py-16 px-4">
        <div className="max-w-2xl text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Collaborate on AI Prompts in Real-Time
          </h2>
          <p className="text-lg md:text-xl opacity-80">
            Create or join a session to work together on prompts, share ideas,
            and get better results with collaborative prompt engineering.
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col gap-8 items-center">
          <section className="w-full flex flex-col gap-2 items-center">
            <button
              className="w-full py-4 px-6 flex justify-center rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 font-medium text-lg"
              onClick={createSession}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="opacity-75"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="80"
                    strokeDashoffset="60"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                "Create Session"
              )}
            </button>
            {creationErrorMessage && (
              <p className="text-red-500">{creationErrorMessage}</p>
            )}
          </section>

          <div className="flex items-center w-full gap-3">
            <div className="h-px flex-1 bg-gray-400 opacity-30"></div>
            <p className="text-lg">OR</p>
            <div className="h-px flex-1 bg-gray-400 opacity-30"></div>
          </div>

          <section className="w-full flex flex-col gap-2 items-center">
            <form
              className="w-full flex flex-col sm:flex-row gap-3 items-center"
              onSubmit={joinSession}
            >
              <input
                className={`w-full text-lg p-4 rounded-lg border-2 ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                type="text"
                placeholder="Enter session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value.trim())}
              />
              <button
                className={`py-4 px-6 rounded-lg sm:whitespace-nowrap ${
                  !sessionId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                } transition-colors duration-200 font-medium text-lg`}
                type="submit"
                disabled={!sessionId}
              >
                Join Session
              </button>
            </form>
            {failedToJoinMessage && (
              <p className="text-red-500">
                Failed to join session. {failedToJoinMessage} !!
              </p>
            )}
          </section>
        </div>
        <a
          href="#how-it-works"
          className="absolute bottom-6 animate-bounce flex items-center hover:text-blue-600 transition-colors"
        >
          <span className="block text-lg md:text-xl font-bold mb-1">
            How it works
          </span>
          <div className="text-2xl">
            <MdOutlineKeyboardDoubleArrowDown />
          </div>
        </a>
      </section>

      <section
        className={`py-16 px-4 ${
          theme === "dark"
            ? "bg-blue-900 bg-opacity-10"
            : "bg-blue-50 bg-opacity-30"
        }`}
        id="how-it-works"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-4 text-lg">
            <p>
              <strong>Prompt Together</strong> lets you collaborate with others
              on AI prompts in real-time. Whether you&apos;re working with a
              team, teaching prompt engineering, or just need a second pair of
              eyes, our platform makes it simple.
            </p>
            <p>
              <strong>Create a session</strong> to get a unique ID that you can
              share with others. Anyone with this ID can join your session and
              collaborate in real-time. Changes appear instantly for all
              participants, making it perfect for brainstorming and refinement.
            </p>
            <p>
              <strong>Join a session</strong> by entering the session ID shared
              with you. You&apos;ll immediately be connected to the
              collaborative workspace where you can contribute to the prompt
              engineering process.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold mb-8">Quick demo</h2>

          <div
            className={`aspect-video max-w-4xl mx-auto overflow-hidden rounded-xl border-2 ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            } shadow-lg`}
          >
            <video
              controls
              className="w-full h-full object-cover"
              poster="/assets/demo-poster.png"
              preload="metadata"
            >
              <source src="/assets/demo-video.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>
    </div>
  );
}
