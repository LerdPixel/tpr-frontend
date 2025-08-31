import styles from "./News.module.css";
import React, { useState, useRef, useEffect } from "react";

interface Props {
  id: number;
  title: string;
  description?: string;
  fileUrl?: string;
  testId?: number;
  groupNames: string[];
  onEdit: (id: number) => void;
}

export default function NewsItem({
  id,
  title,
  description,
  fileUrl,
  testId,
  groupNames,
  onEdit,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={styles.menu} ref={menuRef}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Действия"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className={styles.menuDropdown}>
              <button className={styles.menuItem} onClick={() => onEdit(id)}>
                Редактировать
              </button>
              {/* при желании можно добавить Удалить */}
            </div>
          )}
        </div>
      </div>

      {description && <p className={styles.cardDesc}>{description}</p>}

      <div className={styles.linksRow}>
        {fileUrl && (
          <a className={styles.link} href={fileUrl} target="_blank" rel="noreferrer">
            скачать
          </a>
        )}
      </div>

      {groupNames.length > 0 && (
        <div className={styles.groupsRow}>
          Для групп: {groupNames.join(", ")}
        </div>
      )}
    </div>
  );
}
