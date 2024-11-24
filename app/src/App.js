import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import InputTable from './components/InputTable';
import ResultsTable from './components/ResultsTable';
import CondorcetGraph from './components/CondorcetGraph';
import { calculatePairwiseMedians } from './algorithms/pairwiseComparison';
import { detectCondorcetCycle } from './algorithms/condorcetCycle';
import './App.css';

function App() {
  const [rows, setRows] = useState([{ Coefficient: 1, A: '', B: '', C: '' }]);
  const [columns, setColumns] = useState([
    { id: 'col-1', name: 'A' },
    { id: 'col-2', name: 'B' },
    { id: 'col-3', name: 'C' },
  ]);
  const [pairwiseScores, setPairwiseScores] = useState({});
  const [cycle, setCycle] = useState([]);
  
  const graphRef = useRef();

  const exportSVGAsImage = () => {
    if (graphRef.current) {
      graphRef.current.exportAsImage();
    }
  };

  const exportResultsTableAsCSV = () => {
    const headers = ['Candidate', ...columns];
    const data = Object.entries(pairwiseScores).map(([candidate, scores]) => {
      return [candidate, ...columns.map(col => scores[col] || 0)];
    });
    const csvData = [headers, ...data];
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'results_table.csv';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
  };

  const handleChange = (value, rowIndex, columnId) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[rowIndex][columnId] = value;
      return updatedRows;
    });
  };
  

  const handleImport = (importedRows) => {
    // Exclude the "Coefficient" column from dynamically created columns
    const newColumns = Object.keys(importedRows[0])
      .filter((col) => col !== "Coefficient")
      .map((col, index) => ({
        id: `col-${index + 1}`,
        name: col,
      }));
  
    // Format rows to separate "Coefficient" and dynamic columns
    const formattedRows = importedRows.map((row) => {
      const newRow = {
        Coefficient: parseFloat(row.Coefficient) || 1, // Explicitly handle "Coefficient"
      };
      newColumns.forEach(({ id, name }) => {
        newRow[id] = row[name] || '';
      });
      return newRow;
    });
  
    // Update the state with new columns and rows
    setColumns(newColumns); // Exclude "Coefficient"
    setRows(formattedRows); // Include "Coefficient" as a fixed property
  };
  
  
  const handleColumnsChange = (newColumns) => {
    setColumns(newColumns);
  };

  const handleCoefficientChange = (value, rowIndex) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[rowIndex].Coefficient = parseFloat(value) || 1;
      return updatedRows;
    });
  };


  const addRow = () => {
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
    setRows([...rows, newRow]);
  };

  const addColumn = () => {
    const newColumn = {
      id: `col-${Date.now()}`,
      name: `Column${columns.length + 1}`,
    };
    setColumns([...columns, newColumn]);
    setRows(prevRows =>
      prevRows.map(row => ({ ...row, [newColumn.id]: '' }))
    );
  };

  const handleColumnNameChange = (newName, index) => {
    const columnId = columns[index].id;
  
    setColumns(prevColumns => {
      const updatedColumns = [...prevColumns];
      updatedColumns[index] = { ...updatedColumns[index], name: newName }; // Update name, keep ID
      return updatedColumns;
    });
  
    setRows(prevRows =>
      prevRows.map(row => ({
        ...row,
        [columnId]: row[columnId], // Maintain data mapping to column ID
      }))
    );
  };
  
  /*
  const handleColumnNameChange = (newName, index) => {
    const oldName = columns[index];
    const updatedColumns = [...columns];
    updatedColumns[index] = newName;
    setColumns(updatedColumns);

    setRows(prevRows =>
      prevRows.map(row => {
        const updatedRow = { ...row, [newName]: row[oldName] };
        delete updatedRow[oldName];
        return updatedRow;
      })
    );
  };
  */

  const handleDeleteRow = (rowIndex) => {
    setRows(prevRows => prevRows.filter((_, index) => index !== rowIndex));
  };

  const handleDeleteColumn = (columnIndex) => {
    const columnId = columns[columnIndex].id;
    setColumns(prevColumns => prevColumns.filter((_, index) => index !== columnIndex));
    setRows(prevRows =>
      prevRows.map(row => {
        const updatedRow = { ...row };
        delete updatedRow[columnId];
        return updatedRow;
      })
    );
  };

  const onExport = () => {
    const csvRows = rows.map(row => {
      const formattedRow = {};
      columns.forEach(({ id, name }) => {
        formattedRow[name] = row[id];
      });
      return formattedRow;
    });
    const csv = Papa.unparse(csvRows, { columns: columns.map(col => col.name) });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table_data.csv';
    link.click();
  };
  


  useEffect(() => {
    const newPairwiseScores = calculatePairwiseMedians(rows, columns);
    setPairwiseScores(newPairwiseScores);

    const detectedCycle = detectCondorcetCycle(newPairwiseScores, columns);
    setCycle(detectedCycle);
  }, [rows, columns]);

  return (
    <div className="App">
      <header className="App-header">
        <h1> Why break condorcet cycle when we can make them disappear ? </h1>
      </header>
      <div className="App-content">
        <div className="table-container">
          <InputTable
            rows={rows}
            columns={columns}
            onChange={handleChange}
            onImport={handleImport}
            onColumnsChange={handleColumnsChange}
            onColumnNameChange={handleColumnNameChange}
            onDeleteRow={handleDeleteRow}
            onDeleteColumn={handleDeleteColumn}
            onAddRow={addRow}
            onAddColumn={addColumn}
            onExport={onExport}
            onCoefficientChange={handleCoefficientChange}
          />
        </div>

        {/* Flex container for ResultsTable and CondorcetGraph */}
        <div className="results-graph-container">
          <div>
            <ResultsTable columns={columns} pairwiseScores={pairwiseScores} />
            <div className="export-buttons">
              <button onClick={exportSVGAsImage} className="btn btn-primary">Export Graph as PNG</button>
              <button onClick={exportResultsTableAsCSV} className="btn btn-secondary">Export Results as CSV</button>
            </div>
          </div>  
          <CondorcetGraph ref={graphRef} pairwiseScores={pairwiseScores} columns={columns} />
        </div>

        {/* Export Buttons */}
      </div>
    </div>
  );
}

export default App;
