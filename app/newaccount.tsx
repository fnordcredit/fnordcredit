"use client";
import SimpleDialog from "@components/SimpleDialog";
import { useState } from "react";

export default function NewAccountDialog({ action }) {
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
        <form action={action} className="flex">
          <input type="text" name="name"></input>
          <button type="submit">Create</button>
        </form>
      </SimpleDialog>
    </>
  );
}
