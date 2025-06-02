import React, { useState } from 'react';
import styles from "./table.module.css"


const AdvancedTable = ({ data, setData, columnLabels, uneditableCols = [], boolCols = [], tableCl }) => {
  const [editingCell, setEditingCell] = useState({ row: null, col: null });
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });

  const isBoolCol = (colIdx) => boolCols.includes(colIdx);
  const isEditableCol = (colIdx) => !uneditableCols.includes(colIdx) && !isBoolCol(colIdx);

  const handleCellClick = (rowIdx, colIdx) => {
    if (isBoolCol(colIdx)) {
      const updated = data.map((row, r) =>
        r === rowIdx ? row.map((cell, c) => (c === colIdx ? !cell : cell)) : row
      );
      setData(updated);
    } else if (isEditableCol(colIdx)) {
      setEditingCell({ row: rowIdx, col: colIdx });
    }
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

  const handleSort = (colIdx) => {
    const direction = sortConfig.column === colIdx && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const sortedData = [...data].sort((a, b) => {
      const aVal = a[colIdx];
      const bVal = b[colIdx];
      const aComp = isBoolCol(colIdx) ? aVal === true ? 1 : 0 : aVal;
      const bComp = isBoolCol(colIdx) ? bVal === true ? 1 : 0 : bVal;

      if (!isNaN(aComp) && !isNaN(bComp)) {
        return direction === 'asc' ? aComp - bComp : bComp - aComp;
      }
      return direction === 'asc'
        ? String(aComp).localeCompare(String(bComp))
        : String(bComp).localeCompare(String(aComp));
    });
    setData(sortedData);
    setSortConfig({ column: colIdx, direction });
  };

  return (
    <table className={`${styles.table} ${tableCl}`}>
      <thead className={styles.head}>
        <tr >
          {columnLabels.map((label, colIdx) => (
            <th className={styles.th} key={colIdx} onClick={() => handleSort(colIdx)} style={{ cursor: 'pointer' }}>
              {label}
              {sortConfig.column === colIdx && (sortConfig.direction === 'asc' ? '  ↑' : ' ↓')}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, colIdx) => {
              const isEditing = editingCell.row === rowIdx && editingCell.col === colIdx;

              return (
                <td className={styles.td} key={colIdx} onClick={() => handleCellClick(rowIdx, colIdx)} style={{ cursor: isEditableCol(colIdx) || isBoolCol(colIdx) ? 'pointer' : 'default' }}>
                  {isBoolCol(colIdx) ? (
                    cell ? '' : 'н'
                  ) : isEditing ? (
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
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdvancedTable;
