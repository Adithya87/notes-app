import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      setToken(res.data.token);
      navigate('/notes');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <div style={{ marginBottom: '1rem', color: '#2563eb', fontWeight: 'bold' }}>
        Demo credentials: <br />
        Username: <span style={{ fontFamily: 'monospace' }}>temp</span> <br />
        Password: <span style={{ fontFamily: 'monospace' }}>temp</span>
      </div>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      {error && <div className="error">{error}</div>}
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default LoginPage;
