import React, { useState } from 'react';
import './Footer.css'; // You'll need to create this CSS file

const Footer = () => {
  const [expanded, setExpanded] = useState(false);

  const references = [
    {
      id: 1,
      title: "Why break Condorcet cycles when we can make them disappear?",
      authors: "Rouillon, Stephane Francis and Bernard, Antoine",
      year: "2023",
      journal: "80th Annual Midwest Political Science Association Conference 2023",
      url: "https://www.researchgate.net/publication/370167659_WHY_BREAK_CONDORCET_CYCLES_WHEN_WE_CAN_MAKE_THEM_DISAPPEAR",
    },
    {
      id: 2,
      title: "How to Make Condorcet Cycles Vanish and Obtain Grades without Combinatorial Exposure?",
      authors: "Rouillon, Stephane Francis and Bernard, Antoine",
      year: "2025",
      journal: "82th Annual Midwest Political Science Association Conference 2025"
    }
  ];

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <button 
          className="reference-toggle" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide References' : 'Show References'} {expanded ? '▲' : '▼'}
        </button>
        
        {expanded && (
          <div className="references-container">
            <h3>Research References</h3>
            <ul className="references-list">
              {references.map(ref => (
                <li key={ref.id} className="reference-item">
                  <span className="reference-authors">{ref.authors}</span> ({ref.year}). 
                  <span className="reference-title">"{ref.title}"</span>, 
                  <em className="reference-journal">{ref.journal}</em>. 
                  <a href={ref.url} target="_blank" rel="noopener noreferrer">
                    [Link]
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="copyright">
          © {new Date().getFullYear()} - Implementation of Condorcet Cycle Detection and Resolution
        </div>
      </div>
    </footer>
  );
};

export default Footer;