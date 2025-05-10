import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

export default function EditPosition() {
  const { id } = useParams();
  const [name, setName]               = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [error, setError]             = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/departments/')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('Не вдалося завантажити відділи:', err));
  }, []);

  useEffect(() => {
    api.get(`/positions/${id}/`)
      .then(({ data }) => {
        setName(data.name);
        setDepartmentId(data.department);
      })
      .catch(err => {
        console.error(err);
        setError('Не вдалося завантажити дані позиції');
      });
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!departmentId) {
      setError('Будь ласка, оберіть відділ');
      return;
    }

    try {
      await api.put(`/positions/${id}/`, {
        name,
        department: departmentId,
      });
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