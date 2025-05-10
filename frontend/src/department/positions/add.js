import api from '../../api';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePosition() {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const { data } = await api.get('/departments/');
        setDepartments(data);
      } catch (err) {
        console.error('Не вдалося завантажити відділи:', err);
      }
    }
    fetchDepartments();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!departmentId) {
      setError('Будь ласка, оберіть відділ');
      return;
    }

    try {
      await api.post('/positions/', {
        name,
        department: departmentId,
      });
      navigate('/department/positions');
    } catch (err) {
      console.error('Помилка створення посади:', err);
      setError('Не вдалося створити посаду');
    }
  };

  return (
    <div className="p-6 bg-white shadow h-full rounded overflow-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <section className="space-y-4 md:col-span-2">
          <h1 className="text-xl font-semibold">Нова посада</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Назва посади</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Відділ</label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Оберіть відділ</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800"
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
        </section>
      </div>
    </div>
  );
}