import React, { useState, useEffect } from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import api from '../../api';

export default function FilterPopover({ onFilter }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 0) {
        api.get(`/departments/suggest/?name=${query}`)
          .then(res => setSuggestions(res.data))
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (value) => {
    if (!selectedItems.includes(value)) {
      setSelectedItems(prev => [...prev, value]);
    }
    setQuery('');
    setSuggestions([]);
  };

  const handleRemove = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedItems([]);
  };

  const handleFilterClick = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/departments/', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          name: selectedItems.join(',')
        }
      });
      console.log('filtered result:', response.data);
      onFilter(response.data);
    } catch (error) {
      console.error('Фільтрація не вдалася', error);
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800 flex items-center">
        Фільтри <ChevronDownIcon className="w-4 h-4 ml-2" />
      </Popover.Button>

      <Popover.Panel className="absolute right-0 z-20 mt-2 w-72 bg-white p-4 rounded-md shadow-lg border border-gray-300">
        <label className="block text-sm mb-1 text-gray-700">Назва відділу</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        {suggestions.length > 0 && (
          <ul className="bg-white max-h-40 overflow-y-auto border border-gray-300 rounded text-sm">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelect(s.name)}
                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}

        {selectedItems.length > 0 && (
          <div className="mt-3 text-sm text-gray-800">
            <span className="font-medium text-gray-600">Обрано:</span>
            <ul className="mt-1 space-y-1">
              {selectedItems.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded">
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="text-red-500 text-xs ml-2 hover:underline"
                    title="Видалити"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleClearAll}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Очистити все
            </button>
          </div>
        )}

        <button
          onClick={handleFilterClick}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Фільтрувати
        </button>
      </Popover.Panel>
    </Popover>
  );
}