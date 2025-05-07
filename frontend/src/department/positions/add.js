import api from '../../api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePosition() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await api.post('/positions/', { name });
      navigate('/department/positions');
    } catch (err) {
      console.error('Помилка створення посади:', err);
      setError('Не вдалося створити посаду');
    }
  };
  return (
    <div className="p-6 bg-white shadow h-full rounded overflow-auto">
        <div className="grid md:grid-cols-2 gap-6">
            <section className="space-y-4">
            <h1 className="text-xl font-semibold">Основні дані</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="block text-sm font-medium mb-1">Назва посади</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800"
                >
                Зберегти
                </button>
            </form>
            </section>
        </div>
    </div>
  );
}
