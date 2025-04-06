import { forwardRef, useState, ForwardRefRenderFunction } from "react";

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

  const isJoinDisabled = value.length < minLength;

  return (
    <dialog
      className="border-white border-2 flex flex-col gap-8 bg-black text-white p-4 rounded-lg w-1/4"
      ref={ref}
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!value) return;
          onSubmit(value);
        }}
        className="flex flex-col gap-4"
      >
        <input
          className="bg-slate-600 text-white p-2 rounded-md border-2 border-white"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={inputPlaceholderText ?? ""}
          required
          min={minLength}
          maxLength={60}
        />
        <span className="text-slate-300 text-sm">{suggestion}</span>
        <button
          type="submit"
          className={`self-end border-2 py-1 px-3 rounded-md ${
            isJoinDisabled
              ? "border-slate-600 cursor-pointer text-slate-600"
              : "border-white"
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
