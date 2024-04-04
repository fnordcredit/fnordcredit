"use client";
import React, { useEffect, useState } from "react";
import styles from "./Snackbar.module.scss";
import Icon from "@mdi/react";
import { mdiClose } from "@mdi/js";

interface SnackbarProps {
  timeout?: number | null;
  theme?: "error" | "success";
  children: React.ReactNode;
}

interface SnackbarContainerProps {
  children: React.ReactNode;
}

export function SnackbarContainer(props: SnackbarContainerProps) {
  return <div className={styles.container}>{props.children}</div>;
}

export default function Snackbar(props: SnackbarProps) {
  const [open, setOpen] = useState(true);
  const closeSnackbar = (e?: React.MouseEvent) => {
    // prevent href when js enabled, allow page reload which clears the
    // Snackbar when js is disabled
    e?.preventDefault();
    setOpen(false);
  };
  useEffect(() => {
    const i = setInterval(closeSnackbar, props.timeout ?? 3500);
    return () => clearInterval(i);
  });
  return (
    <div
      className={`${styles.snackbar} ${!open ? styles.closed : ""} ${props.theme === "error" ? styles.error : styles.success} bg-error`}
      onClick={closeSnackbar}
    >
      <span>{props.children}</span>
      <a href="" onClick={closeSnackbar}>
        <Icon path={mdiClose} size={1} />
      </a>
      <div className={styles.progress}></div>
    </div>
  );
}
