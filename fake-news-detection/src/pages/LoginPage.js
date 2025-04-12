import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const API = 'http://localhost:5000';

function LoginPage({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      setToken(res.data.access_token);
      navigate('/analyze');
    } catch {
      alert('Login failed');
    }
  };

  const signup = async () => {
    try {
      await axios.post(`${API}/signup`, { username, password });
      alert('Signup successful! Now login.');
    } catch {
      alert('Signup failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Login or Signup to continue</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="login-input slide-in"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input slide-in"
        />
        <div className="login-buttons">
          <button onClick={login} className="btn login-btn glow">Login</button>
          <button onClick={signup} className="btn signup-btn glow">Signup</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
