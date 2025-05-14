import React, { useEffect, useState } from 'react';
import api from '../../api';
import {
  PieChart, Pie, Cell,
  ResponsiveContainer, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#00C49F', '#FFBB28', '#FF4444'];

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/summary/');
        setStats(data);
      } catch (err) {
        console.error('Помилка при завантаженні статистики', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-6 text-center">Завантаження...</div>;
  if (!stats) return <div className="p-6 text-center text-red-600">Не вдалося завантажити статистику</div>;

  const pieData = [
    { name: 'Виконано', value: stats.tasks_done },
    { name: 'В роботі', value: stats.tasks_in_progress },
    { name: 'Прострочено', value: stats.tasks_overdue },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-2">📊 Дашборд</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="bg-white p-3 rounded shadow text-center">
          <div className="text-green-500 text-sm">✅ Виконано задач</div>
          <div className="text-xl font-bold">{stats.tasks_done}</div>
        </div>
        <div className="bg-white p-3 rounded shadow text-center">
          <div className="text-blue-400 text-sm">📘 У роботі</div>
          <div className="text-xl font-bold">{stats.tasks_in_progress}</div>
        </div>
        <div className="bg-white p-3 rounded shadow text-center">
          <div className="text-red-400 text-sm">⏰ Прострочено</div>
          <div className="text-xl font-bold">{stats.tasks_overdue}</div>
        </div>
        <div className="bg-white p-3 rounded shadow text-center">
          <div className="text-yellow-300 text-sm">📂 Активних проєктів</div>
          <div className="text-xl font-bold">{stats.active_projects}</div>
        </div>
        <div className="bg-white p-3 rounded shadow text-center">
          <div className="text-orange-400 text-sm">📌 Невиконаних задач</div>
          <div className="text-xl font-bold">{stats.uncompleted_tasks_count}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="font-semibold mb-2">📌 Статус задач</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-lg">🗓️ Найближчі дедлайни</div>
            <button
              onClick={() => navigate('/analytics/reports')}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Детальніше
            </button>
          </div>
          <ul className="text-sm space-y-1 mt-2">
            {stats.upcoming_tasks?.length > 0 ? (
              stats.upcoming_tasks.map(task => (
                <li key={task.id} className="flex justify-between border-b border-gray-300 py-1">
                  <span>{task.title} — {task.assignee_name || '—'}</span>
                  <span className="text-xs text-gray-500">{task.due_date}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Немає задач з близькими дедлайнами</p>
            )}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="font-semibold text-lg mb-2">📈 Прогрес проєктів</div>
          <ul className="space-y-2 text-sm">
            {stats.projects_progress.length > 0 ? (
              stats.projects_progress.map(p => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-right">{p.percent}%</span>
                </li>
              ))
            ) : (
              <p className="text-gray-400">Немає активних проєктів</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
