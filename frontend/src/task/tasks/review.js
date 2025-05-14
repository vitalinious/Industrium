// TaskDetail.js (оновлена версія з кнопками підтвердження/відхилення)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import useUserRole from '../../hooks/useUserRole';
import useDeleteItem from '../../hooks/useDeleteItem';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const role = useUserRole();

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${id}/`);
      setTask(data);
    } catch {
      setError('Задачу не знайдено');
    }
  };

  useEffect(() => {
    const fetchProfileAndTask = async () => {
      try {
        const [{ data: profile }, { data: taskData }] = await Promise.all([
          api.get('/auth/profile/'),
          api.get(`/tasks/${id}/`)
        ]);
        setUserId(profile.id);
        setTask(taskData);
      } catch {
        setError('Задачу не знайдено');
      }
    };
    fetchProfileAndTask();
  }, [id]);

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post('/task-comments/', { object_id: id, content: newComment });
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
    formData.append('object_id', id);
    formData.append('content_type_model', 'task');
    formData.append('content_type_app', 'production');

    try {
      await api.post('/attachments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewFile(null);
      setUploadSuccess('Файл успішно додано ✅');
      setUploadError('');
      fetchTask();
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch {
      setUploadError('Не вдалося завантажити файл');
      setUploadSuccess('');
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

  const handleConfirmTask = async () => {
    try {
      await api.post(`/tasks/${id}/confirm-complete/`);
      setActionMsg('Задачу підтверджено як виконану ✅');
      fetchTask();
    } catch {
      alert('Не вдалося підтвердити виконання задачі');
    }
  };

  const handleRejectTask = async () => {
    if (!rejectionReason.trim()) {
      alert('Введіть причину відхилення');
      return;
    }
    try {
      await api.post(`/tasks/${id}/reject-complete/`, { reason: rejectionReason });
      setRejectionReason('');
      setRejecting(false);
      setActionMsg('Задачу відхилено з зауваженням');
      fetchTask();
    } catch {
      alert('Не вдалося відхилити задачу');
    }
  };

  const handleCommentDelete = async commentId => {
    try {
      await api.delete(`/task-comments/${commentId}/`);
      fetchTask();
    } catch {
      alert('Не вдалося видалити коментар');
    }
  };

  const { deleteItem: deleteAttachment } = useDeleteItem({
    endpoint: 'attachments',
    onSuccess: () => fetchTask()
  });

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

          {role === 'Manager' && task.status === 'PendingConfirmation' && (
            <div className="space-y-2 mt-4">
              <button
                onClick={handleConfirmTask}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ✅ Підтвердити виконання
              </button>
              <button
                onClick={() => setRejecting(!rejecting)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                ❌ Не підтверджено
              </button>
              {rejecting && (
                <div className="space-y-2">
                  <textarea
                    className="w-full border px-3 py-2 rounded"
                    rows={3}
                    placeholder="Вкажіть зауваження..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                  <button
                    onClick={handleRejectTask}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Надіслати зауваження
                  </button>
                </div>
              )}
              {actionMsg && <p className="text-green-600 text-sm">{actionMsg}</p>}
            </div>
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
                    <li key={c.id} className="border px-3 py-2 rounded relative group">
                      <div className="text-xs text-gray-500">
                        {c.author_name} — {c.created_at}
                      </div>
                      <div>{c.content}</div>
                      {role === 'Manager' && (
                        <button
                          onClick={() => handleCommentDelete(c.id)}
                          className="absolute top-2 right-2 text-red-500 text-xs hover:underline hidden group-hover:inline"
                        >
                          Видалити
                        </button>
                      )}
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
            <div className="space-y-2">
              {(task.files || []).length === 0 ? (
                <p className="text-sm text-gray-500">Немає прикріплених файлів</p>
              ) : (
                task.files.map(f => {
                  const fileName = decodeURIComponent(f.file.split('/').pop());
                  const ext = fileName.split('.').pop().toLowerCase();

                  let icon = '📎';
                  if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) icon = '🖼️';
                  else if (['pdf'].includes(ext)) icon = '📄';
                  else if (['doc', 'docx'].includes(ext)) icon = '📝';
                  else if (['xls', 'xlsx'].includes(ext)) icon = '📊';
                  else if (['zip', 'rar'].includes(ext)) icon = '🗂️';

                  const canDelete = role === 'Manager' || userId === f.uploaded_by_id;

                  return (
                    <div key={f.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span>{icon}</span>
                        <a
                          href={f.file}
                          download={fileName}
                          className="text-blue-500 hover:underline break-all"
                        >
                          {fileName}
                        </a>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => deleteAttachment(f.id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Видалити
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

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
            {uploadSuccess && <p className="text-green-600 text-sm">{uploadSuccess}</p>}
            {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
          </div>
        </div>
      </div>

      <button
        className="mt-4 text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Назад
      </button>
    </div>
  );
}
