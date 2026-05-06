import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Deposit from './pages/Deposit';
import Support from './pages/Support';
import SendMessage from './pages/SendMessage';
import Notifications from './pages/Notifications';
import Admins from './pages/Admins';

export const API = axios.create({
  baseURL: 'https://habeshaxnode-9821a8586656.herokuapp.com/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const App: React.FC = () => {
  const [auth, setAuth] = useState(false);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') || '';
    if (token) {
      setAuth(true);
      setRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuth(false);
    setRole('');
  };

  return (
    <Router>
      <Routes>
        {!auth ? (
          <Route path="*" element={<Login setAuth={setAuth} setRole={setRole} api={API} />} />
        ) : (
          <Route element={<Layout onLogout={handleLogout} role={role} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/support" element={<Support />} />
            <Route path="/sendm" element={<SendMessage />} />
            <Route path="/notifications" element={<Notifications />} />
            {role === 'super_admin' && <Route path="/admins" element={<Admins />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
