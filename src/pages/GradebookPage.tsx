import React, { useState } from "react";
import styles from "../styles/Gradebook.module.css";

export default function GradebookPage() {
  // тестовые данные
  const gradebook = {
    id: 1,
    name: "Математика",
    lecture_count: 10,
    lab_count: 2,
    test_points: 20,
  };

  const students = [
    { id: 1, last_name: "Иванов", first_name: "Иван", patronymic: "Иванович" },
    { id: 2, last_name: "Петров", first_name: "Пётр", patronymic: "Петрович" },
    { id: 3, last_name: "Сидоров", first_name: "Сидор", patronymic: "Сидорович" },
  ];

  const points: Record<number, any> = {
    1: { labs_points_awarded: 5, test_points_awarded: 10, total_awarded: 15 },
    2: { labs_points_awarded: 7, test_points_awarded: 12, total_awarded: 19 },
    3: { labs_points_awarded: 4, test_points_awarded: 8, total_awarded: 12 },
  };

  const initialAttendance: Record<number, number[]> = {
    1: [0, 1, 3],
    2: [2, 5, 6],
    3: [],
  };

  const [localAttendance, setLocalAttendance] = useState(initialAttendance);

  const toggleAttendance = (studentId: number, lecture: number) => {
    setLocalAttendance((prev) => {
      const attended = prev[studentId] || [];
      if (attended.includes(lecture)) {
        return { ...prev, [studentId]: attended.filter((l) => l !== lecture) };
      } else {
        return { ...prev, [studentId]: [...attended, lecture] };
      }
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ведомость дисциплины "{gradebook.name}"</h2>

      <table className={styles.table}>
        <thead>
          {/* верхняя строка */}
          <tr>
            <th rowSpan={2}>Ученик</th>
            <th colSpan={gradebook.lecture_count}>Лекции</th>
            {Array.from({ length: gradebook.lab_count }).map((_, i) => (
              <th key={`labHeader${i}`} rowSpan={2}>
                Лаб{i + 1}
              </th>
            ))}
            <th rowSpan={2}>Тест</th>
            <th rowSpan={2}>Итог</th>
          </tr>
          {/* строка с номерами */}
          <tr>
            {Array.from({ length: gradebook.lecture_count }).map((_, i) => (
              <th key={i}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const pts = points[s.id];
            return (
              <tr key={s.id}>
                <td>{`${s.last_name} ${s.first_name[0]}.${s.patronymic[0]}.`}</td>
                {Array.from({ length: gradebook.lecture_count }).map((_, i) => {
                  const attended = localAttendance[s.id]?.includes(i);
                  return (
                    <td
                      key={i}
                      className={styles.cell}
                      onClick={() => toggleAttendance(s.id, i)}
                    >
                      {attended ? "" : "Н"}
                    </td>
                  );
                })}
                {Array.from({ length: gradebook.lab_count }).map((_, i) => (
                  <td key={`lab${i}`} className={styles.cell}>
                    {pts?.labs_points_awarded || ""}
                  </td>
                ))}
                <td className={styles.cell}>{pts?.test_points_awarded || ""}</td>
                <td className={styles.cell}>{pts?.total_awarded || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
