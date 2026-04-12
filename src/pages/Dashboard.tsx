import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded">
          Users: {stats?.users?.total || 0}
        </div>
        <div className="bg-green-500 text-white p-4 rounded">
          Orders: {stats?.orders?.total || 0}
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded">
          Deposits: {stats?.deposits?.total || 0}
        </div>
        <div className="bg-purple-500 text-white p-4 rounded">
          Revenue: {stats?.revenue?.total || 0}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link to="/deposit" className="bg-black text-white px-4 py-2 rounded">
          Deposit
        </Link>
        <Link to="/Support" className="bg-gray-700 text-white px-4 py-2 rounded">
          Support
        </Link>
        <Link to="/orders" className="bg-gray-700 text-white px-4 py-2 rounded">
          Orders
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;