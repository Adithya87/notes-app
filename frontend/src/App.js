import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotesPage from './NotesPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  return (
    <Router>
      <div className={dark ? 'dark' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage setToken={setToken} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/notes" element={token ? <NotesPage token={token} setToken={setToken} dark={dark} setDark={setDark} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={token ? "/notes" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
