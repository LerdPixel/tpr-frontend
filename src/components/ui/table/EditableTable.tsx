import React, { useState } from "react";
import cl from "./table.module.css";

interface EditableTableProps {
  data: string[][];
  setData: (data: string[][]) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({ data, setData }) => {
  const [editingCell, setEditingCell] = useState({ row: null, col: null });

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    setEditingCell({ row: rowIdx, col: colIdx });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIdx: number,
    colIdx: number
  ) => {
    const updated = data.map((row, r: number) =>
      row.map((cell, c: number) =>
        r === rowIdx && c === colIdx ? e.target.value : cell
      )
    );
    setData(updated);
  };

  const handleBlur = () => {
    setEditingCell({ row: null, col: null });
  };

  return (
    <table border={1}>
      <tbody>
        {data.map((row, rowIdx: number) => (
          <tr key={rowIdx}>
            {row.map((cell, colIdx: number) => (
              <td key={colIdx} onClick={() => handleCellClick(rowIdx, colIdx)}>
                {editingCell.row === rowIdx && editingCell.col === colIdx ? (
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleChange(e, rowIdx, colIdx)}
                    onBlur={handleBlur}
                    autoFocus
                  />
                ) : (
                  cell
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EditableTable;
