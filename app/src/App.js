import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import InputTable from './components/InputTable';
import ResultsTable from './components/ResultsTable';
import CondorcetGraph from './components/CondorcetGraph';
import { calculatePairwiseMedians } from './algorithms/pairwiseComparison';
import { detectCondorcetCycles } from './algorithms/condorcetCycle';
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
  const [selectedRankIndex, setSelectedRankIndex] = useState(1); // Default index: 1 -> (m1, m2)
  const [isExploring, setIsExploring] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const [isWarningExpanded, setIsWarningExpanded] = useState(false);

  const maxIterations = 1000;
  let iterationCount = 0;
  
  const graphRef = useRef();

  const handleRankChange = (direction) => {
    setSelectedRankIndex((prevIndex) =>
      direction === 'increment' ? prevIndex + 1 : Math.max(1, prevIndex - 1)
    );
  };

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
    const newRow = {
      Coefficient: 1,
      ...columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
    };
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
      formattedRow["Coefficient"] = row.Coefficient;
      columns.forEach(({ id, name }) => {
        formattedRow[name] = row[id];
      });
      return formattedRow;
    });
    const csv = Papa.unparse(csvRows, { columns: ["Coefficient", ...columns.map(col => col.name)] });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'table_data.csv';
    link.click();
  };

  const exploreRanks = () => {
    if (isExploring) {
      setIsExploring(false);
      return;
    }
    setIsExploring(true); // Disable controls
    let rankIndex = selectedRankIndex;
    
    const incrementRankAndCheck = () => {
      // Increment rank index
      rankIndex += 1;
  
      // Update state and compute new pairwise scores
      const rankPair = rankIndex % 2 === 1
        ? [rankIndex, rankIndex + 1]
        : [rankIndex + 1, rankIndex];
      const newPairwiseScores = calculatePairwiseMedians(rows, columns, rankPair);
  
      // Detect cycles and check scores
      const detectedCycles = detectCondorcetCycles(newPairwiseScores, columns);
      const hasZeroScore = Object.values(newPairwiseScores).some(candidateScores =>
        Object.values(candidateScores).some(score => score === 0)
      );
  
      // Update state for pairwiseScores, cycles, and rank index
      setPairwiseScores(newPairwiseScores);
      setCycle(detectedCycles);
      setSelectedRankIndex(rankIndex);
  
      // Update warning message
      if (detectedCycles.length > 0 || hasZeroScore) {
        if (detectedCycles.length > 0) {
          setWarningMessage(
            `Condorcet cycles detected: ${detectedCycles
              .map(cycle => cycle.join(' > '))
              .join(' | ')}`
          );
        } else {
          setWarningMessage(
            'A cycle has been detected in candidate evaluation with a pairwise score of zero.'
          );
        }
      } else {
        setWarningMessage('');
        setIsExploring(false);
      }
  
      // Stop when no cycles and no zero scores
      if (detectedCycles.length === 0 && !hasZeroScore) {
        setIsExploring(false);
        return;
      }


      iterationCount += 1;

      if (iterationCount >= maxIterations) {
        setIsExploring(false);
        setWarningMessage('Maximum iterations reached. Exploration stopped.');
        return;
      }

      setTimeout(incrementRankAndCheck, 50);
    };
  
    incrementRankAndCheck();
  };

  useEffect(() => {
    const rankPair = selectedRankIndex % 2 === 1
    ? [selectedRankIndex, selectedRankIndex + 1] // Odd: [n, n+1]
    : [selectedRankIndex + 1, selectedRankIndex]; // Even: [n+1, n]
    //console.log("Ranks:", rankPair);


    const newPairwiseScores = calculatePairwiseMedians(rows, columns, rankPair);
    setPairwiseScores(newPairwiseScores);
    //console.log("Pairwise Scores:", newPairwiseScores);


    const detectedCycles = detectCondorcetCycles(newPairwiseScores, columns);
    setCycle(detectedCycles);

    const hasZeroScore = Object.values(newPairwiseScores).some(candidateScores =>
      Object.values(candidateScores).some(score => score === 0)
    );

    if (detectedCycles.length > 0 || hasZeroScore) {
      if (detectedCycles.length > 0) {
        //console.log("Detected Cycles:", detectedCycles);
        setWarningMessage(
          `Condorcet cycles detected: ${detectedCycles
            .map(cycle => cycle.join(' > '))
            .join(' | ')}`
        );
      } else {
        //console.log("Detected Cycles:", detectedCycles);
        setWarningMessage('A cycle has been detected in candidate evaluation with a pairwise score of zero.');
      }
    } else {
      //console.log("Detected Cycles:", detectedCycles);
      setWarningMessage('');
    }


  }, [rows, columns, selectedRankIndex]);

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

      <div className="rank-selection">
        <button onClick={() => handleRankChange('decrement')}>&lt;</button>
        <span>Rank
          <input
            type="number"
            value={selectedRankIndex}
            disabled={isExploring}
            onChange={(e) => {
              const newIndex = parseInt(e.target.value, 10);
              if (!isNaN(newIndex)) {
                setSelectedRankIndex(newIndex);
              }
            }}
          /> :
          ({`m${selectedRankIndex},m${selectedRankIndex + 1}`})</span>
        <button onClick={() => handleRankChange('increment')}>&gt;</button>
        <button onClick={() => exploreRanks()}> Explore {isExploring && <div className="spinner"></div>} </button> 
      </div>

      {warningMessage && (
        <div className="warning-message">
          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isWarningExpanded
              ? warningMessage
              : warningMessage.split('|')[0] + '...'} {/* Show summary or full warning */}
            <button
              className="toggle-warning-button"
              onClick={() => setIsWarningExpanded(!isWarningExpanded)}
              aria-label={isWarningExpanded ? "Collapse warning" : "Expand warning"}
            >
              {isWarningExpanded ? '▲' : '▼'} {/* Toggle caret */}
            </button>
          </p>
        </div>
      )}



        {/* Flex container for ResultsTable and CondorcetGraph */}
        <div className="results-graph-container">
          <div>
            <ResultsTable
              columns={columns}
              pairwiseScores={pairwiseScores}
            />
            <div className="export-buttons">
              <button onClick={exportSVGAsImage} className="btn btn-primary">Export Graph as SVG</button>
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
