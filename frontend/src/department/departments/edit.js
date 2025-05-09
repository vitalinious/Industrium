// src/pages/department/departments/edit.js
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditDepartment() {
  const { id } = useParams();
  const [name, setName]   = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/departments/${id}/`)
       .then(({ data }) => setName(data.name))
       .catch(()=>setError('Не вдалося завантажити відділ'));
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.put(`/departments/${id}/`, { name });
      navigate('/department/departments');
    } catch {
      setError('Не вдалося оновити відділ');
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Редагувати відділ</h1>
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
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Зберегти
          </button>
          <button type="button" onClick={()=>navigate('/department/departments')} className="px-4 py-2 border rounded hover:bg-gray-100">
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
}
