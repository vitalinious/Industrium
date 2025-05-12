import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterPopover from './filter';
import useDeleteItem from '../../hooks/useDeleteItem';

export default function Tasks() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const formatDate = d => new Date(d).toLocaleDateString('uk-UA');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/tasks/');
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити задачі');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { deleteItem, isLoading: deleting } = useDeleteItem({
    endpoint: 'tasks',
    onSuccess: id => setTasks(prev => prev.filter(t => t.id !== id)),
  });

  const handleEdit = id => navigate(`/task/tasks/edit/${id}`);
  const handleAdd  = () => navigate('/task/tasks/add');

  if (loading) return <div className="p-6 text-center">Завантаження…</div>;
  if (error)   return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="pb-3 space-y-4">
      <div className="p-3 bg-white shadow rounded flex justify-between mb-2">
        <button
          className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded"
          onClick={handleAdd}
        >
          Додати
        </button>
        <FilterPopover onFilter={data => setTasks(data)} endpoint="tasks" />
      </div>

      <div className="overflow-x-auto overflow-y-scroll bg-white shadow rounded max-h-[70vh]">
        <table className="table-fixed min-w-full text-left">
          <colgroup>
            <col className="w-3/12" />
            <col className="w-2/12" />
            <col className="w-2/12" />
            <col className="w-2/12" />
            <col className="w-2/12" />
            <col className="w-1/12" />
            <col className="w-24" />
          </colgroup>
          <thead className="bg-white sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2">Назва</th>
              <th className="px-4 py-2">Проєкт</th>
              <th className="px-4 py-2">Виконавець</th>
              <th className="px-4 py-2">Початок</th>
              <th className="px-4 py-2">Дедлайн</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2 text-right whitespace-nowrap">Дії</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-gray-100">
                <td className="px-4 py-3">{task.title}</td>
                <td className="px-4 py-3">{task.project_name || '—'}</td>
                <td className="px-4 py-3">{task.assignee_name}</td>
                <td className="px-4 py-3">{formatDate(task.created_at)}</td>
                <td className="px-4 py-3">{task.due_date ? formatDate(task.due_date) : '—'}</td>
                <td className="px-4 py-3">{task.status_display}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() => handleEdit(task.id)}
                      title="Редагувати"
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteItem(task.id)}
                      disabled={deleting}
                      title="Видалити"
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <X size={16} className="text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="py-2 text-center text-sm text-gray-500">
          Всього задач: {tasks.length}
        </div>
      </div>
    </div>
  );
}