"use client";
import SimpleDialog from "@components/SimpleDialog";
import { useState } from "react";

export default function NewAccountDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a onClick={() => setOpen(true)}>New Account</a>
      <SimpleDialog
        title="Create a new account"
        open={open}
        onClose={() => setOpen(false)}
      >
        Creating a new account is not supported yet.
      </SimpleDialog>
    </>
  );
}
