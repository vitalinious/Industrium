import React, { useState, useEffect } from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import api from '../../api';

import DatePicker, { registerLocale } from 'react-datepicker';
import uk from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('uk', uk);

export default function FilterPopover({ onFilter }) {
  const [nameQuery, setNameQuery]         = useState('');
  const [nameSuggestions, setSuggestions] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions]     = useState([]);

  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId]     = useState('');

  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo,   setJoinedTo]   = useState('');

  // автопідказки по імені…
  useEffect(() => {
    const t = setTimeout(() => {
      if (nameQuery) {
        api.get(`/employees/suggest/?name=${nameQuery}`)
           .then(res => setSuggestions(res.data))
           .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [nameQuery]);

  // відділи/посади…
  useEffect(() => {
    api.get('/departments/').then(r=>setDepartments(r.data)).catch(()=>setDepartments([]));
    api.get('/positions/').then(r=>setPositions(r.data)).catch(()=>setPositions([]));
  }, []);

  const handleSelectName = item => {
    if (!selectedNames.find(n=>n.id===item.id)) {
      setSelectedNames(prev=>[...prev,item]);
    }
    setNameQuery('');
    setSuggestions([]);
  };
  const removeName = idx => setSelectedNames(prev=>prev.filter((_,i)=>i!==idx));
  const clearAll = () => {
    setSelectedNames([]);
    setDepartmentId(''); setPositionId('');
    setJoinedFrom(''); setJoinedTo('');
  };

  const applyFilter = async () => {
    try {
      const params = {};
      if (selectedNames.length) {
        params.ids = selectedNames.map(n => n.id).join(',');
      }
      if (departmentId) params.department = departmentId;
      if (positionId)   params.position   = positionId;
      if (joinedFrom) params.joined_from = joinedFrom.toISOString().slice(0,10);
      if (joinedTo)   params.joined_to   = joinedTo.toISOString().slice(0,10);

      const { data } = await api.get('/employees/', { params });
      onFilter(data);
    } catch (err) {
      console.error('Filter error', err);
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-800 flex items-center">
        Фільтри <ChevronDownIcon className="w-4 h-4 ml-1"/>
      </Popover.Button>

      <Popover.Panel className="absolute right-0 z-20 mt-2 w-80 bg-white p-4 rounded shadow-lg border">
        {/* ПІБ */}
        <label className="block text-sm mb-1">ПІБ</label>
        <input
          type="text"
          value={nameQuery}
          onChange={e=>setNameQuery(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="Пошук за прізвищем..."
        />
        {nameSuggestions.length>0 && (
          <ul className="max-h-32 overflow-y-auto border rounded mb-2">
            {nameSuggestions.map((u,i) => (
              <li
                key={i}
                onClick={()=>handleSelectName(u)}
                className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
              >
                {u.full_name}
              </li>
            ))}
          </ul>
        )}
        {selectedNames.length>0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600">Обрано:</div>
            <ul className="space-y-1">
              {selectedNames.map((n,i)=>(
                <li key={i} className="flex justify-between bg-gray-100 px-2 py-1 rounded">
                  {n.full_name}
                  <button onClick={()=>removeName(i)} className="text-red-500 text-xs">✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Відділ */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Відділ</label>
          <select
            className="w-full p-2 border rounded"
            value={departmentId}
            onChange={e=>setDepartmentId(e.target.value)}
          >
            <option value="">Будь-який</option>
            {departments.map(d=>(
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Посада */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Посада</label>
          <select
            className="w-full p-2 border rounded"
            value={positionId}
            onChange={e=>setPositionId(e.target.value)}
          >
            <option value="">Будь-яка</option>
            {positions
              .filter(p=>!departmentId || p.department===+departmentId)
              .map(p=>(
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
        </div>

        {/* Діапазон дат */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm mb-1">З дати</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={joinedFrom}
              onChange={date => setJoinedFrom(date)}
              placeholderText="дд.мм.рррр"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">По дату</label>
            <DatePicker
              locale="uk"
              dateFormat="dd.MM.yyyy"
              selected={joinedTo}
              onChange={date => setJoinedTo(date)}
              placeholderText="дд.мм.рррр"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Кнопки */}
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