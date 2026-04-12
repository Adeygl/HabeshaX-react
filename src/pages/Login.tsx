import { useState } from 'react';

const Login = ({ setAuth, api }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      alert("Login success");
      setAuth(true);
    } catch (e) {
      alert("Login error: " + (e?.response?.data?.message || e.message));
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-6 rounded-xl w-80">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>

        <input
          placeholder="Username"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full p-2 border mb-3 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;