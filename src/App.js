import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [rows, setRows] = useState([
    { A: '1', B: '2', C: '3' },
    { A: '4', B: '5', C: '6' },
    { A: '7', B: '8', C: '9' },
  ]);
  const [medians, setMedians] = useState({});

  useEffect(() => {
    calculateMedians();
  }, [rows]);

  const calculateMedians = () => {
    const columnCount = Object.keys(rows[0]).length;
    const columnPairs = getUniqueColumnPairs();

    const columnMedians = {};

    columnPairs.forEach(([columnNameA, columnNameB]) => {
      const columnValuesA = rows
        .map((row) => row[columnNameA])
        .filter((value) => value !== '')
        .map(Number);

      const columnValuesB = rows
        .map((row) => row[columnNameB])
        .filter((value) => value !== '')
        .map(Number);

      if (columnValuesA.length !== columnValuesB.length) {
        columnMedians[`${columnNameA}-${columnNameB}`] = '';
        return;
      }

      const columnDifferences = [];
      for (let j = 0; j < columnValuesA.length; j++) {
        columnDifferences.push(Math.abs(columnValuesA[j] - columnValuesB[j]));
      }

      columnDifferences.sort((a, b) => a - b);

      const medianIndex = Math.floor(columnDifferences.length / 2);
      const medianValue =
        columnDifferences.length % 2 === 0
          ? (columnDifferences[medianIndex - 1] + columnDifferences[medianIndex]) / 2
          : columnDifferences[medianIndex];

      columnMedians[`${columnNameA}-${columnNameB}`] = medianValue;
    });

    setMedians(columnMedians);
  };

  const getUniqueColumnPairs = () => {
    const columnNames = Object.keys(rows[0]);
    const columnPairs = [];

    for (let i = 0; i < columnNames.length; i++) {
      for (let j = i + 1; j < columnNames.length; j++) {
        columnPairs.push([columnNames[i], columnNames[j]]);
      }
    }

    return columnPairs;
  };

  const handleChange = (value, rowIndex, columnName) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnName] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { A: '', B: '', C: '' }]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <table>
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              <th>C</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.keys(row).map((columnName) => (
                  <td key={columnName}>
                    <input
                      type="text"
                      value={row[columnName]}
                      onChange={(e) =>
                        handleChange(e.target.value, rowIndex, columnName)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <table style={{ marginLeft: '20px' }}>
          <thead>
            <tr>
              <th>Column Pair</th>
              {Object.entries(medians).map(([columnPair, medianValue]) => (
                <th key={columnPair}>{columnPair}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>M0 Values</td>
              {Object.entries(medians).map(([columnPair, medianValue]) => (
                <td key={columnPair}>{medianValue}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={addRow}>Add Row</button>
    </header>
  </div>
  );
}

export default App;