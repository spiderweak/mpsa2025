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
    const columnMedians = {};

    for (let i = 0; i < columnCount; i++) {
      const columnValues = rows
      .map((row) => row[Object.keys(row)[i]])
      .filter((value) => value !== '');

      if (columnValues.length === 0) {
        columnMedians[Object.keys(rows[0])[i]] = '';
        continue;
      }

      columnValues.sort((a, b) => Number(a) - Number(b));

      const medianIndex = Math.floor(columnValues.length / 2);
      const medianValue =
        columnValues.length % 2 === 0
          ? (Number(columnValues[medianIndex - 1]) + Number(columnValues[medianIndex])) / 2
          : Number(columnValues[medianIndex]);

      columnMedians[Object.keys(rows[0])[i]] = medianValue;
    }

    setMedians(columnMedians);
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
              <th>Column</th>
              <th>Median</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(medians).map(([columnName, medianValue]) => (
              <tr key={columnName}>
                <td>{columnName}</td>
                <td>{medianValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow}>Add Row</button>
    </header>
  </div>
  );
}

export default App;