import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DatePicker, { registerLocale } from 'react-datepicker';
import uk from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';
import { validateNotEmpty } from '../../utils/validators';

registerLocale('uk', uk);

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [errors, setErrors] = useState({
    name: null,
    startDate: null,
    endDate: null,
    submit: null
  });

  useEffect(() => {
    api.get(`/projects/${id}/`)
      .then(({ data }) => {
        setName(data.name);
        setDescription(data.description);
        setStartDate(new Date(data.start_date));
        if (data.end_date) setEndDate(new Date(data.end_date));
      })
      .catch(() => {
        setErrors(e => ({ ...e, submit: 'Не вдалося завантажити дані проєкту' }));
      });
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();

    const newErrors = {
      name: validateNotEmpty(name),
      startDate: startDate ? null : 'Оберіть дату початку',
      endDate: null,
      submit: null
    };

    if (endDate && startDate && endDate < startDate) {
      newErrors.endDate = 'Дата завершення не може бути раніше за початок';
    }

    setErrors(newErrors);
    if (Object.values(newErrors).some(e => e)) return;

    const formatDateLocal = date => {
      const local = new Date(date);
      local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
      return local.toISOString().split('T')[0];
    };

    const payload = {
      name: name.trim(),
      description: description.trim(),
      start_date: formatDateLocal(startDate),
      end_date: endDate ? formatDateLocal(endDate) : null
    };

    try {
      await api.put(`/projects/${id}/`, payload);
      navigate('/project/projects');
    } catch (err) {
      if (err.response?.status === 400) {
        const msg = Object.entries(err.response.data)
          .map(([f, msgs]) => `${f}: ${msgs.join(' ')}`)
          .join('\n');
        setErrors(e => ({ ...e, submit: msg }));
      } else {
        setErrors(e => ({ ...e, submit: 'Не вдалося оновити проєкт' }));
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded overflow-auto">
      <h1 className="text-xl font-semibold mb-4">Редагувати проєкт</h1>
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
              onChange={e => setName(e.target.value)}
              onBlur={() => setErrors(e => ({ ...e, name: validateNotEmpty(name) }))}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
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
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>

        <div className="md:col-span-2">
          {errors.submit && <p className="text-red-500 whitespace-pre-line mb-4">{errors.submit}</p>}
          <div className="flex space-x-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Зберегти</button>
            <button type="button" onClick={() => navigate('/project/projects')} className="px-6 py-2 border rounded hover:bg-gray-100">Скасувати</button>
          </div>
        </div>
      </form>
    </div>
  );
}
