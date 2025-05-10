import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterPopover from './filter';
import useDeleteItem from '../../hooks/useDeleteItem';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  const formatPhone = num => {
    const m = num.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (!m) return num;
    return `+${m[1]}(${m[2]})${m[3]}-${m[4]}-${m[5]}`;
  };

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const { data } = await api.get('/employees/');
        setEmployees(data);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.status === 401
            ? 'Не авторизовані — будь ласка, увійдіть у систему'
            : 'Не вдалося завантажити співробітників'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  const { deleteItem, isLoading } = useDeleteItem({
    endpoint: 'employees',
    onSuccess: id => setEmployees(prev => prev.filter(e => e.id !== id)),
  });

  const handleEdit = id => navigate(`/department/employees/edit/${id}`);

  if (loading) return <div className="p-6 text-center">Завантаження…</div>;
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="pb-3 space-y-4">
      <div className="p-3 bg-white shadow rounded flex justify-between mb-2">
        <button
          className="bg-gray-800 text-white hover:bg-blue-800 px-4 py-2 rounded"
          onClick={() => navigate('/department/employees/add')}
        >
          Додати
        </button>
        <FilterPopover onFilter={data => setEmployees(data)} />
      </div>

      <div className="overflow-x-auto overflow-y-scroll bg-white shadow rounded max-h-[70vh]">
        <table className="table-fixed min-w-full text-left">
          <colgroup>
            <col className="w-4" />        {/* чекбокс */}
            <col className="w-3/12" />     {/* ПІБ */}
            <col className="w-1/12" />     {/* Email */}
            <col className="w-2/12" />     {/* Телефон */}
            <col className="w-1/12" />     {/* Відділ */}
            <col className="w-3/12" />     {/* Посада */}
            <col className="w-2/12" />     {/* Дата приєднання */}
            <col className="w-24" />       {/* Дії */}
          </colgroup>
          <thead className="bg-white sticky top-0 z-10">
            <tr className="border-b border-gray-700">
              <th className="px-2 py-2"></th>
              <th className="px-4 py-2">ПІБ</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Телефон</th>
              <th className="px-4 py-2">Відділ</th>
              <th className="px-4 py-2">Посада</th>
              <th className="px-4 py-2">Дата приєднання</th>
              <th className="px-4 py-2 text-right whitespace-nowrap">Дії</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-b border-gray-700 hover:bg-gray-300">
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3">{emp.full_name}</td>
                <td className="px-4 py-3">{emp.email}</td>
                <td className="px-4 py-3">{formatPhone(emp.phone_number)}</td>
                <td className="px-4 py-3">{emp.department_name}</td>
                <td className="px-4 py-3">{emp.position_name}</td>
                <td className="px-4 py-3">{emp.date_joined}</td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(emp.id)}
                    title="Редагувати"
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Edit2 size={16} className="text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => deleteItem(emp.id)}
                    disabled={isLoading}
                    className="p-1 hover:bg-red-50 rounded"
                    title="Видалити"
                  >
                    <X size={16} className="text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="py-2 text-center text-sm text-gray-400">
          Всього співробітників: {employees.length}
        </div>
      </div>
    </div>
  );
}
