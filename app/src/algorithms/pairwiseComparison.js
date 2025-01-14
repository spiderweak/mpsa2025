// src/algorithms/pairwiseComparison.js

export function calculatePairwiseMedians(rows, columns, rankPair) {
  const [rankOdd, rankEven] = rankPair; // Destructure the rank pair
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

  // Compute averages for each pair based on slice around the middle
Object.keys(pairwiseScores).forEach(candidateA => {
  Object.keys(pairwiseScores[candidateA]).forEach(candidateB => {
    const diffs = pairwiseScores[candidateA][candidateB].sort((a, b) => a - b);
    const medianIndex = Math.floor(diffs.length / 2);
    
    let sliceStart, sliceEnd;

    if (diffs.length % 2 === 0) {
      // For even lengths, calculate the slice centered on the middle values
      sliceStart = medianIndex - 1 - Math.floor(rankEven / 2 - 1);
      sliceEnd = medianIndex + Math.floor(rankEven / 2  - 1 );
    } else {
      // For odd lengths, calculate the slice centered on the middle value
      sliceStart = medianIndex - Math.floor((rankOdd - 1) / 2);
      sliceEnd = medianIndex + Math.floor((rankOdd - 1) / 2);
    }

    // Ensure slice bounds are within array limits
    sliceStart = Math.max(sliceStart, 0);
    sliceEnd = Math.min(sliceEnd, diffs.length - 1);

    // Calculate the average of the slice
    const slice = diffs.slice(sliceStart, sliceEnd + 1);
    const average = slice.reduce((sum, value) => sum + value, 0) / slice.length;

    pairwiseScores[candidateA][candidateB] = average;
  });
});


  return pairwiseScores;
}
