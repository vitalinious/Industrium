import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${id}/`);
      setTask(data);
    } catch {
      setError('Задачу не знайдено');
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post('/task-comments/', { task: id, content: newComment });
      setNewComment('');
      fetchTask();
    } catch {
      setUploadError('Не вдалося додати коментар');
    }
  };

  const handleFileUpload = async e => {
    e.preventDefault();
    if (!newFile) return;
    const formData = new FormData();
    formData.append('file', newFile);
    formData.append('content_type', 'production.task');
    formData.append('object_id', id);

    try {
      await api.post('/attachments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewFile(null);
      fetchTask();
    } catch {
      setUploadError('Не вдалося завантажити файл');
    }
  };

  const handleDoneClick = async () => {
    setConfirming(true);
    setSuccessMsg('');
    try {
      await api.post(`/tasks/${id}/submit-complete/`);
      setSuccessMsg('Запит на підтвердження виконання відправлено керівнику.');
      fetchTask();
    } catch {
      setUploadError('Не вдалося надіслати запит');
    } finally {
      setConfirming(false);
    }
  };

  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!task) return <div className="p-6 text-center">Завантаження…</div>;

  return (
    <div className="p-6 bg-white shadow rounded overflow-auto">
      <h1 className="text-2xl font-bold">{task.title}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p><strong>Опис:</strong> {task.description || '—'}</p>
          <p><strong>Проєкт:</strong> {task.project_name || '—'}</p>
          <p><strong>Виконавець:</strong> {task.assignee_name}</p>
          <p><strong>Дата створення:</strong> {task.created_at?.slice(0, 10) || '—'}</p>
          <p><strong>Дедлайн:</strong> {task.due_date || '—'}</p>
          <p><strong>Статус:</strong> {task.status_display}</p>

          {task.status === 'InProgress' && (
            <button
              onClick={handleDoneClick}
              disabled={confirming}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
            >
              {confirming ? 'Надсилається…' : 'Надіслати на перевірку'}
            </button>
          )}

          {successMsg && <p className="text-green-600 text-sm mt-2">{successMsg}</p>}
        </div>

        <div className="space-y-4">
          <div>
            <strong>Коментарі</strong>
            <ul className="space-y-2">
              {(task.comments || []).length === 0
                ? <p className="text-sm text-gray-500">Немає коментарів</p>
                : task.comments.map(c => (
                    <li key={c.id} className="border px-3 py-2 rounded">
                      <div className="text-xs text-gray-500">
                        {c.author_name} — {c.created_at}
                      </div>
                      <div>{c.content}</div>
                    </li>
                  ))}
            </ul>

            <form onSubmit={handleCommentSubmit} className="mt-3 space-y-2">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                rows={3}
                placeholder="Написати коментар..."
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Додати коментар
              </button>
            </form>
          </div>

          <div>
            <strong>Файли</strong>
            <ul className="text-sm space-y-1">
              {(task.files || []).length === 0
                ? <p className="text-sm text-gray-500">Немає прикріплених файлів</p>
                : task.files.map(f => (
                    <li key={f.id}>
                      <a href={f.file} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        {f.description || f.file.split('/').pop()}
                      </a>
                    </li>
                  ))}
            </ul>

            <form onSubmit={handleFileUpload} className="mt-3 space-y-2">
              <input
                type="file"
                onChange={e => setNewFile(e.target.files[0])}
                className="text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Завантажити
              </button>
            </form>
            {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
          </div>
        </div>
      </div>

      <button
        className="mt-4 text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Назад до списку
      </button>
    </div>
  );
}
