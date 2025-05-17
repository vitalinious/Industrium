import React, { useEffect, useState } from 'react';
import api from '../../api';
import {
  PieChart, Pie, Cell,
  ResponsiveContainer, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/daygrid/main.css'; // ✅ працює у v5
import ukLocale from '@fullcalendar/core/locales/uk';

const COLORS = ['#008556', '#FFBB28', '#FF4444'];

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
    console.log('stats', stats);
  }, []);

  if (loading) return <div className="p-6 text-center">Завантаження...</div>;
  if (!stats) return <div className="p-6 text-center text-red-600">Не вдалося завантажити статистику</div>;

  const pieData = [
    { name: 'Виконано', value: stats.tasks_done },
    { name: 'В роботі', value: stats.tasks_in_progress },
    { name: 'Прострочено', value: stats.tasks_overdue },
  ];

  const calendarEvents = stats.upcoming_tasks?.map(task => ({
    title: task.title || 'Без назви',
    date: task.due_date?.slice(0, 10),
    color:
      task.status === 'Completed' ? '#008556' :
      task.status === 'InProgress' ? '#FFBB28' :
      '#FF4444'
  })) || [];

  return (
    <div className="p-4 space-y-4">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="font-semibold mb-2 text-lg">📌 Статус задач</div>
          <ResponsiveContainer width="100%" height={600}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
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
          <div className="font-semibold mb-2 text-lg">📅 Календар дедлайнів</div>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height={600}
            locales={[ukLocale]}
            locale="uk"
            events={calendarEvents}
          />
        </div>
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
  );
}
