import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout     from './Layout';
import Login      from './Login';
import Account    from './account';
import Dashboard  from './Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публічні сторінки */}
        <Route path="/login" element={<Login />} />

        {/* Захищені сторінки під Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="account" element={<Account />} />
          {/* Додайте тут інші сторінки як вкладені */}
        </Route>

        {/* Усі інші шляхи редіректять на логін */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}