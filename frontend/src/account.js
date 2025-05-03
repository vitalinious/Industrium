import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await axios.get('/api/auth/profile/');
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити дані профілю');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6 text-center">Завантаження...</div>;
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 h-full overflow-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Основні дані */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Основні дані</h2>
          <div>
            <label className="block text-sm text-gray-700">Логін</label>
            <p className="mt-1 text-gray-900">{profile.username}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Електронна пошта</label>
            <p className="mt-1 text-gray-900">{profile.email}</p>
          </div>
          <button
            className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Змінити пароль
          </button>
          <div>
            <label className="block text-sm text-gray-700">Ім'я *</label>
            <input
              type="text"
              value={profile.first_name}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Прізвище *</label>
            <input
              type="text"
              value={profile.last_name}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">По батькові</label>
            <input
              type="text"
              value={profile.middle_name || ''}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Телефон</label>
            <input
              type="text"
              value={profile.phone_number || ''}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>
        </section>

        {/* Налаштування */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Значення за замовчуванням</h2>
          <div>
            <label className="block text-sm text-gray-700">Організація</label>
            <select className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded">
              <option>Оберіть організацію</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Склад</label>
            <select className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded">
              <option>Оберіть сховище</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Покупець</label>
            <select className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded">
              <option>Оберіть покупця</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Продавець</label>
            <select className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded">
              <option>Оберіть продавця</option>
            </select>
          </div>

          <h2 className="mt-6 text-xl font-semibold">Налаштування</h2>
          <div>
            <label className="block text-sm text-gray-700">Мова</label>
            <select className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded">
              <option>Українська</option>
              <option>English</option>
            </select>
          </div>

          <button
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Зберегти
          </button>
        </section>
      </div>
    </div>
  );
}