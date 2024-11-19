// src/algorithms/medianCalculation.js

export function calculateMedians(rows, columns) {
  const medians = {};

  // Filter out the "Coefficient" column from pairwise comparisons
  const filteredColumns = columns.filter(column => column.name !== 'Coefficient');

  filteredColumns.forEach((columnA, i) => {
    for (let j = i + 1; j < filteredColumns.length; j++) {
      const columnB = filteredColumns[j];

      // Compute pairwise differences and replicate by coefficient
      const pairwiseScores = rows.flatMap(row => {
        const coefficient = parseInt(row.Coefficient, 10) || 1; // Number of bulletins
        const difference = row[columnA.id] - row[columnB.id];
        return Array(coefficient).fill(difference); // Replicate the difference
      });

      // Sort pairwise scores to calculate median
      pairwiseScores.sort((a, b) => a - b);

      // Find the median
      const medianIndex = Math.floor(pairwiseScores.length / 2);
      medians[`${columnA.id}-${columnB.id}`] = pairwiseScores[medianIndex] || 0;
    }
  });

  return medians;
}
