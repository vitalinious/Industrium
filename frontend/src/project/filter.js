import React, { useState, useEffect } from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import api from '../api';

import DatePicker, { registerLocale } from 'react-datepicker';
import uk from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('uk', uk);

export default function ProjectFilterPopover({ onFilter }) {
  const [nameQuery, setNameQuery] = useState('');
  const [nameSuggestions, setSuggestions] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [startFrom, setStartFrom] = useState('');
  const [startTo, setStartTo] = useState('');

  const STATUS_OPTIONS = [
    { value: 'Planned', label: 'Заплановано' },
    { value: 'In Progress', label: 'В роботі' },
    { value: 'Completed', label: 'Завершено' }
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      if (nameQuery) {
        api.get(`/projects/suggest/?name=${nameQuery}`)
           .then(res => setSuggestions(res.data))
           .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [nameQuery]);

  useEffect(() => {
    api.get('/departments/').then(r => setDepartments(r.data)).catch(() => setDepartments([]));
  }, []);

  const handleSelectProject = item => {
    if (!selectedProjects.find(p => p.id === item.id)) {
      setSelectedProjects(prev => [...prev, item]);
    }
    setNameQuery('');
    setSuggestions([]);
  };
  const removeProject = idx => setSelectedProjects(prev => prev.filter((_, i) => i !== idx));
  const toggleStatus = status => {
    setStatuses(prev => prev.includes(status)
      ? prev.filter(s => s !== status)
      : [...prev, status]);
  };
  const clearAll = () => {
    setSelectedProjects([]);
    setDepartmentId('');
    setStatuses([]);
    setStartFrom('');
    setStartTo('');
  };

  const applyFilter = async () => {
    try {
      const params = {};
      if (selectedProjects.length) {
        params.ids = selectedProjects.map(p => p.id).join(',');
      }
      if (departmentId) params.department = departmentId;
      if (statuses.length) params.status = statuses.join(',');
      if (startFrom) params.start_from = startFrom.toISOString().slice(0, 10);
      if (startTo) params.start_to = startTo.toISOString().slice(0, 10);

      const { data } = await api.get('/projects/', { params });
      onFilter(data);
    } catch (err) {
      console.error('Filter error', err);
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800 flex items-center">
        Фільтри <ChevronDownIcon className="w-4 h-4 ml-1" />
      </Popover.Button>

      <Popover.Panel className="absolute right-0 z-20 mt-2 w-80 bg-white p-4 rounded shadow-lg border">
        <label className="block text-sm mb-1">Назва проєкту</label>
        <input
          type="text"
          value={nameQuery}
          onChange={e => setNameQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Пошук за назвою..."
        />
        {nameSuggestions.length > 0 && (
          <ul className="max-h-32 overflow-y-auto border rounded mb-2">
            {nameSuggestions.map((p, i) => (
              <li
                key={i}
                onClick={() => handleSelectProject(p)}
                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}
        {selectedProjects.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600">Обрано:</div>
            <ul className="space-y-1">
              {selectedProjects.map((p, i) => (
                <li key={i} className="flex justify-between bg-gray-100 px-2 py-1 rounded">
                  {p.name}
                  <button onClick={() => removeProject(i)} className="text-red-500 text-xs">✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm mb-1">Відділ</label>
          <select
            className="w-full p-2 border rounded"
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
          >
            <option value="">Будь-який</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Статус</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleStatus(opt.value)}
                className={`px-3 py-1 rounded border text-sm ${
                  statuses.includes(opt.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm mb-1">З дати</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={startFrom}
              onChange={date => setStartFrom(date)}
              placeholderText="дд.мм.рррр"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">По дату</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={startTo}
              onChange={date => setStartTo(date)}
              placeholderText="дд.мм.рррр"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:underline"
          >
            Очистити всі
          </button>
          <button
            onClick={applyFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Фільтрувати
          </button>
        </div>
      </Popover.Panel>
    </Popover>
  );
}
