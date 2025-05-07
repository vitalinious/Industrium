import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout     from './layout/Layout';
import Login      from './login';
import Account    from './account';
import Dashboard  from './Dashboard';
import Positions from './department/positions/positions';
import CreatePosition from './department/positions/add';

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
          <Route path="department/positions" element={<Positions />} />
          <Route path="department/positions/add" element={<CreatePosition />} />
        </Route>

        {/* Усі інші шляхи редіректять на логін */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}