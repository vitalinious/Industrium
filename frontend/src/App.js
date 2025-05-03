import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout   from './Layout';
import Login    from './Login';
import Account from './account';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публічні */}
        <Route path="/login" element={<Login />} />

        <Route path="/account" element={
          <Layout>
            <Account />
          </Layout>
        }/>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
