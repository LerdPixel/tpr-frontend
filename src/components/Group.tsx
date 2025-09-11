import { useState } from "react";
//import styles from "./styles/Student.module.css";
import type { IGroup } from "./ui/interfaces/IGroup";
import Edit from "../imgs/editing.png";
import EditHover from "../imgs/edit.png";
import SmartImg from "./ui/SmartImg/SmartImg";
import styles from "../styles/GroupsPage.module.css";

interface Props {
  group: IGroup;
  busyId: number | null;
  onRename: (id: number, name: string) => Promise<void>;
  onArchive: (id: number, archived: boolean) => Promise<void>;
  onClick?: (id: number) => void;
}
export default function GroupItem({
  group,
  busyId,
  onRename,
  onArchive,
  onClick,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [hovered, setHover] = useState(false);

  const save = async () => {
    if (!name.trim() || name.trim() === group.name) {
      setEditing(false);
      setName(group.name);
      return;
    }
    await onRename(group.id, name.trim());
    setEditing(false);
  };

  const isArchived = !!group.archived_at;

  return (
    <tr
      key={group.id}
      className={`${styles.item} ${hovered ? styles.hoveredItem : ""} ${
        isArchived ? styles.archived : ""
      }`}
    >
      {editing ? (
        <td className={styles.editRow}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className={styles.input}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setEditing(false);
                setName(group.name);
              }
            }}
          />
          <button
            disabled={busyId === group.id}
            onClick={save}
            className={styles.btn}
          >
            Сохранить
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setName(group.name);
            }}
            className={styles.btn}
          >
            Отмена
          </button>
        </td>
      ) : (
        <>
          <td
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={styles.info}
            onClick={() => onClick?.(group.id)}
          >
            <span className={styles.name}>{group.name}</span>
            <span className={styles.date}>
              {new Date(group.created_at).toLocaleDateString()}
            </span>
            {isArchived && <span className={styles.badge}>Архив</span>}
          </td>
          <td className={styles.actions}>
            {busyId === group.id || (
              <SmartImg
                InitialImage={Edit}
                HoverImage={EditHover}
                onClick={() => setEditing(true)}
                className={styles.Icon}
              ></SmartImg>
            )}
            <button
              disabled={busyId === group.id}
              onClick={() => onArchive(group.id, isArchived)}
              className={styles.btn}
            >
              {isArchived ? "Разархивировать" : "Архивировать"}
            </button>
          </td>
        </>
      )}
    </tr>
  );
}
