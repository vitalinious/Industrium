import React from 'react';
import NewUserRegistration from './NewUserRegistration';

export default function ChiefDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Панель начальника</h1>
      <NewUserRegistration />
    </div>
  );
}