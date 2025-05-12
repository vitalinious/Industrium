import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterPopover from '../filter';
import useDeleteItem from '../../hooks/useDeleteItem';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const formatDate = d => new Date(d).toLocaleDateString('uk-UA');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/projects/');
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError('Не вдалося завантажити проєкти');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { deleteItem, isLoading: deleting } = useDeleteItem({
    endpoint: 'projects',
    onSuccess: id => setProjects(prev => prev.filter(p => p.id !== id)),
  });

  const handleEdit = id => navigate(`/project/projects/edit/${id}`);
  const handleAdd  = () => navigate('/project/projects/add');

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
        <FilterPopover onFilter={data => setProjects(data)} endpoint="projects" />
      </div>

      <div className="overflow-x-auto overflow-y-scroll bg-white shadow rounded max-h-[70vh]">
        <table className="table-fixed min-w-full text-left">
          <colgroup>
            <col className="w-3/12" /> {/* Назва */}
            <col className="w-4/12" /> {/* Опис */}
            <col className="w-2/12" /> {/* Остання зміна ким */}
            <col className="w-1/12" /> {/* Початок */}
            <col className="w-1/12" /> {/* Закінчення */}
            <col className="w-2/12" /> {/* Статус */}
            <col className="w-24" />   {/* Дії */}
          </colgroup>
          <thead className="bg-white sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2">Назва</th>
              <th className="px-4 py-2">Опис</th>
              <th className="px-4 py-2">Остання зміна</th>
              <th className="px-4 py-2">Початок</th>
              <th className="px-4 py-2">Закінчення</th>
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2 text-right whitespace-nowrap">Дії</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(proj => (
              <tr
                key={proj.id}
                className="border-b border-gray-700 hover:bg-gray-300 cursor-pointer"
                onClick={() => navigate(`/project/projects/${proj.id}`)}
              >
                <td className="px-4 py-3">{proj.name}</td>
                <td className="px-4 py-3 truncate">{proj.description}</td>
                <td className="px-4 py-3">
                  {proj.last_modified_by_name || '—'}
                  <br />
                  <span className="text-xs text-gray-500">
                    {proj.last_modified_at ? formatDate(proj.last_modified_at) : ''}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(proj.start_date)}</td>
                <td className="px-4 py-3">{proj.end_date ? formatDate(proj.end_date) : '—'}</td>
                <td className="px-4 py-3">{proj.status_display}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(proj.id);
                      }}
                      title="Редагувати"
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <Edit2 size={16} className="text-gray-400 hover:text-white" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteItem(proj.id);
                      }}
                      disabled={deleting}
                      className="p-1 hover:bg-red-50 rounded"
                      title="Видалити"
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
          Всього проєктів: {projects.length}
        </div>
      </div>
    </div>
  );
}