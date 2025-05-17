import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import useUserRole from '../../hooks/useUserRole';
import useDeleteItem from '../../hooks/useDeleteItem';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const role = useUserRole();
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [userId, setUserId] = useState(null);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/`);
      setProject(data);
    } catch {
      setError('Проєкт не знайдено');
    }
  };

  useEffect(() => {
    const fetchProfileAndProject = async () => {
      try {
        const [{ data: profile }, { data: project }] = await Promise.all([
          api.get('/auth/profile/'),
          api.get(`/projects/${id}/`)
        ]);
        setUserId(profile.id);
        setProject(project);
      } catch (err) {
        console.error('Не вдалося завантажити профіль або проєкт:', err);
        setError('Проєкт не знайдено');
      }
    };

    fetchProfileAndProject();
  }, [id]);

  const handleCommentSubmit = async e => {
  e.preventDefault();
  if (!newComment.trim()) return;
  try {
    await api.post('/project-comments/', {
    object_id: id,
    content: newComment
  });
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
  formData.append('object_id', id);
  formData.append('content_type_model', 'project');
  formData.append('content_type_app', 'production');
  console.log("⬆️ Uploading file:", newFile.name);
    try {
      await api.post('/attachments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewFile(null);
      setUploadSuccess('Файл успішно додано ✅');
      setUploadError('');
      fetchProject();
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setUploadError('Не вдалося завантажити файл');
      setUploadSuccess('');
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

  const handleCompleteProject = async () => {
    try {
      const response = await api.post(`/projects/${project.id}/complete/`);
      alert('Проєкт завершено!');
      fetchProject(); 
    } catch (error) {
      alert(error.response?.data?.detail || 'Помилка при завершенні проєкту');
    }
  };

  const { deleteItem: deleteAttachment } = useDeleteItem({
    endpoint: 'attachments',
    onSuccess: () => fetchProject()
  });

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
          {role === 'Manager' && project.status !== 'Completed' && (
            <button
              onClick={handleCompleteProject}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Завершити проєкт
            </button>
          )}
          {project.tasks?.some(t => t.status !== 'Completed') && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Є задачі, які ще не завершені — проєкт не можна закрити.
            </p>
          )}
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
            <div className="space-y-2">
              {(project.files || []).length === 0 ? (
                <p className="text-sm text-gray-500">Немає прикріплених файлів</p>
              ) : (
                project.files.map(f => {
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
              <div className="relative">
                <label className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded cursor-pointer inline-block">
                  Оберіть файл
                  <input
                    type="file"
                    onChange={e => setNewFile(e.target.files[0])}
                    className="absolute left-0 top-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-600">
                  {newFile ? newFile.name : 'Файл не обрано'}
                </span>
              </div>
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
