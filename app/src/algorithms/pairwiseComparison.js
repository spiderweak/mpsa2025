// src/algorithms/pairwiseComparison.js

export function calculatePairwiseMedians(rows, columns) {
  const pairwiseScores = {};

  // Initialize pairwiseScores object
  columns.forEach(candidateA => {
    pairwiseScores[candidateA] = {};
    columns.forEach(candidateB => {
      if (candidateA !== candidateB) {
        pairwiseScores[candidateA][candidateB] = [];
      }
    });
  });

  // Calculate pairwise differences and collect values for each pair
  rows.forEach(row => {
    columns.forEach(candidateA => {
      columns.forEach(candidateB => {
        if (candidateA !== candidateB) {
          const diff = row[candidateA] - row[candidateB];
          pairwiseScores[candidateA][candidateB].push(diff);
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
