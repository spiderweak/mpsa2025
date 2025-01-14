// src/algorithms/condorcetCycle.js
export function detectCondorcetCycles(pairwiseScores, columns) {
  const candidates = columns.map(col => col.id); // Use candidate IDs
  const idToName = Object.fromEntries(columns.map(col => [col.id, col.name])); // Map IDs to names
  const cycles = [];

  // Helper function for DFS
  function dfs(currentPath, visited) {
    const current = currentPath[currentPath.length - 1];
    const startCandidate = currentPath[0];

    for (let next of candidates) {
      // console.log(`Checking edge from ${idToName[current]} to ${idToName[next]}`);

      // If revisiting the start node and forming a valid cycle
      if (next === startCandidate && currentPath.length > 2) {
        const finalEdgeScore = pairwiseScores[current][startCandidate];
        //console.log(`Final edge from ${idToName[current]} to ${idToName[startCandidate]} has score: ${finalEdgeScore}`);
        if (finalEdgeScore > 0) { // Ensure the last edge is valid
          //console.log(`Cycle confirmed: ${[...currentPath, next].map(id => idToName[id]).join(" > ")}`);
          cycles.push([...currentPath, next]);
        } else {
          //console.log(`Cycle rejected due to invalid final edge`);
        }
        continue;
      }

      // Skip self-loops and invalid edges
      if (current === next || (visited.has(next) && next !== startCandidate)) {
        //console.log(`Skipping ${idToName[next]} (self-loop or already visited non-start node)`);
        continue;
      }

      // Check pairwise score
      if (pairwiseScores[current][next] > 0) {
        //console.log(`Valid edge from ${idToName[current]} to ${idToName[next]} with score: ${pairwiseScores[current][next]}`);
        visited.add(next);
        dfs([...currentPath, next], visited);
        visited.delete(next); // Backtrack
      }
    }
  }

  // Start DFS from every candidate
  for (let candidate of candidates) {
    dfs([candidate], new Set([candidate]));
  }

  // Convert cycles from IDs to names
  return cycles.map(cycle => cycle.map(id => idToName[id]));
}
