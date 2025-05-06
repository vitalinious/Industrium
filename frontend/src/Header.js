import React from 'react';
import {
    BellIcon,
    Bars3Icon as MenuIcon,
  } from '@heroicons/react/24/outline'

export default function Header() {
  return (
    <header className="h-16 bg-white shadow border-b border-gray-600 flex items-center px-6 justify-between">
      <div className="flex items-center">
        <MenuIcon className="h-6 w-6 text-gray-600 mr-4 md:hidden" />
        <h1 className="text-xl font-semibold">Мій акаунт</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <BellIcon className="h-6 w-6 text-gray-600 cursor-pointer" />

        <div className="flex items-center space-x-2 cursor-pointer">
          <span className="hidden md:block text-gray-700">
            ---
          </span>
        </div>
      </div>
    </header>
  );
}
