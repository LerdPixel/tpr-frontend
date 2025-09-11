import { useState } from "react";
import styles from "./styles/Student.module.css";
import SmartImg from "./ui/SmartImg/SmartImg";
import type { IPerson } from "./ui/interfaces/IPerson";

import DisApprovedImg from "../imgs/disapproved.png";
import DeleteImg from "../imgs/trash-bin.png";
import HoverDeleteImg from "../imgs/trash.png";
import HoverCheckImg from "../imgs/accept.png";
import CheckMarkImg from "../imgs/check_mark.png";
import StudentImg from "../imgs/user.png";
import SeminaristImg from "../imgs/seminarist.png";

interface StudentProps {
  student: IPerson;
  remove: (student: IPerson) => void;
  approve: (student: IPerson) => void;
  groupFromId: (id: number) => string;
  onClick: (student: IPerson) => void;
}

const StudentAva = (student: IPerson, ...props: any[]) => {
  if (student.is_approved) {
    if (student.group_id == 1)
      return <img src={SeminaristImg} {...props}></img>;
    return <img src={StudentImg} {...props}></img>;
  } else {
    return <img src={DisApprovedImg} {...props}></img>;
  }
};

const Student: React.FC<StudentProps> = ({
  student,
  remove,
  approve,
  groupFromId,
  onClick,
}) => {
  const [open, setOpen] = useState(false);

  const studentName = () =>
    `${student.last_name} ${student.first_name} ${student.patronymic}`;

  return (
    <tr className={styles.studentRow}>
      <td className={styles.studentIcon}>{StudentAva(student)}</td>
      <td className={styles.studentInfo} onClick={() => onClick(student)}>
        <div className={styles.studentName}>{studentName()}</div>
        {student.group_id && (
          <div className={styles.studentGroup}>
            {groupFromId(student.group_id)}
          </div>
        )}
      </td>
      <td>
        <SmartImg
          InitialImage={DeleteImg}
          HoverImage={HoverDeleteImg}
          className={styles.ava}
          onClick={() => remove(student)}
        ></SmartImg>
      </td>
      {student.is_approved || (
        <td>
          <SmartImg
            onClick={() => approve(student)}
            InitialImage={CheckMarkImg}
            HoverImage={HoverCheckImg}
            className={styles.ava}
          ></SmartImg>
        </td>
      )}
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
