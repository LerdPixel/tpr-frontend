import React from "react";

interface Props {
  sectionName: string;
  lessons: number;
  setLessons: (n: number) => void;
  maxPoints: number;
  setMaxPoints: (n: number) => void;
}

const SectionSetup: React.FC<Props> = ({ sectionName, lessons, setLessons, maxPoints, setMaxPoints }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>{sectionName}</h2>
      <label>
        Количество занятий:{" "}
        <input
          type="number"
          value={lessons}
          onChange={(e) => setLessons(Number(e.target.value))}
          min={0}
        />
      </label>
      <br />
      <label>
        Максимальные баллы за раздел:{" "}
        <input
          type="number"
          value={maxPoints}
          onChange={(e) => setMaxPoints(Number(e.target.value))}
          min={0}
        />
      </label>
    </div>
  );
};

export default SectionSetup;
