"use client";
import React from "react";
import SimpleDialog from "@components/SimpleDialog";
import { useState } from "react";
import NewAccountForm from "./NewAccountForm";

export default function NewAccountDialog() {
  const [open, setOpen] = useState(false);
  const buttonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(true);
  };
  return (
    <>
      <a href="/new-account" onClick={buttonClick} className="my-auto">
        New Account
      </a>
      <SimpleDialog
        title="Create a new account"
        open={open}
        onClose={() => setOpen(false)}
      >
        <NewAccountForm />
      </SimpleDialog>
    </>
  );
}
