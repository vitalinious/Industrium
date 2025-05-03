import React, { useState } from 'react';
import { NavLink }        from 'react-router-dom';
import {
  ChartPieIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  // 1) Опишите свои пункты, указывая подменю в children
  const links = [
    {
      label: 'Дашборд',
      icon: ChartPieIcon,
      to: '/dashboard',
      children: [
        { label: 'Огляд',      to: '/dashboard/overview' },
        { label: 'Статистика', to: '/dashboard/stats' },
      ]
    },
    {
      label: 'Проєкти',
      icon: FolderIcon,
      to: '/projects',
      children: [
        { label: 'Усі проєкти',    to: '/projects/all' },
        { label: 'Мої проєкти',    to: '/projects/mine' },
        { label: 'Архівовані',     to: '/projects/archived' },
      ]
    },
    {
      label: 'Завдання',
      icon: ClipboardDocumentIcon,
      to: '/tasks',
      children: [
        { label: 'Нові',          to: '/tasks/new' },
        { label: 'В роботі',      to: '/tasks/in-progress' },
        { label: 'Завершені',     to: '/tasks/done' },
      ]
    },
    {
      label: 'Аналітика',
      icon: ChartBarIcon,
      to: '/analytics',
      children: [
        { label: 'Звіти',         to: '/analytics/reports' },
        { label: 'Порівняння',    to: '/analytics/comparison' },
      ]
    },
    {
      label: 'Працівники',
      icon: UserGroupIcon,
      to: '/employees',
      children: [
        { label: 'Список',        to: '/employees/list' },
        { label: 'Створити',      to: '/employees/create' },
      ]
    },
  ];

   const [openMenus, setOpenMenus] = useState({});

   const toggleMenu = label => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <aside className="w-64 bg-gray-800 text-gray-200 flex-shrink-0">
      <div className="h-16 flex items-center justify-center text-2xl font-bold">
        Industrium
      </div>
      <nav className="mt-4">
      {links.map(({ label, icon: Icon, to, children }) => (
        <div key={label} className="mb-1">
          {children ? (
            <button
              onClick={() => toggleMenu(label)}
              className="w-full flex items-center px-3 py-2 rounded hover:bg-gray-800 focus:outline-none"
            >
              <Icon className="h-5 w-5 mr-2" />
              <span className="flex-1 text-left">{label}</span>
              <ChevronDownIcon
                className={`h-4 w-4 transform transition-transform ${
                  openMenus[label] ? 'rotate-180' : ''
                }`}
              />
            </button>
          ) : (
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded hover:bg-gray-800 ${
                  isActive ? 'bg-gray-800' : ''
                }`
              }
            >
              <Icon className="h-5 w-5 mr-2" />
              <span>{label}</span>
            </NavLink>
          )}
          {children && openMenus[label] && (
            <nav className="mt-1 space-y-1 pl-8">
              {children.map(child => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className={({ isActive }) =>
                    `block px-3 py-1 rounded hover:bg-gray-800 ${
                      isActive ? 'bg-gray-800' : ''
                    }`
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      ))}
      </nav>
    </aside>
  );
}
