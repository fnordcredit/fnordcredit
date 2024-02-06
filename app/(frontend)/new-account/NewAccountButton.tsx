"use client";
import React from "react";
import SimpleDialog from "@components/SimpleDialog";
import { useState } from "react";
import NewAccountForm from "./NewAccountForm";
import Icon from "@mdi/react";
import { mdiAccountPlus } from "@mdi/js";

export default function NewAccountDialog() {
  const [open, setOpen] = useState(false);
  const buttonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(true);
  };
  return (
    <>
      <a href="/new-account" onClick={buttonClick} className="my-auto">
        <Icon path={mdiAccountPlus} size={1} className="inline m-1 mt-0" />
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
