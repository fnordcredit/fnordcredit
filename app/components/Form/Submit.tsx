"use client";
import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";

interface SubmitProps {
  children: ReactNode;
  disabled?: boolean;
  icon?: string;
}

export default function Submit({ children, disabled, icon }: SubmitProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex justify-center rounded-md border border-transparent bg-primary-A100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-A200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group-invalid:pointer-events-none group-invalid:opacity-30 disabled:opacity-30 disabled:pointer-events-none"
      disabled={disabled || pending}
    >
      {icon != null && !pending ? (
        <Icon path={icon} size={1} />
      ) : pending ? (
        <Icon path={mdiLoading} size={1} className="animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
