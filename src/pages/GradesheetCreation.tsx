import React, { useState } from "react";
import SectionSetup from "../components/SectionSetup.tsx";
import FinalSectionSetup from "../components/FinalSectionSetup.tsx";
import type { FinalColumn } from "../components/FinalSectionSetup.tsx";
import GradeTable from "../components/GradeTable.tsx";
import GroupSelector from "../components/GroupSelector.tsx";

export interface Student {
  id: number;
  name: string;
  groupId: number;
}

export interface Group {
  id: number;
  name: string;
}
const GradesheetCreation = () => {
   const [courseName, setCourseName] = useState("");
  const [section1Lessons, setSection1Lessons] = useState(0);
  const [section2Lessons, setSection2Lessons] = useState(0);
  const [section1Max, setSection1Max] = useState(0);
  const [section2Max, setSection2Max] = useState(0);
  const [finalColumns, setFinalColumns] = useState<FinalColumn[]>([]);

  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  // Пример данных
  const groups: Group[] = [
    { id: 1, name: "Группа A" },
    { id: 2, name: "Группа B" },
    { id: 3, name: "Группа C" },
  ];

  const allStudents: Student[] = [
    { id: 1, name: "Иванов Иван", groupId: 1 },
    { id: 2, name: "Петров Петр", groupId: 1 },
    { id: 3, name: "Сидоров Сидор", groupId: 2 },
    { id: 4, name: "Алексеев Алексей", groupId: 2 },
    { id: 5, name: "Кузнецова Мария", groupId: 3 },
  ];

  const students = allStudents.filter(st => selectedGroups.includes(st.groupId));

  const totalMax =
    section1Max +
    section2Max +
    finalColumns.reduce((sum, col) => sum + col.maxPoints, 0);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Создание ведомости</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Название курса:{" "}
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Введите название"
            style={{ width: "300px" }}
          />
        </label>
      </div>

      <GroupSelector
        groups={groups}
        selectedGroups={selectedGroups}
        setSelectedGroups={setSelectedGroups}
      />

      <SectionSetup
        sectionName="Раздел 1"
        lessons={section1Lessons}
        setLessons={setSection1Lessons}
        maxPoints={section1Max}
        setMaxPoints={setSection1Max}
      />

      <SectionSetup
        sectionName="Раздел 2"
        lessons={section2Lessons}
        setLessons={setSection2Lessons}
        maxPoints={section2Max}
        setMaxPoints={setSection2Max}
      />

      <FinalSectionSetup
        finalColumns={finalColumns}
        setFinalColumns={setFinalColumns}
      />

      <p>
        <strong>Общая сумма баллов:</strong> {totalMax} / 100
        {totalMax !== 100 && (
          <span style={{ color: "red", marginLeft: "10px" }}>
            ⚠ Должно быть ровно 100!
          </span>
        )}
      </p>

      <GradeTable
        courseName={courseName}
        students={students}
        section1Lessons={section1Lessons}
        section2Lessons={section2Lessons}
        finalColumns={finalColumns}
      />
    </div>
  );
};

export default GradesheetCreation;
