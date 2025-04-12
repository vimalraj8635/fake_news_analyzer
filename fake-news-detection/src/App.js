import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setToken={setToken} />} />
        <Route path="/analyze" element={token ? <AnalyzePage token={token} /> : <Navigate to="/" />} />
        <Route path="/history" element={token ? <HistoryPage token={token} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
