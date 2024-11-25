// src/algorithms/pairwiseComparison.js

export function calculatePairwiseMedians(rows, columns) {
  const pairwiseScores = {};

  // Filter out the "Coefficient" column
  const filteredColumns = columns.filter(column => column.name !== 'Coefficient');

  // Initialize pairwiseScores object
  filteredColumns.forEach(candidateA => {
    pairwiseScores[candidateA.id] = {};
    filteredColumns.forEach(candidateB => {
      if (candidateA.id !== candidateB.id) {
        pairwiseScores[candidateA.id][candidateB.id] = [];
      }
    });
  });

  // Calculate pairwise differences and replicate by coefficient
  rows.forEach(row => {
    const coefficient = parseInt(row.Coefficient, 10) || 1; // Number of bulletins
    filteredColumns.forEach(candidateA => {
      filteredColumns.forEach(candidateB => {
        if (candidateA.id !== candidateB.id) {
          const valueA = row[candidateA.id];
          const valueB = row[candidateB.id];
          if (
            valueA !== undefined &&
            valueB !== undefined &&
            valueA !== '' &&
            valueB !== ''
          ) {
            const diff = valueA - valueB;
            if (!isNaN(diff)) {
              const weightedDiffs = Array(coefficient).fill(diff); // Replicate difference by coefficient
              pairwiseScores[candidateA.id][candidateB.id].push(...weightedDiffs);
            }
          }
        }
      });
    });
  });

  // Compute medians for each pair
  Object.keys(pairwiseScores).forEach(candidateA => {
    Object.keys(pairwiseScores[candidateA]).forEach(candidateB => {
      const diffs = pairwiseScores[candidateA][candidateB].sort((a, b) => a - b);
      const medianIndex = Math.floor(diffs.length / 2);
      pairwiseScores[candidateA][candidateB] =
        diffs.length % 2 === 0
          ? (diffs[medianIndex - 1] + diffs[medianIndex]) / 2
          : diffs[medianIndex];
    });
  });

  return pairwiseScores;
}
