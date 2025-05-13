import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DatePicker, { registerLocale } from 'react-datepicker';
import uk from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';
import { validateNotEmpty } from '../../utils/validators';

registerLocale('uk', uk);

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState(null);

  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  const [errors, setErrors] = useState({
    title: null,
    assignee: null,
    submit: null
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const taskRes = await api.get(`/tasks/${id}/`);
        const task = taskRes.data;

        setTitle(task.title);
        setDescription(task.description);
        setProjectId(task.project || '');
        setDueDate(task.due_date ? new Date(task.due_date) : null);

        setDepartmentId(task.department_id || '');
        setPositionId(task.position_id || '');
        setAssigneeId(task.assignee || '');

        const [deptRes, projRes] = await Promise.all([
          api.get('/departments/'),
          api.get('/projects/')
        ]);

        setDepartments(deptRes.data);
        setProjects(projRes.data);

        if (task.department_id) {
          const posRes = await api.get('/positions/', { params: { department: task.department_id } });
          setPositions(posRes.data);
        }

        if (task.position_id) {
          const empRes = await api.get('/employees/', {
            params: { department: task.department_id, position: task.position_id }
          });
          setEmployees(empRes.data);
        }

      } catch (err) {
        setErrors(e => ({ ...e, submit: 'Не вдалося завантажити дані задачі' }));
      }
    };

    loadInitialData();
  }, [id]);

  useEffect(() => {
    if (departmentId) {
      api.get('/positions/', { params: { department: departmentId } })
        .then(res => setPositions(res.data));
    } else {
      setPositions([]);
      setPositionId('');
    }
    setEmployees([]);
    setAssigneeId('');
  }, [departmentId]);

  useEffect(() => {
    if (positionId) {
      api.get('/employees/', {
        params: { department: departmentId, position: positionId }
      }).then(res => setEmployees(res.data));
    } else {
      setEmployees([]);
      setAssigneeId('');
    }
  }, [positionId]);

  const formatDate = date => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const newErrors = {
      title: validateNotEmpty(title),
      assignee: assigneeId ? null : 'Оберіть виконавця'
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(e => e)) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      project: projectId || null,
      assignee: assigneeId,
      due_date: dueDate ? formatDate(dueDate) : null
    };

    try {
      await api.put(`/tasks/${id}/`, payload);
      navigate('/task/tasks');
    } catch (err) {
      const msg = err.response?.status === 400
        ? Object.entries(err.response.data).map(([f, msgs]) => `${f}: ${msgs.join(' ')}`).join('\n')
        : 'Помилка при оновленні задачі';
      setErrors(e => ({ ...e, submit: msg }));
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded overflow-auto">
      <h1 className="text-xl font-semibold mb-4">Редагувати задачу</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Назва <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              onBlur={() => setErrors(e => ({ ...e, title: validateNotEmpty(title) }))}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Опис</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Проєкт (необов’язково)</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
            >
              <option value="">Без проєкту</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Відділ</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
            >
              <option value="">Оберіть відділ</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Посада</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={positionId}
              onChange={e => setPositionId(e.target.value)}
              disabled={!departmentId}
            >
              <option value="">Оберіть посаду</option>
              {positions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Виконавець <span className="text-red-500">*</span></label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              required
              disabled={!positionId}
            >
              <option value="">Оберіть користувача</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
            {errors.assignee && <p className="text-red-500 text-sm mt-1">{errors.assignee}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Дедлайн</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={dueDate}
              onChange={setDueDate}
              className="w-full border px-3 py-2 rounded"
              placeholderText="дд.мм.рррр"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          {errors.submit && <p className="text-red-500 whitespace-pre-line mb-4">{errors.submit}</p>}
          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Зберегти</button>
            <button type="button" onClick={() => navigate('/task/tasks')} className="px-6 py-2 border rounded hover:bg-gray-100">Скасувати</button>
          </div>
        </div>
      </form>
    </div>
  );
}
