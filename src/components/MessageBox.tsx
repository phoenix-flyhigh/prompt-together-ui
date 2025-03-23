import { TMessage } from "@/pages/session/[id]";

export const MessageBox = (props: TMessage) => {
  const { message, byUser } = props;
  console.log(props);

  return (
    <div
      className={`flex flex-col gap-2 w-full ${
        byUser ? "items-end" : "items-start"
      }`}
    >
      {byUser && (
        <p className="text-sm text-slate-300 font-semibold">{props.username}</p>
      )}
      <p
        className={`text-lg bg-slate-800 border-2 border-slate-500 rounded-lg p-2 ${
          byUser ? "max-w-4xl" : ""
        }`}
      >
        {message}
      </p>
    </div>
  );
};
