import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = axios.create({
  baseURL: 'https://habeshaxnode-9821a8586656.herokuapp.com/api',
});

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      setStats(res.data);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3">

      {/* TITLE */}
      <h1 className="text-lg font-bold mb-4 text-center">📊 Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-600 p-3 rounded-xl text-center">
          <p className="text-xs opacity-70">Users</p>
          <p className="text-lg font-bold">{stats?.users?.total || 0}</p>
        </div>

        <div className="bg-green-600 p-3 rounded-xl text-center">
          <p className="text-xs opacity-70">Orders</p>
          <p className="text-lg font-bold">{stats?.orders?.total || 0}</p>
        </div>

        <div className="bg-yellow-500 p-3 rounded-xl text-center text-black">
          <p className="text-xs opacity-70">Deposits</p>
          <p className="text-lg font-bold">{stats?.deposits?.total || 0}</p>
        </div>

        <div className="bg-purple-600 p-3 rounded-xl text-center">
          <p className="text-xs opacity-70">Revenue</p>
          <p className="text-lg font-bold">{stats?.revenue?.total || 0}</p>
        </div>
      </div>

      {/* QUICK ACTION BUTTONS */}
      <div className="mt-5 grid grid-cols-2 gap-2">

        <Link
          to="/deposit"
          className="bg-gray-800 p-3 rounded-xl text-center text-sm active:scale-95"
        >
          💰 Deposit
        </Link>

        <Link
          to="/orders"
          className="bg-gray-800 p-3 rounded-xl text-center text-sm active:scale-95"
        >
          📦 Orders
        </Link>

        <Link
          to="/support"
          className="bg-gray-800 p-3 rounded-xl text-center text-sm active:scale-95"
        >
          🛠 Support
        </Link>

        <Link
          to="/sendm"
          className="bg-blue-600 p-3 rounded-xl text-center text-sm active:scale-95"
        >
          📩 Send
        </Link>

      </div>

    </div>
  );
};

export default Dashboard;