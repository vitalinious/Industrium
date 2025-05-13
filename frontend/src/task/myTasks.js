import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const formatDate = d => {
    const parsed = new Date(d);
    return isNaN(parsed) ? '—' : parsed.toLocaleDateString('uk-UA');
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/tasks/my/');
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити задачі користувача');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-center">Завантаження…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="pb-3 space-y-4">
      <div className="p-3 bg-white shadow rounded flex justify-between mb-2">
        <h1 className="text-xl font-semibold">Мої задачі</h1>
      </div>

      <div className="overflow-x-auto overflow-y-scroll bg-white shadow rounded max-h-[70vh]">
        <table className="table-fixed min-w-full text-left">
          <colgroup>
            <col className="w-4/12" />
            <col className="w-2/12" />
            <col className="w-2/12" />
            <col className="w-2/12" />
            <col className="w-2/12" />
          </colgroup>
          <thead className="bg-white sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2">Назва</th>
              <th className="px-4 py-2">Проєкт</th>
              <th className="px-4 py-2">Початок</th>
              <th className="px-4 py-2">Дедлайн</th>
              <th className="px-4 py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr
                key={task.id}
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/task/tasks/${task.id}`, { state: { from: location.pathname } })}
              >
                <td className="px-4 py-3">{task.title}</td>
                <td className="px-4 py-3">{task.project_name || '—'}</td>
                <td className="px-4 py-3">{formatDate(task.created_at)}</td>
                <td className="px-4 py-3">{task.due_date ? formatDate(task.due_date) : '—'}</td>
                <td className="px-4 py-3">{task.status_display}</td>
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
