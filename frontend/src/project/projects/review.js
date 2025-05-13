import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import useUserRole from '../../hooks/useUserRole';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const role = useUserRole();

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/`);
      setProject(data);
    } catch {
      setError('Проєкт не знайдено');
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post('/project-comments/', { project: id, content: newComment });
      setNewComment('');
      fetchProject();
    } catch {
      setUploadError('Не вдалося додати коментар');
    }
  };

  const handleFileUpload = async e => {
    e.preventDefault();
    if (!newFile) return;
    const formData = new FormData();
    formData.append('file', newFile);
    formData.append('content_type', 'production.project');
    formData.append('object_id', id);

    try {
      await api.post('/attachments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewFile(null);
      fetchProject();
    } catch {
      setUploadError('Не вдалося завантажити файл');
    }
  };

  const handleCommentDelete = async commentId => {
    try {
      await api.delete(`/project-comments/${commentId}/`);
      fetchProject();
    } catch {
      alert('Не вдалося видалити коментар');
    }
  };

  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!project) return <div className="p-6 text-center">Завантаження…</div>;

  return (
    <div className="p-6 bg-white shadow rounded overflow-auto">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {/* Ліва колонка */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p><strong>Опис:</strong> {project.description || '—'}</p>
            <p><strong>Дата початку:</strong> {project.start_date}</p>
            <p><strong>Дата завершення:</strong> {project.end_date || '—'}</p>
            <p><strong>Статус:</strong> {project.status_display}</p>
            <p><strong>Остання зміна:</strong> {project.last_modified_by || '—'} — {project.last_modified_at.slice(0, 16).replace('T', ' ')}</p>
          </div>

          <div>
            <strong className="block mb-2">Коментарі</strong>
            <ul className="space-y-2">
              {(project.comments || []).length === 0
                ? <p className="text-sm text-gray-500">Немає коментарів</p>
                : project.comments.map(c => (
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
        </div>

        {/* Права колонка */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Задачі</h2>
            {project.tasks.length === 0 ? (
              <p className="text-gray-500">Задач не пов’язано</p>
            ) : (
              <div className="divide-y border rounded bg-gray-100 overflow-hidden">
                {project.tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/task/tasks/${task.id}`)}
                    className="p-3 hover:bg-gray-200 cursor-pointer"
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>Виконавець: {task.assignee_name || '—'}</span>
                      <span>Статус: {task.status_display}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <strong>Файли</strong>
            <ul className="text-sm space-y-1">
              {(project.files || []).length === 0
                ? <p className="text-sm text-gray-500">Немає прикріплених файлів</p>
                : project.files.map(f => (
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
        ← Назад
      </button>
    </div>
  );
}
