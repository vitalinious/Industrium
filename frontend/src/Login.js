import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await axios.post('/api/token/', {
      username,
      password
    });
      // Зберігаємо токени
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Декодуємо роль
      const decoded = jwtDecode(data.access);
      console.log('TOKEN DEBUG:', decoded);
      const role = decoded.role;
      console.log('Роль користувача:', role);

      // За потреби збережи роль окремо (не обов’язково)
      // localStorage.setItem('user_role', role);

      // Перенаправлення після входу
      navigate('/department/account');
    } catch (err) {
      setError('Невірний логін або пароль');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Вхід</h2>
        {error && (
          <div className="mb-4 text-center text-red-600">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Логін</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-medium rounded-md
                       hover:bg-blue-700 transition-colors"
          >
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
}
