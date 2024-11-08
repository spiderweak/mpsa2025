// src/components/ResultsTable.js

import React from 'react';

function ResultsTable({ pairwiseScores }) {
  if (!pairwiseScores || Object.keys(pairwiseScores).length === 0) {
    return <div>No pairwise scores available yet.</div>;
  }

  return (
    <div className="table-container">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Candidate</th>
            {Object.keys(pairwiseScores).map((candidate) => (
              <th key={candidate}>{candidate}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(pairwiseScores).map(([candidateA, scores]) => (
            <tr key={candidateA}>
              <td>{candidateA}</td>
              {Object.keys(pairwiseScores).map((candidateB) => (
                <td 
                  key={candidateB}
                  className={`${
                    candidateA === candidateB
                      ? 'bg-light'
                      : scores[candidateB] > 0
                      ? 'text-success'
                      : scores[candidateB] < 0
                      ? 'text-danger'
                      : 'text-muted'
                  }`}
                >
                  {candidateA === candidateB ? '-' : scores[candidateB].toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
