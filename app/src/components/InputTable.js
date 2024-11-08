import React from 'react';
import Papa from 'papaparse';

function InputTable({ rows, columns, onChange, onImport, onColumnsChange, onColumnNameChange, onDeleteRow, onDeleteColumn, onAddRow, onAddColumn, onExport }) {

  const handleCellChange = (e, rowIndex, columnName) => {
    const value = e.target.value;
    onChange(value, rowIndex, columnName);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const csvColumns = Object.keys(result.data[0]).filter(col => col);
          const data = result.data.map(row => {
            const newRow = {};
            csvColumns.forEach(column => {
              newRow[column] = row[column] || '';
            });
            return newRow;
          });
          
          onColumnsChange(csvColumns);
          onImport(data);
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
        }
      });
    }
  };

  const handleHeaderChange = (e, index) => {
    const newColumnName = e.target.value;
    onColumnNameChange(newColumnName, index);
  };
  
  return (
    <div className="table-section">
      {/* Container for Import and Export buttons */}
      <div className="table-controls">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="btn btn-secondary me-2"
        />
        <button onClick={onExport} className="btn btn-secondary">Export</button>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered mt-2">
          <thead>
            <tr>
              <th>Candidate</th>
              {columns.map((column, index) => (
                <th key={index}>
                  <input
                    type="text"
                    value={column}
                    onChange={(e) => handleHeaderChange(e, index)}
                    className="form-control"
                  />
                </th>
              ))}
              <th className="centered-cell no-border-cell">
                <button className="add-button" onClick={onAddColumn}>+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="description-cell">
                  {`Vote #${rowIndex + 1}`}
                </td>
                {columns.map((column) => (
                  <td key={column}>
                    <input
                      type="text"
                      value={row[column] || ''}
                      onChange={(e) => handleCellChange(e, rowIndex, column)}
                      className="form-control"
                    />
                  </td>
                ))}
                <td className="centered-cell no-border-cell">
                  <button className="delete-button" onClick={() => onDeleteRow(rowIndex)}>-</button>
                </td>
              </tr>
            ))}
            <tr>
              <td className="centered-cell no-border-cell">
                <button className="add-button" onClick={onAddRow}>+</button>
              </td>
              {columns.map((_, index) => (
                <td key={index} className="centered-cell no-border-cell">
                  <button className="delete-button" onClick={() => onDeleteColumn(index)}>-</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InputTable;
