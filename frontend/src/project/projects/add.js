import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import DatePicker, { registerLocale } from 'react-datepicker';
import uk from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';
import {
  validateNotEmpty
} from '../../utils/validators';

registerLocale('uk', uk);

export default function CreateProject() {
  const navigate = useNavigate();

  // форма
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [startDate, setStartDate]     = useState(null);
  const [endDate, setEndDate]         = useState(null);

  // дані для селекту
  const [departments, setDepartments] = useState([]);

  // помилки
  const [nameErr, setNameErr]         = useState(null);
  const [startDateErr, setStartDateErr] = useState(null);
  const [endDateErr, setEndDateErr]     = useState(null);
  const [submitErr, setSubmitErr]     = useState(null);

  const attachRequiredMsg = e => e.target.setCustomValidity('Будь ласка, заповніть це поле');
  const clearRequiredMsg  = e => e.target.setCustomValidity('');

  useEffect(() => {
    api.get('/departments/')
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();

    // скидання попередніх помилок
    setNameErr(null);
    setStartDateErr(null);
    setEndDateErr(null);
    setSubmitErr(null);

    // базова валідація
    const nmErr = validateNotEmpty(name);
    setNameErr(nmErr);
    if (nmErr || !departmentId || !startDate) {
      setSubmitErr('Будь ласка, заповніть обов’язкові поля');
      return;
    }

    // додаткова валідація дат
    let valid = true;
    const today = new Date();
    today.setHours(0,0,0,0);
    if (startDate < today) {
      setStartDateErr('Дата початку не може бути раніше за сьогодні');
      valid = false;
    }
    if (endDate && endDate < startDate) {
      setEndDateErr('Дата завершення не може бути раніше за початок');
      valid = false;
    }
    if (!valid) return;

    // відправка даних
    try {
      const payload = {
        name:        name.trim(),
        description: description.trim(),
        department:  departmentId,
        start_date:  startDate.toISOString().slice(0,10),
        end_date:    endDate ? endDate.toISOString().slice(0,10) : null,
      };
      await api.post('/projects/', payload);
      navigate('/project/projects');
    } catch (err) {
      if (err.response?.status === 400) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(' ')}`)
          .join('\n');
        setSubmitErr(messages);
      } else {
        setSubmitErr('Не вдалося створити проєкт');
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded overflow-auto">
      <h1 className="text-xl font-semibold mb-4">Новий проєкт</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

        {/* Ліва колонка */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              Назва проєкту <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
              className="w-full border px-3 py-2 rounded"
              value={name}
              onBlur={() => setNameErr(validateNotEmpty(name))}
              onChange={e => setName(e.target.value)}
            />
            {nameErr && <p className="text-red-500 text-sm mt-1">{nameErr}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Опис</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Права колонка */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">
              Відділ <span className="text-red-500">*</span>
            </label>
            <select
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
              className="w-full border px-3 py-2 rounded"
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
            >
              <option value="">Оберіть відділ</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">
              Дата початку <span className="text-red-500">*</span>
            </label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="дд.мм.рррр"
              className="w-full border px-3 py-2 rounded"
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
            />
            {startDateErr && <p className="text-red-500 text-sm mt-1">{startDateErr}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Дата завершення</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="дд.мм.рррр"
              className="w-full border px-3 py-2 rounded"
            />
            {endDateErr && <p className="text-red-500 text-sm mt-1">{endDateErr}</p>}
          </div>
        </div>

        <div className="md:col-span-2">
          {submitErr && <p className="text-red-500 whitespace-pre-line mb-4">{submitErr}</p>}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Зберегти
            </button>
            <button
              type="button"
              onClick={() => navigate('/project/projects')}
              className="px-6 py-2 border rounded hover:bg-gray-100"
            >
              Скасувати
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
