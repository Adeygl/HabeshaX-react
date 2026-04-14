import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import Support from './pages/Support';
import Login from './pages/Login';
import Order from "./pages/Orders"
import SendMessage from "./pages/SendMessage"
const API = axios.create({
  baseURL: 'https://habeshaxnode-9821a8586656.herokuapp.com/api'
});

const App: React.FC = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuth(true);
  }, []);

  return (
    <Router>
      <Routes>
        {auth ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/support" element={<Support />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/sendm" element={<SendMessage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route
            path="*"
            element={
              <Login setAuth={setAuth} api={API} />
            }
          />
        )}
      </Routes>
    </Router>
  );
};


export default App;