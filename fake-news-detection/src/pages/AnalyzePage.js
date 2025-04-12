import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AnalyzePage.css';

const API = 'http://localhost:5000';

function AnalyzePage({ token }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const analyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/analyze`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyze-page">
      {/* Background Dots */}
      <div className="animated-bg">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="dot"></span>
        ))}
      </div>

      <div className="analyze-container">
        <h1>Fake News Analyzer</h1>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the news article here..."
        />
        <button onClick={analyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {loading && <div className="loading-spinner"></div>}

        {result && (
          <div className="result-box">
            <p>
              <strong>Result:</strong>{" "}
              <span className={result.label === 'Real News' ? 'real' : 'fake'}>
                {result.label}
              </span>
            </p>
            <h3>Sources:</h3>
            <ul>
              {result.search_results.map((r, i) => (
                <li key={i}>
                  <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={() => navigate('/history')} style={{ marginTop: '10px' }}>
  View History
</button>

      </div>
    </div>
  );
}

export default AnalyzePage;
