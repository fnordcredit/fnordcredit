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
          <div className="flex">
            <label htmlFor="name" className="mx-2">
              Name
            </label>
            <input type="text" name="name" maxLength={20} required></input>
          </div>
          <button type="submit">Create</button>
        </form>
      </SimpleDialog>
    </>
  );
}
