import React from 'react';
import Sidebar from './Sidebar';
import Header  from './Header';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Основна частина: header + контент */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Header />
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}