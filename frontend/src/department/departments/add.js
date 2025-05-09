// src/pages/department/departments/add.js
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
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800">
          Зберегти
        </button>
      </form>
    </div>
  );
}
