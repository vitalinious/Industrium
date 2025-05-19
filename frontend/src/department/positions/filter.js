import React, { useState, useEffect } from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import api from '../../api';

export default function FilterPopover({ onFilter }) {
  const [nameQuery, setNameQuery]         = useState('');
  const [deptList, setDeptList]           = useState([]);
  const [selectedDept, setSelectedDept]   = useState('');
  const [suggestions, setSuggestions]     = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);

  // 1. Підвантажуємо доступні відділи
  useEffect(() => {
    api.get('/departments/')
      .then(res => setDeptList(res.data))
      .catch(() => setDeptList([]));
  }, []);

  // 2. Автодоповнення по назві в межах selectedDept
  useEffect(() => {
    if (!nameQuery) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      api.get('/positions/suggest/', {
        params: {
          name: nameQuery,
          ...(selectedDept && { department: selectedDept }),
        }
      })
      .then(res => setSuggestions(res.data))
      .catch(() => setSuggestions([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [nameQuery, selectedDept]);

  const handleNameSelect = (name) => {
    if (!selectedNames.includes(name)) {
      setSelectedNames(prev => [...prev, name]);
    }
    setNameQuery('');
    setSuggestions([]);
  };

  const handleRemoveName = i =>
    setSelectedNames(prev => prev.filter((_, idx) => idx !== i));

  const handleClearAll = () => {
    setSelectedNames([]);
    setSelectedDept('');
  };

  const applyFilter = () => {
    api.get('/positions/', {
      params: {
        ...(selectedDept && { department: selectedDept }),
        ...(selectedNames.length > 0 && { name: selectedNames.join(',') }),
      }
    })
    .then(res => onFilter(res.data))
    .catch(err => console.error('Помилка фільтрації:', err));
  };

  return (
    <Popover className="relative">
      <Popover.Button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800 flex items-center">
        Фільтри <ChevronDownIcon className="w-4 h-4 ml-2" />
      </Popover.Button>
      <Popover.Panel className="absolute right-0 z-20 mt-2 w-80 bg-white p-4 rounded-md shadow-lg border border-gray-300">
        {/* Фільтр за відділом */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Відділ
        </label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          <option value="">Усі відділи</option>
          {deptList.map(dep => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
            </option>
          ))}
        </select>

        {/* Фільтр за назвою з автодоповненням */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Назва посади
        </label>
        <input
          type="text"
          value={nameQuery}
          onChange={e => setNameQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Почніть вводити..."
        />
        {suggestions.length > 0 && (
          <ul className="max-h-40 overflow-auto border rounded mb-2 text-sm">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleNameSelect(s.name)}
                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}

        {/* Вибрані назви */}
        {selectedNames.length > 0 && (
          <div className="mb-3 text-sm text-gray-800">
            <div className="font-medium text-gray-600 mb-1">Обрано назви:</div>
            <ul className="space-y-1">
              {selectedNames.map((name, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded"
                >
                  <span>{name}</span>
                  <button
                    onClick={() => handleRemoveName(i)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleClearAll}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Очистити всі фільтри
            </button>
          </div>
        )}

        <button
          onClick={applyFilter}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Фільтрувати
        </button>
      </Popover.Panel>
    </Popover>
  );
}