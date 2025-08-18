import React from "react";
import type { Student } from "../pages/GradesheetCreation.tsx";
import type { FinalColumn } from "./FinalSectionSetup.tsx";

interface Props {
  courseName: string;
  students: Student[];
  section1Lessons: number;
  section2Lessons: number;
  finalColumns: FinalColumn[];
}

const GradeTable: React.FC<Props> = ({
  courseName,
  students,
  section1Lessons,
  section2Lessons,
  finalColumns,
}) => {
  if (!students.length) {
    return <p style={{ color: "gray" }}>Нет выбранных студентов для отображения.</p>;
  }

  return (
    <div>
      <h2>Ведомость: {courseName || "Без названия"}</h2>
      <table border={1} cellPadding={5} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ФИО</th>
            {Array.from({ length: section1Lessons }, (_, i) => (
              <th key={`s1-${i}`}>Р1 Зан. {i + 1}</th>
            ))}
            {Array.from({ length: section2Lessons }, (_, i) => (
              <th key={`s2-${i}`}>Р2 Зан. {i + 1}</th>
            ))}
            {finalColumns.map((col) => (
              <th key={col.id}>{col.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((st) => (
            <tr key={st.id}>
              <td>{st.name}</td>
              {Array.from(
                { length: section1Lessons + section2Lessons + finalColumns.length },
                (_, i) => (
                  <td key={i}></td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradeTable;
