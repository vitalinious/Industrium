
import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterPopover from './filter';
import useDeleteItem from '../../hooks/useDeleteItem';
import useUserRole from '../../hooks/useUserRole';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const navigate = useNavigate();
  const role = useUserRole();
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const { data } = await api.get('/departments/');
        setDepartments(data);
      } catch (err) {
        console.error(err.response || err);
        if (err.response?.status === 401) {
          setError('Не авторизовані — будь ласка, увійдіть у систему');
        } else {
          setError('Не вдалося завантажити відділи');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const { deleteItem, isLoading } = useDeleteItem({
    endpoint: 'departments',
    onSuccess: (id) => setDepartments(prev => prev.filter(d => d.id !== id))
  });

  const handleEdit = (id) => {
    navigate(`/department/departments/edit/${id}`);
  };

  if (loading || role === null) return <div className="p-6 text-center">Завантаження…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="pb-3 space-y-4">
      <div className="p-3 bg-white shadow rounded flex justify-between items-center mb-2">
        {role === 'Manager' && (
          <button
            className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded min-w-[110px]"
            onClick={() => navigate('/department/departments/add')}
          >
            Додати
          </button>
        )}
        <div className="ml-auto">
          <FilterPopover onFilter={(filteredData) => setDepartments(filteredData)} />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="table-fixed min-w-full text-left">
          <colgroup>
            <col className="w-[50px]" />      {/* ID */}
            <col className="w-auto" />        {/* Назва */}
            <col className="w-[100px]" />     {/* Дії */}
          </colgroup>
          <thead className="bg-white sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 border-r border-gray-300">ID</th>
              <th className="px-4 py-2">Назва відділу</th>
              {role === 'Manager' && (
                <th className="px-4 py-2 text-right whitespace-nowrap">Дії</th>
              )}
            </tr>
          </thead>
          <tbody>
            {departments.map(dep => (
              <tr key={dep.id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-3 border-r border-gray-200">{dep.id}</td>
                <td className="px-4 py-3">{dep.name}</td>
                {role === 'Manager' && (
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(dep.id)}
                      title="Редагувати"
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 size={16} className="text-gray-600 hover:text-black" />
                    </button>
                    <button
                      onClick={() => deleteItem(dep.id)}
                      disabled={isLoading}
                      className="p-1 hover:bg-red-50 rounded"
                      title="Видалити"
                    >
                      <X size={16} className="text-red-500 hover:text-red-700" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="py-2 text-center text-sm text-gray-500">
          Всього відділів: {departments.length}
        </div>
      </div>
    </div>
  );
}
