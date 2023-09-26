import { ReactNode } from "react";

interface ButtonProps {
  color?: "default" | "error";
  className?: string;
  children: ReactNode;
}

export default function Button<T extends ButtonProps>({
  children,
  color,
  className: extraClasses,
  ...props
}: T) {
  return (
    <button
      type="button"
      className={`inline-flex justify-center rounded-md border border-transparent ${
        color === "error"
          ? "bg-red-400 hover:bg-red-600"
          : "bg-primary-A100 hover:bg-primary-A200"
      } px-4 py-2 text-sm font-medium text-primary-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        extraClasses ?? ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
