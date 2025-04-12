import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HistoryPage.css';

const API = 'http://localhost:5000';

function HistoryPage({ token }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setHistory(res.data));
  }, [token]);

  const filteredHistory = history.filter((item) => {
    const matchSearch = item.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'All' || item.result === filter;
    return matchSearch && matchFilter;
  });

  const exportToCSV = () => {
    const csvRows = [
      ['Query', 'Result'],
      ...history.map((item) => [item.query, item.result])
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'history.csv';
    a.click();
  };

  return (
    <div className="history-glass-container">
      <h2 className="history-title">🔍 Search History</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search query..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Real News">Real News</option>
          <option value="Fake News">Fake News</option>
        </select>

        <button className="export-btn" onClick={exportToCSV}>
          ⬇ Export CSV
        </button>
      </div>

      <div className="timeline">
        {filteredHistory.map((item, i) => (
          <div key={i} className="timeline-item">
            <div className={`timeline-dot ${item.result === 'Real News' ? 'real' : 'fake'}`}></div>
            <div className="timeline-content">
              <p className="query">{item.query}</p>
              <span className={`result ${item.result === 'Real News' ? 'real' : 'fake'}`}>
                {item.result}
              </span>
              <p className="timestamp">
      {new Date(item.timestamp).toLocaleString()}
    </p>
            </div>
          </div>
        ))}
      </div>

      <button className="back-button" onClick={() => navigate('/analyze')}>
        ← Back to Analyzer
      </button>
    </div>
  );
}

export default HistoryPage;
