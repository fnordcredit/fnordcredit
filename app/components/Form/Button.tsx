import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
}

export default function Button<T extends ButtonProps>({
  children,
  ...props
}: T) {
  return (
    <button
      type="button"
      className="inline-flex justify-center rounded-md border border-transparent bg-primary-A100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-A200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      {...props}
    >
      {children}
    </button>
  );
}
