import React, { useState } from "react";

export interface FinalColumn {
  id: number;
  name: string;
  maxPoints: number;
}

interface Props {
  finalColumns: FinalColumn[];
  setFinalColumns: (cols: FinalColumn[]) => void;
}

const FinalSectionSetup: React.FC<Props> = ({ finalColumns, setFinalColumns }) => {
  const [colName, setColName] = useState("");
  const [colMax, setColMax] = useState(0);

  const addColumn = () => {
    if (!colName.trim()) return;
    setFinalColumns([...finalColumns, { id: Date.now(), name: colName, maxPoints: colMax }]);
    setColName("");
    setColMax(0);
  };

  const updateColumn = (id: number, key: "name" | "maxPoints", value: string | number) => {
    setFinalColumns(finalColumns.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  const deleteColumn = (id: number) => {
    setFinalColumns(finalColumns.filter(c => c.id !== id));
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Итоговый раздел</h2>
      <div>
        <input
          placeholder="Название столбца"
          value={colName}
          onChange={(e) => setColName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Макс. баллы"
          value={colMax}
          onChange={(e) => setColMax(Number(e.target.value))}
        />
        <button onClick={addColumn}>Добавить</button>
      </div>
      <ul>
        {finalColumns.map(col => (
          <li key={col.id}>
            <input
              value={col.name}
              onChange={(e) => updateColumn(col.id, "name", e.target.value)}
            />
            <input
              type="number"
              value={col.maxPoints}
              onChange={(e) => updateColumn(col.id, "maxPoints", Number(e.target.value))}
            />
            <button onClick={() => deleteColumn(col.id)}>✖</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FinalSectionSetup;
