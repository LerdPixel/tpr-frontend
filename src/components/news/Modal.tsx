import React, { type PropsWithChildren, useEffect } from "react";
import styles from "./News.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Modal({
  open,
  onClose,
  children,
}: PropsWithChildren<Props>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div
        className={styles.modalContent}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
