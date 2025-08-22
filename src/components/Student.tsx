import { MoreVertical } from "lucide-react"; // иконка троеточия
import { useState } from "react";
import styles from "./styles/Student.module.css";
import type { IStudent } from "./ui/interfaces/IStudent";
import DisApprovedImg from "../imgs/disapproved.png"
import DeleteImg from "../imgs/trash-bin.png"
import HoverDeleteImg from "../imgs/trash.png"
import HoverCheckImg from "../imgs/accept.png"
import CheckMarkImg from "../imgs/check_mark.png"
import SmartImg from "./ui/SmartImg/SmartImg";

const StudentAva = (student : IStudent) => {
    if (student.is_approved) {
        return <img src="../imgs/approved.png"></img>
    }
    else {
        return <img src={DisApprovedImg}></img>
    }
}

const Student = ({ student, remove, approve }) => {
    const [open, setOpen] = useState(false);

    const studentName = () =>
        `${student.last_name} ${student.first_name} ${student.patronymic}`;

  return (
    <tr className={styles.studentRow}>
      <td className={styles.studentIcon}>{StudentAva(student)}</td>
      <td className={styles.studentInfo}>
        <div className={styles.studentName}>{studentName()}</div>
        {student.group_id && (
          <div className={styles.studentGroup}>{student.group_id}</div>
        )}
      </td>
    {student.is_approved || <td>
        <SmartImg onClick={() => approve(student)} InitialImage={CheckMarkImg} HoverImage={HoverCheckImg} className={styles.ava}></SmartImg>
    </td>}
    <td>
        <SmartImg InitialImage={DeleteImg} HoverImage={HoverDeleteImg} className={styles.ava} onClick={() => remove(student)}></SmartImg>
    </td>

      {/* <td className={styles.studentActions}>
        <button
          className={styles.moreBtn}
          onClick={() => setOpen((prev) => !prev)}
        >
          <MoreVertical size={20} />
        </button>
        {open && (
          <ul className={styles.dropdown}>
            <li>Утвердить</li>
            <li>Сделать семинаристом</li>
            <li className={styles.delete} onClick={() => remove(student)}>
              Удалить
            </li>
          </ul>
        )}
      </td> */}
    </tr>
  );
};

export default Student;
