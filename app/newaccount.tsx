"use client";
import SimpleDialog from "@components/SimpleDialog";
import { useState } from "react";

export default function NewAccountDialog({
  action,
}: {
  action: (_f: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        New Account
      </button>
      <SimpleDialog
        title="Create a new account"
        open={open}
        onClose={() => setOpen(false)}
      >
        <form action={action}>
          <div className="w-48">
            <div className="m-1 flex">
              <label htmlFor="name" className="mx-2 flex-grow text-lg">
                Name
              </label>
              <span className="rounded bg-error p-1 text-white">Error</span>
            </div>
            <input
              type="text"
              name="name"
              className="w-full"
              maxLength={20}
              placeholder="Your username"
              required
            ></input>
          </div>
          <button type="submit">Create</button>
        </form>
      </SimpleDialog>
    </>
  );
}
