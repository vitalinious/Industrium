import React, { useEffect, useState, useRef } from 'react';
import {
  BellIcon,
  Bars3Icon as MenuIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

const titles = {
  '/department/account': 'Мій акаунт',
  '/dashboard/overview/dashboard': 'Дашборд',
  '/project/projects': 'Проєкти',
  '/department/employees': 'Співробітники',
  '/department/departments': 'Відділи',
  '/department/positions': 'Посади',
  '/task/tasks': 'Завдання',
};

export default function Header() {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Industrium';
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const popoverRef = useRef(null);
  const logoutMenuRef = useRef(null);

  useEffect(() => {
    api.get('/notifications/unread/').then(res => setNotifications(res.data));
  }, []);

  useEffect(() => {
    api.get('/auth/profile/')
      .then(res => setCurrentUser(res.data))
      .catch(err => console.error('Не вдалося отримати користувача', err));
  }, []);

  useEffect(() => {
    const handler = e => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false);
      }
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(e.target)) {
        setShowLogoutMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    api.post('/auth/logout/')
      .finally(() => {
        localStorage.removeItem('access_token');
        navigate('/login');
      });
  };

  return (
    <header className="h-16 bg-white shadow border-b border-gray-600 flex items-center px-6 justify-between relative z-50">
      <div className="flex items-center">
        <MenuIcon className="h-6 w-6 text-gray-600 mr-4 md:hidden" />
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center space-x-4 relative">
        {/* Сповіщення */}
        <button onClick={() => setShowPopover(!showPopover)} className="relative">
          <BellIcon className="h-6 w-6 text-gray-600 cursor-pointer" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
              {notifications.length}
            </span>
          )}
        </button>

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

        <div className="flex items-center space-x-2">
          <span className="hidden md:block text-gray-700">
            {currentUser
              ? `${currentUser.last_name} ${currentUser.first_name} ${currentUser.middle_name || ''}`
              : '...'}
          </span>

          <div className="relative" ref={logoutMenuRef}>
            <ArrowRightOnRectangleIcon
              className="h-6 w-6 text-red-600 cursor-pointer"
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            />
            {showLogoutMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border shadow-lg rounded p-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  Вийти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
