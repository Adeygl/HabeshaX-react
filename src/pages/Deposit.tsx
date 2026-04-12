import React, { useState } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://habeshaxnode-9821a8586656.herokuapp.com/api',
});

const Deposit: React.FC = () => {
  const [telegram_id, setId] = useState('');
  const [amount, setAmount] = useState('');

  const sendDeposit = async () => {
    try {
      await API.post(
        '/deposits',
        { telegram_id, amount: Number(amount) },
        {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }
      );
      alert("Deposit success");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Deposit</h1>

      <input
        placeholder="Telegram ID"
        className="border p-2 w-full mb-3"
        onChange={(e) => setId(e.target.value)}
      />

      <input
        placeholder="Amount"
        className="border p-2 w-full mb-3"
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        onClick={sendDeposit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Send Deposit
      </button>
    </div>
  );
};

export default Deposit;