import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { InputTable } from './InputTable';
import { calculateMedians, getUniqueColumnPairs } from './utils';
import logo from './logo.svg';

const initialState = [
    { A: '1', B: '2', C: '3' },
    { A: '4', B: '5', C: '6' },
    { A: '7', B: '8', C: '9' },
];

function App() {
  const [rows, setRows] = useState(initialState);
  const [medians, setMedians] = useState({});
  const svgRef = useRef(null);

  const handleChange = (value, rowIndex, columnName) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows];
      updatedRows[rowIndex][columnName] = value;
      return updatedRows;
    });
  };

  const addRow = () => {
    setRows(prevRows => [...prevRows, { A: '', B: '', C: '' }]);
  };

  const createCircles = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear previous circles and labels to avoid duplication
    Array.from(svg.children).forEach(child => {
      if (child.tagName === 'circle' || child.tagName === 'text') {
        svg.removeChild(child);
      }
    });

    // Define markers for arrowheads
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    arrowMarker.setAttribute('id', 'arrowhead');
    arrowMarker.setAttribute('viewBox', '0 0 10 10');
    arrowMarker.setAttribute('refX', '10');
    arrowMarker.setAttribute('refY', '5');
    arrowMarker.setAttribute('markerWidth', '6');
    arrowMarker.setAttribute('markerHeight', '6');
    arrowMarker.setAttribute('orient', 'auto-start-reverse');

    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 Z');
    arrowPath.setAttribute('fill', 'green');
    arrowMarker.appendChild(arrowPath);

    defs.appendChild(arrowMarker);
    svg.appendChild(defs);

    const base = 200; // Base of the isosceles triangle
    const height = 150; // Height of the isosceles triangle
    const cx = 150; // Center x-coordinate
    const cy = 100; // Center y-coordinate

    const circles = [
      { id: 'node-A', label: 'A', cx, cy: cy - height / 2 }, // Top vertex
      { id: 'node-B', label: 'B', cx: cx - base / 2, cy: cy + height / 2 }, // Bottom-left vertex
      { id: 'node-C', label: 'C', cx: cx + base / 2, cy: cy + height / 2 } // Bottom-right vertex
    ];

    circles.forEach(({ id, label, cx, cy }) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('id', id);
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', 4);
      svg.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx + 5);
      text.setAttribute('y', cy - 5);
      text.textContent = label;
      svg.appendChild(text);
    });
  }, []);

  const drawArrows = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) {
      console.error('SVG reference is null');
      return;
    }
  
    // Clear the entire SVG content to avoid duplication
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  
    // Redefine markers for arrowheads
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    arrowMarker.setAttribute('id', 'arrowhead');
    arrowMarker.setAttribute('viewBox', '0 0 10 10');
    arrowMarker.setAttribute('refX', '10');
    arrowMarker.setAttribute('refY', '5');
    arrowMarker.setAttribute('markerWidth', '6');
    arrowMarker.setAttribute('markerHeight', '6');
    arrowMarker.setAttribute('orient', 'auto-start-reverse');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 Z');
    arrowPath.setAttribute('fill', 'green');
    arrowMarker.appendChild(arrowPath);
    defs.appendChild(arrowMarker);
    svg.appendChild(defs);
  
    // Draw circles again to ensure they're present
    createCircles();
  
    const columnPairs = getUniqueColumnPairs(rows);
    columnPairs.forEach(([columnNameA, columnNameB]) => {
      const medianValue = medians[`${columnNameA}-${columnNameB}`];
      console.log(`Median for ${columnNameA}-${columnNameB}:`, medianValue);
  
      const nodeA = document.getElementById(`node-${columnNameA}`);
      const nodeB = document.getElementById(`node-${columnNameB}`);
  
      if (!nodeA || !nodeB) {
        console.error(`Nodes not found for ${columnNameA} or ${columnNameB}`);
        return;
      }
  
      if (medianValue === undefined || medianValue === '') {
        console.error(`Median value is empty or undefined for ${columnNameA}-${columnNameB}`);
        return;
      }
  
      const arrowGap = 10; // Gap between arrow end and circle
  
      const x1 = parseFloat(nodeA.getAttribute('cx'));
      const y1 = parseFloat(nodeA.getAttribute('cy'));
      const x2 = parseFloat(nodeB.getAttribute('cx'));
      const y2 = parseFloat(nodeB.getAttribute('cy'));
  
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const ratio = arrowGap / length;
  
      const newX2 = x1 + dx * (1 - ratio);
      const newY2 = y1 + dy * (1 - ratio);
  
      const newX1 = x1 + dx * ratio;
      const newY1 = y1 + dy * ratio;
  
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      arrow.setAttribute('x1', newX1);
      arrow.setAttribute('y1', newY1);
      arrow.setAttribute('x2', newX2);
      arrow.setAttribute('y2', newY2);
      arrow.setAttribute('stroke', medianValue > 0 ? 'green' : 'red');
      arrow.setAttribute('stroke-width', '2'); // Increase arrow size
      arrow.setAttribute('marker-end', 'url(#arrowhead)');
      svg.appendChild(arrow);
  
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (newX1 + newX2) / 2);
      text.setAttribute('y', (newY1 + newY2) / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('alignment-baseline', 'middle');
      text.textContent = medianValue.toString();
      svg.appendChild(text);
    });
  }, [medians, rows, createCircles]);
  
  useEffect(() => {
    const newMedians = calculateMedians(rows);
    setMedians(newMedians);
  }, [rows]);
  
  useEffect(() => {
    drawArrows();
  }, [drawArrows]);
  

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="App-content">
        <div className="table-container">
          <InputTable rows={rows} columns={['A', 'B', 'C']} onChange={handleChange} />
          <button onClick={addRow}>Add Row</button>
        </div>
        <div className="table-container">
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
        <div className="svg-wrapper">
          <div className="svg-container">
            <svg ref={svgRef} style={{paddingTop: '10px', width: '100%', height: '220px', backgroundColor: 'white' }}></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
