import React from 'react';
import styles from "./table.module.css"

const Table = ({ matrix, rowLabels, columnLabels, tableCl }) => {
  return (
    <table className={`${styles.table} ${tableCl}`}>
      <thead className={styles.head}>
        <tr>
          <th className={styles.th}></th>
          {columnLabels.map((label, index) => (
            <th key={index} className={styles.th}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <th className={styles.th}>{rowLabels[rowIndex]}</th>
            {row.map((value, colIndex) => (
              <td key={colIndex} className={styles.td}>
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
