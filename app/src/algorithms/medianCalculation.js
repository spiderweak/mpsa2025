// src/algorithms/medianCalculation.js

export function calculateMedians(rows, columns) {
  const medians = {};

  columns.forEach((columnA, i) => {
    for (let j = i + 1; j < columns.length; j++) {
      const columnB = columns[j];
      const pairwiseScores = rows.map(row => row[columnA] - row[columnB]);
      pairwiseScores.sort((a, b) => a - b);
      const medianIndex = Math.floor(pairwiseScores.length / 2);
      medians[`${columnA}-${columnB}`] = pairwiseScores[medianIndex] || 0;
    }
  });

  return medians;
}
