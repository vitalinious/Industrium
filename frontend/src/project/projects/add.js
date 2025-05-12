import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import DatePicker, { registerLocale } from 'react-datepicker';
import uk from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';
import { validateNotEmpty } from '../../utils/validators';

registerLocale('uk', uk);

export default function CreateProject() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [nameErr, setNameErr] = useState(null);
  const [startDateErr, setStartDateErr] = useState(null);
  const [endDateErr, setEndDateErr] = useState(null);
  const [submitErr, setSubmitErr] = useState(null);

  const formatDateLocal = (date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
  };

  const handleSubmit = async e => {
    e.preventDefault();

    setNameErr(null);
    setStartDateErr(null);
    setEndDateErr(null);
    setSubmitErr(null);

    const nmErr = validateNotEmpty(name);
    setNameErr(nmErr);
    if (nmErr || !startDate) {
      setSubmitErr('Будь ласка, заповніть обов’язкові поля');
      return;
    }

    let valid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      setStartDateErr('Дата початку не може бути раніше за сьогодні');
      valid = false;
    }
    if (endDate && endDate < startDate) {
      setEndDateErr('Дата завершення не може бути раніше за початок');
      valid = false;
    }
    if (!valid) return;

    try {
      await api.post('/projects/', {
        name: name.trim(),
        description: description.trim(),
        start_date: formatDateLocal(startDate),
        end_date: endDate ? formatDateLocal(endDate) : null,
      });
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Назва проєкту <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              onInvalid={e => e.target.setCustomValidity('Будь ласка, заповніть це поле')}
              onInput={e => e.target.setCustomValidity('')}
              className="w-full border px-3 py-2 rounded"
              value={name}
              onBlur={() => setNameErr(validateNotEmpty(name))}
              onChange={e => setName(e.target.value)}
            />
            {nameErr && <p className="text-red-500 text-sm mt-1">{nameErr}</p>}
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
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Дата початку <span className="text-red-500">*</span></label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="дд.мм.рррр"
              className="w-full border px-3 py-2 rounded"
              required
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
