import React from 'react';
import Papa from 'papaparse';

function InputTable({ rows, columns, onChange, onImport, onColumnsChange, onColumnNameChange, onDeleteRow, onDeleteColumn, onAddRow, onAddColumn, onExport, onCoefficientChange }) {

  const handleCellChange = (e, rowIndex, columnId) => {
    const value = e.target.value;
    onChange(value, rowIndex, columnId);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          // Extract column names from the CSV, excluding "Coefficient"
          const csvColumns = Object.keys(result.data[0]).filter(col => col !== 'Coefficient');
          
          // Ensure "Coefficient" values are updated or defaulted
          const data = result.data.map(row => ({
            ...row,
            Coefficient: parseFloat(row.Coefficient) || 1,
          }));
  
          // Update the columns, excluding "Coefficient" as it is handled separately
          onColumnsChange(csvColumns);
  
          // Pass the parsed data to the import handler
          onImport(data);
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
        },
      });
    }
  };
  

  const handleHeaderChange = (e, index) => {
    const newColumnName = e.target.value;
    onColumnNameChange(newColumnName, index);
  };

  const handleCoefficientChange = (e, rowIndex) => {
    const value = parseFloat(e.target.value) || 0; // Ensure it's a valid number
    if (value < 0) {
      console.log("Coefficient cannot be negative."); // Optional user feedback
      onCoefficientChange(1, rowIndex);
    }
    onCoefficientChange(value, rowIndex);
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
              <th></th>
              <th>Coefficient</th>
              {columns.map((column, index) => (
                <th key={index}>
                  <input
                    type="text"
                    value={column.name}
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
                <td>
                  <input
                    type="number"
                    min="1"
                    value={row.Coefficient ?? 1}
                    onChange={(e) => handleCoefficientChange(e, rowIndex)}
                    className="form-control"
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.id}>
                    <input
                      type="text"
                      value={row[column.id] || ''}
                      onChange={(e) => handleCellChange(e, rowIndex, column.id)}
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
              <td></td>
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
