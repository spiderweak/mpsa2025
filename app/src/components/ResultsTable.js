import React from 'react';

function ResultsTable({ columns, pairwiseScores }) {
  if (!pairwiseScores || Object.keys(pairwiseScores).length === 0) {
    return <div>No pairwise scores available yet.</div>;
  }

  // Create a lookup map for id-to-name conversion
  const idToNameMap = Object.fromEntries(columns.map(column => [column.id, column.name]));

  // Filter out the "Coefficient" column
  const filteredColumns = columns.filter(column => column.name !== 'Coefficient');

  return (
    <div className="table-container">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Candidate</th>
            {filteredColumns.map(column => (
              <th key={column.id}>{column.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(pairwiseScores).map(([candidateId, scores]) => (
            <tr key={candidateId}>
              <td>{idToNameMap[candidateId]}</td> {/* Convert id to name */}
              {filteredColumns.map(column => {
                const score = scores[column.id];
                const displayScore =
                  candidateId === column.id
                    ? '-' // Diagonal cell
                    : isNaN(score)
                    ? 'Empty' // Replace NaN with "Empty"
                    : score?.toFixed(2) || '0.00'; // Format score

                return (
                  <td
                    key={column.id}
                    className={`${
                      candidateId === column.id
                        ? 'bg-light'
                        : score > 0
                        ? 'text-success'
                        : score < 0
                        ? 'text-danger'
                        : 'text-muted'
                    }`}
                  >
                    {displayScore}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
