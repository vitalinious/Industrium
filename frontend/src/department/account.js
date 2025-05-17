import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get('/auth/profile/');
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
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white shadow h-full rounded overflow-auto">
      <div className="grid md:grid-cols-2 gap-6">
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

          <div>
            <label className="block text-sm text-gray-700">Ім'я</label>
            <input
              type="text"
              value={profile.first_name}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Прізвище</label>
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

          {/* <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-blue-800">
            Змінити пароль
          </button> */}
        </section>

        <section className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Відділ</label>
            <input
              type="text"
              value={profile.department || ''}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Посада</label>
            <input
              type="text"
              value={profile.position || ''}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Дата реєстрації</label>
            <input
              type="text"
              value={new Date(profile.date_joined).toLocaleDateString('uk-UA')}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
