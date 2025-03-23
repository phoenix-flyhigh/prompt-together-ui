import { useRouter } from "next/router";
import { socket } from "..";
import { useEffect, useRef, useState } from "react";
import type { GetServerSideProps } from "next/types";
import { InputDialog } from "@/components/InputDialog";
import { useCollab } from "@/hooks/useCollabContext";

type QueryParams = { id: string };

export default function Session({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const { id } = router.query as QueryParams;

  const { collabName, username, setUsername, setCollabName } = useCollab();

  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!username) {
      dialogRef.current?.showModal();
    }
  }, [username]);

  const handleSubmit = (input: string) => {
    setUsername(input);
    console.log(id ?? sessionId);

    socket.emit(
      "join room",
      { roomId: id ?? sessionId, username: input },
      ({
        success,
        message,
        name,
      }: {
        success: boolean;
        message: string;
        name: string;
      }) => {
        if (success) {
          setCollabName(name);
          setIsLoading(false);
        } else {
          console.log(message);

          router.replace("/");
        }
      }
    );
  };

  if (!username) {
    return (
      <InputDialog
        title="Join collab as"
        onSubmit={handleSubmit}
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
    <div className="flex flex-col gap-8 items-center justify-center">
      <p className="text-xl font-bold">{collabName}</p>
      <p className="text-lg">welcome , {username}</p>
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
