import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import InputTable from './components/InputTable';
import ResultsTable from './components/ResultsTable';
import CondorcetGraph from './components/CondorcetGraph';
import { calculatePairwiseMedians } from './algorithms/pairwiseComparison';
import { detectCondorcetCycle } from './algorithms/condorcetCycle';
import { calculateMedians } from './algorithms/medianCalculation';
import './App.css';

function App() {
  const [rows, setRows] = useState([{ A: '', B: '', C: '' }]);
  const [columns, setColumns] = useState(['A', 'B', 'C']);
  const [medians, setMedians] = useState({});
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

  const handleChange = (value, rowIndex, columnName) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[rowIndex][columnName] = value;
      return updatedRows;
    });
  };

  const handleImport = (importedRows) => {
    setRows(importedRows);
  };

  const handleColumnsChange = (newColumns) => {
    setColumns(newColumns);
  };

  const addRow = () => {
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
    setRows([...rows, newRow]);
  };

  const addColumn = () => {
    const newColumnName = `Column${columns.length + 1}`;
    setColumns([...columns, newColumnName]);
    setRows(prevRows =>
      prevRows.map(row => ({ ...row, [newColumnName]: '' }))
    );
  };

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

  const handleDeleteRow = (rowIndex) => {
    setRows(prevRows => prevRows.filter((_, index) => index !== rowIndex));
  };

  const handleDeleteColumn = (columnIndex) => {
    const columnName = columns[columnIndex];
    setColumns(prevColumns => prevColumns.filter((_, index) => index !== columnIndex));
    setRows(prevRows =>
      prevRows.map(row => {
        const updatedRow = { ...row };
        delete updatedRow[columnName];
        return updatedRow;
      })
    );
  };

  const onExport = () => {
    const csv = Papa.unparse(rows, { columns });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table_data.csv';
    link.click();
  };

  useEffect(() => {
    const newPairwiseScores = calculatePairwiseMedians(rows, columns);
    setPairwiseScores(newPairwiseScores);

    const newMedians = calculateMedians(rows, columns);
    setMedians(newMedians);

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
          />
        </div>

        {/* Flex container for ResultsTable and CondorcetGraph */}
        <div className="results-graph-container">
          <div>
            <ResultsTable pairwiseScores={pairwiseScores} />
            <div className="export-buttons">
              <button onClick={exportSVGAsImage} className="btn btn-primary">Export Graph as PNG</button>
              <button onClick={exportResultsTableAsCSV} className="btn btn-secondary">Export Results as CSV</button>
            </div>
          </div>  
          <CondorcetGraph ref={graphRef} medians={medians} columns={columns} />
        </div>

        {/* Export Buttons */}
        
      </div>
    </div>
  );
}

export default App;
