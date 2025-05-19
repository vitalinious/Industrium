import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

export default function CreateDepartment() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/departments/', { name });
      navigate('/department/departments');
    } catch {
      setError('Не вдалося створити відділ');
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Новий відділ</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Назва відділу</label>
          <input
            type="text"
            value={name}
            onChange={e=>setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Зберегти
              </button>
              <button
                type="button"
                onClick={() => navigate('/department/departments')}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Скасувати
              </button>
            </div>
      </form>
    </div>
  );
}
