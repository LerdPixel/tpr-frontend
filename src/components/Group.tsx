import { MoreVertical } from "lucide-react"; // иконка троеточия
import { useState } from "react";
//import styles from "./styles/Student.module.css";
import type { IGroup } from "./ui/interfaces/IGroup";
import Edit from "../imgs/editing.png"
import EditHover from "../imgs/edit.png"
import SmartImg from "./ui/SmartImg/SmartImg";
import styles from "../pages/GroupsPage.module.css";

interface Props {
    group : IGroup,
    Click : (id : number) => void
}


interface Props {
  group: IGroup;
  busyId: number | null;
  onRename: (id: number, name: string) => Promise<void>;
  onArchive: (id: number, archived: boolean) => Promise<void>;
}
export default function GroupItem({ group, busyId, onRename, onArchive }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);

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
    <tr key={group.id} className={`${styles.item} ${isArchived ? styles.archived : ""}`} >
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
          <button disabled={busyId === group.id} onClick={save} className={styles.btn}>
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
          <td className={styles.info}>
            <span className={styles.name}>{group.name}</span>
            <span className={styles.date}>
              {new Date(group.created_at).toLocaleDateString()}
            </span>
            {isArchived && <span className={styles.badge}>Архив</span>}
          </td>
          <td className={styles.actions}>
            {busyId === group.id ||
            <SmartImg
                InitialImage={Edit}
                HoverImage={EditHover}
                onClick={() => setEditing(true)}
                className={styles.Icon}
            >
            </SmartImg>}
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


// const Group = ({ group, onClick} : Props) => {
//     const [open, setOpen] = useState(false);

//     const studentName = () =>
//         `${student.last_name} ${student.first_name} ${student.patronymic}`;

//   return (
//     <tr className={styles.studentRow}>
//       <td className={styles.studentIcon}>{StudentAva(student)}</td>
//       <td className={styles.studentInfo}>
//         <div className={styles.studentName}>{studentName()}</div>
//         {student.group_id && (
//           <div className={styles.studentGroup}>{student.group_id}</div>
//         )}
//       </td>
//     {student.is_approved || <td>
//         <SmartImg onClick={() => approve(student)} InitialImage={CheckMarkImg} HoverImage={HoverCheckImg} className={styles.ava}></SmartImg>
//     </td>}
//     <td>
//         <SmartImg InitialImage={DeleteImg} HoverImage={HoverDeleteImg} className={styles.ava} onClick={() => remove(student)}></SmartImg>
//     </td>

//       {/* <td className={styles.studentActions}>
//         <button
//           className={styles.moreBtn}
//           onClick={() => setOpen((prev) => !prev)}
//         >
//           <MoreVertical size={20} />
//         </button>
//         {open && (
//           <ul className={styles.dropdown}>
//             <li>Утвердить</li>
//             <li>Сделать семинаристом</li>
//             <li className={styles.delete} onClick={() => remove(student)}>
//               Удалить
//             </li>
//           </ul>
//         )}
//       </td> */}
//     </tr>
//   );
// };

//export default Student;
