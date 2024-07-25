// utils.js

export const getUniqueColumnPairs = (rows) => {
    if (!rows || !rows[0]) {
      return [];
    }
    const columnNames = Object.keys(rows[0]);
    const columnPairs = [];
  
    for (let i = 0; i < columnNames.length; i++) {
      for (let j = i + 1; j < columnNames.length; j++) {
        columnPairs.push([columnNames[i], columnNames[j]]);
      }
    }
  
    return columnPairs;
  };
  
  const calculateDifferences = (valuesA, valuesB) => {
    return valuesA.map((value, index) => Math.abs(value - valuesB[index]));
  };
  
  const calculateMedian = (values) => {
    if (values.length === 0) return undefined;
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0 ? values[mid] : (values[mid] + values[mid + 1]) / 2;
  };
  
  export const calculateMedians = (rows) => {
    const columnPairs = getUniqueColumnPairs(rows);
  
    const columnMedians = {};
  
    columnPairs.forEach(([colA, colB]) => {
      const valuesA = rows.map(row => Number(row[colA])).filter(val => !isNaN(val));
      const valuesB = rows.map(row => Number(row[colB])).filter(val => !isNaN(val));
  
      if (valuesA.length !== valuesB.length || valuesA.length === 0 || valuesB.length === 0) {
        columnMedians[`${colA}-${colB}`] = undefined;
        return;
      }
  
      const differences = calculateDifferences(valuesA, valuesB);
      const median = calculateMedian(differences);
  
      columnMedians[`${colA}-${colB}`] = median;
    });
  
    return columnMedians;
  };
  