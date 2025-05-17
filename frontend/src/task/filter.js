// 💡 TaskFilterPopover з автодоповненням для назви задачі, відповідального та проєкту (оновлено для мультивибору)
import React, { useState, useEffect } from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import api from '../api';

import DatePicker, { registerLocale } from 'react-datepicker';
import uk from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('uk', uk);

export default function TaskFilterPopover({ onFilter }) {
  const [titleQuery, setTitleQuery] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);

  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [assigneeSuggestions, setAssigneeSuggestions] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);

  const [projectQuery, setProjectQuery] = useState('');
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const [statuses, setStatuses] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const STATUS_OPTIONS = [
    { value: 'InProgress', label: 'В роботі' },
    { value: 'Completed', label: 'Завершено' },
    { value: 'PendingConfirmation', label: 'Очікує підтвердження' },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      if (titleQuery) {
        api.get(`/tasks/suggest/?title=${titleQuery}`)
          .then(res => setTitleSuggestions(res.data))
          .catch(() => setTitleSuggestions([]));
      } else {
        setTitleSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [titleQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (assigneeQuery) {
        api.get(`/employees/suggest/?name=${assigneeQuery}`)
          .then(res => setAssigneeSuggestions(res.data))
          .catch(() => setAssigneeSuggestions([]));
      } else {
        setAssigneeSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [assigneeQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (projectQuery) {
        api.get(`/projects/suggest/?name=${projectQuery}`)
          .then(res => setProjectSuggestions(res.data))
          .catch(() => setProjectSuggestions([]));
      } else {
        setProjectSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [projectQuery]);

  const toggleStatus = status => {
    setStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearAll = () => {
    setSelectedTitles([]);
    setTitleQuery('');
    setStatuses([]);
    setSelectedProjects([]);
    setProjectQuery('');
    setSelectedAssignees([]);
    setAssigneeQuery('');
    setStartDate('');
    setDueDate('');
  };

  const applyFilter = async () => {
    try {
      const params = {};
      if (selectedTitles.length) params.ids = selectedTitles.map(t => t.id).join(',');
      if (statuses.length) params.status = statuses.join(',');
      if (selectedProjects.length) params.project = selectedProjects.map(p => p.id).join(',');
      if (selectedAssignees.length) params.assignee = selectedAssignees.map(a => a.id).join(',');
      if (startDate) params.start_from = startDate.toISOString().slice(0, 10);
      if (dueDate) params.due_to = dueDate.toISOString().slice(0, 10);

      const { data } = await api.get('tasks/', { params });
      onFilter(data);
    } catch (err) {
      console.error('Filter error', err);
    }
  };

  const handleSelect = (item, setSelected, setQuery) => {
    setSelected(prev => prev.find(p => p.id === item.id) ? prev : [...prev, item]);
    setQuery('');
  };

  const handleRemove = (index, setSelected) => {
    setSelected(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Popover className="relative">
      <Popover.Button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800 flex items-center">
        Фільтри <ChevronDownIcon className="w-4 h-4 ml-1" />
      </Popover.Button>

      <Popover.Panel className="absolute right-0 z-20 mt-2 w-96 bg-white p-4 rounded shadow-lg border">
        <label className="block text-sm mb-1">Назва задачі</label>
        <input
          type="text"
          value={titleQuery}
          onChange={e => setTitleQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Пошук за назвою..."
        />
        <ul className="max-h-32 overflow-y-auto border rounded mb-2">
          {titleSuggestions.map((task, i) => (
            <li key={i} onClick={() => handleSelect(task, setSelectedTitles, setTitleQuery)} className="px-3 py-1 hover:bg-gray-100 cursor-pointer">
              {task.title}
            </li>
          ))}
        </ul>
        {selectedTitles.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600">Обрано:</div>
            <ul className="space-y-1">
              {selectedTitles.map((t, i) => (
                <li key={i} className="flex justify-between bg-gray-100 px-2 py-1 rounded">
                  {t.title}
                  <button onClick={() => handleRemove(i, setSelectedTitles)} className="text-red-500 text-xs">✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}

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

        <div className="mb-3">
          <label className="block text-sm mb-1">Відповідальний</label>
          <input
            type="text"
            value={assigneeQuery}
            onChange={e => setAssigneeQuery(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Пошук працівника..."
          />
          <ul className="max-h-32 overflow-y-auto border rounded mb-2">
            {assigneeSuggestions.map((a, i) => (
              <li key={i} onClick={() => handleSelect(a, setSelectedAssignees, setAssigneeQuery)} className="px-3 py-1 hover:bg-gray-100 cursor-pointer">
                {a.full_name}
              </li>
            ))}
          </ul>
          {selectedAssignees.length > 0 && (
            <ul className="space-y-1 mb-3">
              {selectedAssignees.map((a, i) => (
                <li key={i} className="flex justify-between bg-gray-100 px-2 py-1 rounded">
                  {a.full_name}
                  <button onClick={() => handleRemove(i, setSelectedAssignees)} className="text-red-500 text-xs">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Проєкт</label>
          <input
            type="text"
            value={projectQuery}
            onChange={e => setProjectQuery(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Пошук проєкту..."
          />
          <ul className="max-h-32 overflow-y-auto border rounded mb-2">
            {projectSuggestions.map((p, i) => (
              <li key={i} onClick={() => handleSelect(p, setSelectedProjects, setProjectQuery)} className="px-3 py-1 hover:bg-gray-100 cursor-pointer">
                {p.name}
              </li>
            ))}
          </ul>
          {selectedProjects.length > 0 && (
            <ul className="space-y-1 mb-3">
              {selectedProjects.map((p, i) => (
                <li key={i} className="flex justify-between bg-gray-100 px-2 py-1 rounded">
                  {p.name}
                  <button onClick={() => handleRemove(i, setSelectedProjects)} className="text-red-500 text-xs">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm mb-1">Дата початку</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="дд.мм.рррр"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Дедлайн</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={dueDate}
              onChange={date => setDueDate(date)}
              placeholderText="дд.мм.рррр"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button onClick={clearAll} className="text-xs text-blue-600 hover:underline">Очистити всі</button>
          <button onClick={applyFilter} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Фільтрувати</button>
        </div>
      </Popover.Panel>
    </Popover>
  );
}