import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChartPieIcon,
  FolderIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

import useUserRole from '../hooks/useUserRole';

export default function Sidebar() {
  const role = useUserRole();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = label => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  if (role === null) {
    return <div className="text-white p-4">Завантаження меню...</div>;
  }

  const links = [
    {
      label: 'Дашборд',
      icon: ChartPieIcon,
      to: '/dashboard',
      children: [
        { label: 'Огляд', to: '/dashboard/overview/dashboard' },
      ]
    },
    {
      label: 'Проєкти',
      icon: FolderIcon,
      to: '/project',
      children: [
        { label: 'Усі проєкти', to: '/project/projects' },
      ]
    },
    {
      label: 'Завдання',
      icon: ClipboardDocumentIcon,
      to: '/task',
      children: [
        ...(role === 'Manager'
          ? [{ label: 'Перегляд', to: '/task/tasks' }]
          : []),
        { label: 'Мої задачі', to: '/task/myTasks' },
      ]
    },
    {
      label: 'Підрозділ',
      icon: UserGroupIcon,
      to: '/department',
      children: [
        { label: 'Мій аккаунт', to: '/department/account' },
        ...(role === 'Manager'
          ? [
              { label: 'Співробітники', to: '/department/employees' },
              { label: 'Відділи', to: '/department/departments' },
              { label: 'Посади', to: '/department/positions' },
            ]
          : [])
      ]
    },
  ];

  // Видалити пункти без дітей (наприклад, Аналітика у Worker)
  const filteredLinks = links.filter(link => !link.children || link.children.length > 0);

  return (
    <aside className={`transition-all duration-300 bg-gray-800 border-r border-gray-700 text-gray-200 h-screen ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0`}> 
      <div className="h-16 flex items-center px-3 space-x-3">
        <button onClick={() => setCollapsed(!collapsed)} className="text-white focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 6.75h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>
        {!collapsed && <span className="text-2xl font-bold">Industrium</span>}
      </div>
      <nav className="mt-4">
        {filteredLinks.map(({ label, icon: Icon, to, children }) => (
          <div key={label} className="mb-1">
            {children ? (
              <button
                onClick={() => toggleMenu(label)}
                className="w-full flex items-center px-3 py-2 rounded hover:bg-gray-700 focus:outline-none"
              >
                <Icon className="h-6 w-6 flex-shrink-0 transition-none" />
                <span className={`ml-3 flex-1 text-left overflow-hidden whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>
                  {label}
                </span>
                {!collapsed && (
                  <ChevronDownIcon
                    className={`h-5 w-5 ml-auto transform transition-transform ${openMenus[label] ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
            ) : (
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
                }
              >
                <Icon className="h-6 w-6 flex-shrink-0 transition-none" />
                <span className={`ml-3 flex-1 text-left overflow-hidden whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>
                  {label}
                </span>
              </NavLink>
            )}
            {!collapsed && children && openMenus[label] && (
              <nav className="mt-1 space-y-1 pl-8">
                {children.map(child => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      `block px-3 py-1 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
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
