import React, { useState } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://habeshaxnode-9821a8586656.herokuapp.com/api',
});

const Deposit: React.FC = () => {
  const [telegram_id, setId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const sendDeposit = async () => {
    if (!telegram_id || !amount) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      await API.post(
        '/deposits',
        { telegram_id, amount: Number(amount) },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      );

      alert("✅ Deposit successful");
      setId('');
      setAmount('');
    } catch (e: any) {
      alert("❌ Error: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          💰 Deposit Panel
        </h1>

        <input
          value={telegram_id}
          placeholder="Telegram ID"
          className="border border-gray-600 bg-gray-700 text-white p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setId(e.target.value)}
        />

        <input
          value={amount}
          placeholder="Amount (Birr)"
          type="number"
          className="border border-gray-600 bg-gray-700 text-white p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={sendDeposit}
          disabled={loading}
          className={`w-full py-3 rounded font-semibold transition ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? "Processing..." : "Send Deposit"}
        </button>

      </div>
    </div>
  );
};

export default Deposit;