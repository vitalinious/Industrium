import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Edit2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterPopover from './filter'
import useDeleteItem from '../../hooks/useDeleteItem';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPositions() {
      try {
        const { data } = await api.get('/positions/');
        setPositions(data);
      } catch (err) {
        console.error(err.response || err);
        if (err.response?.status === 401) {
          setError('Не авторизовані — будь ласка, увійдіть у систему');
        } else {
          setError('Не вдалося завантажити посади');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
  }, []);

  const { deleteItem, isLoading } = useDeleteItem({
    endpoint: 'positions',
    onSuccess: (id) => setPositions(prev => prev.filter(p => p.id !== id))
  });

  if (loading) return <div className="p-6 text-center">Завантаження…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="pb-3 space-y-4">
      <div className="p-3 bg-white shadow rounded flex justify-between mb-2">
        <button
          className="bg-gray-800 text-white hover:bg-blue-800 px-4 py-2 rounded"
          onClick={() => navigate('/department/positions/add')}
        >
          Додати
        </button>
        <FilterPopover onFilter={(filteredData) => setPositions(filteredData)} />
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="px-2 py-2 w-4"></th>
              <th className="px-4 py-2">Назва посади</th>
              <th className="px-4 py-2 text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => (
              <tr key={pos.id} className="border-b border-gray-700 hover:bg-gray-300">
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3">{pos.name}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button title="Редагувати">
                    <Edit2 size={16} className="text-gray-400 hover:text-white" />
                  </button>
                  <button onClick={() => deleteItem(pos.id)} disabled={isLoading}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="py-2 text-center text-sm text-gray-400">
          Всього позицій: {positions.length}
        </div>
      </div>
    </div>
  );
}
