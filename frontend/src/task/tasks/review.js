import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';

export default function TaskReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const location = useLocation();
  const from = location.state?.from || '/task/tasks';

  useEffect(() => {
    api.get(`/tasks/${id}/`)
      .then(res => setTask(res.data))
      .catch(() => setError('Задачу не знайдено або немає доступу'));
  }, [id]);

  const formatDate = d => new Date(d).toLocaleDateString('uk-UA');

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!task) return <div className="p-6">Завантаження…</div>;

  return (
    <div className="p-6 bg-white rounded shadow max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{task.title}</h1>
      <p><strong>Опис:</strong> {task.description || '—'}</p>
      <p><strong>Проєкт:</strong> {task.project_name || '—'}</p>
      <p><strong>Виконавець:</strong> {task.assignee_name}</p>
      <p><strong>Статус:</strong> {task.status_display}</p>
      <p><strong>Дата створення:</strong> {formatDate(task.created_at)}</p>
      <p><strong>Дедлайн:</strong> {task.due_date ? formatDate(task.due_date) : '—'}</p>

      <button
        className="mt-4 text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Назад
      </button>
    </div>
  );
}