import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
  
    try {
      // 1) Получаем JWT-токены
      const { data: tokens } = await axios.post(
        'http://localhost:8000/api/token/',
        { username, password }
      );
      localStorage.setItem('access_token',  tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + tokens.access;
  
      // 2) Запрашиваем профиль, чтобы узнать роль
      const { data: profile } = await axios.get(
        'http://localhost:8000/api/auth/profile/'
      );
      const { role } = profile;
      localStorage.setItem('user_role', role);
  
      // 3) Перенаправляем по роли
      if (role === 'chief') {
        navigate('/chief');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      // Если ошибка на любом шаге – показываем сообщение
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
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Логін
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
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