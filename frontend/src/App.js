import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login     from './Login';
import Register  from './Register';
import Dashboard from './Dashboard';

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/login"    element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard"element={<Dashboard/>}/>
      </Routes>
    </Router>
  );
}