// src/algorithms/condorcetCycle.js

export function detectCondorcetCycles(pairwiseScores, columns) {
  const candidates = columns.map(col => col.id); // Use candidate IDs
  const idToName = Object.fromEntries(columns.map(col => [col.id, col.name])); // Map IDs to names
  const cycles = [];

  // Helper function for DFS
  function dfs(currentPath, visited, startCandidate) {
    const current = currentPath[currentPath.length - 1];

    for (let next of candidates) {
      // Skip self-loops and already visited nodes
      if (current === next || visited.has(next)) continue;

      // Check if the current candidate prefers `next`
      if (pairwiseScores[current][next] !== 0) {
        // If next forms a cycle back to the start
        if (next === startCandidate && currentPath.length > 2) {
          cycles.push([...currentPath, next]);
          continue;
        }

        // Recurse deeper
        visited.add(next);
        dfs([...currentPath, next], visited, startCandidate);
        visited.delete(next); // Backtrack
      }
    }
  }

  // Start DFS from every candidate
  for (let candidate of candidates) {
    dfs([candidate], new Set([candidate]), candidate);
  }

  // Convert cycles from IDs to names
  return cycles.map(cycle => cycle.map(id => idToName[id]));
}
