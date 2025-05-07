import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header  from './Header';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* Основна частина: header + контент */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-200 p-6">
          {/* Тут відображається вміст поточної сторінки */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
