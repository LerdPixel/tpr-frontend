import React from 'react';

const Table = ({ matrix, rowLabels, columnLabels }) => {
  return (
    <table className="table-auto border-collapse border border-gray-400">
      <thead>
        <tr>
          <th className="border border-gray-400 px-4 py-2"></th>
          {columnLabels.map((label, index) => (
            <th key={index} className="border border-gray-400 px-4 py-2">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <th className="border border-gray-400 px-4 py-2">
              {rowLabels[rowIndex]}
            </th>
            {row.map((value, colIndex) => (
              <td
                key={colIndex}
                className="border border-gray-400 px-4 py-2 text-center"
              >
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
