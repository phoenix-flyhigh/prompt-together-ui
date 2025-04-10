import { forwardRef, useState, ForwardRefRenderFunction } from "react";
import { useTheme } from "@/hooks/useTheme";

interface InputDialogProps {
  title: string;
  inputPlaceholderText?: string;
  suggestion?: string;
  onSubmit: (input: string) => void;
  minLength?: number;
}

const InputDialogComponent: ForwardRefRenderFunction<
  HTMLDialogElement,
  InputDialogProps
> = (props, ref) => {
  const {
    title,
    inputPlaceholderText,
    suggestion,
    minLength = 3,
    onSubmit,
  } = props;

  const [value, setValue] = useState("");
  const { theme } = useTheme();

  const isDarkTheme = theme === "dark";

  const isJoinDisabled = value.length < minLength;

  return (
    <dialog
      className={`border-2 flex flex-col gap-6 p-6 rounded-lg shadow-xl w-full max-w-md ${
        isDarkTheme
          ? "bg-gray-900 text-white border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
      ref={ref}
    >
      <h2 className="text-xl font-bold">{title}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!value) return;
          onSubmit(value);
        }}
        className="flex flex-col gap-4"
      >
        <input
          className={`p-3 rounded-lg border-2 ${
            isDarkTheme
              ? "bg-gray-800 text-white border-gray-700 focus:border-blue-500"
              : "bg-white text-gray-900 border-gray-300 focus:border-blue-500"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={inputPlaceholderText ?? ""}
          required
          min={minLength}
          maxLength={60}
        />
        <span
          className={`text-sm ${
            isDarkTheme ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {suggestion}
        </span>
        <button
          type="submit"
          className={`self-end py-2 px-4 rounded-lg font-medium transition-colors ${
            isJoinDisabled
              ? `${
                  isDarkTheme
                    ? "bg-gray-800 text-gray-600"
                    : "bg-gray-200 text-gray-400"
                } cursor-not-allowed`
              : `${
                  isDarkTheme
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`
          }`}
          disabled={isJoinDisabled}
        >
          Join
        </button>
      </form>
    </dialog>
  );
};

export const InputDialog = forwardRef(InputDialogComponent);
InputDialog.displayName = "InputDialog";
