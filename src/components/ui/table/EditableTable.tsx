import React, { useState } from 'react'
import cl from "./table.module.css"

const EditableTable = ({ data, setData }) => {
  const [editingCell, setEditingCell] = useState({ row: null, col: null });

  const handleCellClick = (rowIdx, colIdx) => {
    setEditingCell({ row: rowIdx, col: colIdx });
  };

  const handleChange = (e, rowIdx, colIdx) => {
    const updated = data.map((row, r) =>
      row.map((cell, c) => (r === rowIdx && c === colIdx ? e.target.value : cell))
    );
    setData(updated);
  };

  const handleBlur = () => {
    setEditingCell({ row: null, col: null });
  };

  return (
    <table border="1">
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, colIdx) => (
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