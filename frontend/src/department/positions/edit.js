import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

export default function EditPosition() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPosition() {
      try {
        const { data } = await api.get(`/positions/${id}/`);
        setName(data.name);
      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити дані позиції');
      }
    }
    fetchPosition();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/positions/${id}/`, { name });
      navigate('/department/positions');
    } catch (err) {
      console.error(err);
      setError('Не вдалося оновити позицію');
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Редагувати позицію</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Назва посади</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Зберегти
          </button>
          <button
            type="button"
            onClick={() => navigate('/department/positions')}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
}