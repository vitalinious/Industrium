import React, { useEffect, useState, useRef } from 'react';
import {
  BellIcon,
  Bars3Icon as MenuIcon,
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

const titles = {
  '/account': 'Мій акаунт',
  '/positions': 'Посади',
  '/dashboard': 'Дашборд',
  '/projects': 'Проєкти',
  // додай інші за потреби
};

export default function Header() {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Industrium';
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    // Отримати непрочитані сповіщення
    api.get('/notifications/unread/').then(res => setNotifications(res.data));
  }, []);

  // Закрити popover при кліку поза ним
  useEffect(() => {
    const handler = e => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white shadow border-b border-gray-600 flex items-center px-6 justify-between relative z-50">
      <div className="flex items-center">
        <MenuIcon className="h-6 w-6 text-gray-600 mr-4 md:hidden" />
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center space-x-4 relative">
        <button onClick={() => setShowPopover(!showPopover)} className="relative">
          <BellIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
              {notifications.length}
            </span>
          )}
        </button>

        {/* POPUP */}
        {showPopover && (
          <div
            ref={popoverRef}
            className="absolute right-0 mt-2 w-72 bg-white border shadow-lg rounded p-2 top-10 z-50"
          >
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Немає нових сповіщень</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/task/tasks/${n.task_id}`)}
                >
                  <div className="font-medium text-sm">{n.task_title}</div>
                  <div className="text-xs text-gray-500">
                    {n.sender_name} — {new Date(n.created_at).toLocaleString('uk-UA')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex items-center space-x-2 cursor-pointer">
          <span className="hidden md:block text-gray-700">---</span>
        </div>
      </div>
    </header>
  );
}
