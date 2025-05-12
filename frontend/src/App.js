import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout            from      './layout/Layout';
import Login             from      './login';
import Account           from      './department/account';
import Dashboard         from      './Dashboard';

import Positions         from      './department/positions/positions';
import CreatePosition    from      './department/positions/add';
import EditPosition      from      './department/positions/edit';

import Departments       from      './department/departments/departments';
import CreateDepartment  from      './department/departments/add';
import EditDepartment    from      './department/departments/edit';

import Employees         from      './department/employees/employees';
import CreateEmployee    from      './department/employees/add';
import EditEmployee      from      './department/employees/edit';

import Projects          from      './project/projects/projects'
import CreateProject     from      './project/projects/add'
import EditProject       from      './project/projects/edit'

import Tasks          from         './task/tasks/tasks'
import CreateTask     from         './project/projects/add'
import EditTask      from          './project/projects/edit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публічні сторінки */}
        <Route path="/login" element={<Login />} />

        {/* Захищені сторінки під Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="department/account"                element={<Account />} />
          
          <Route path="department/positions"              element={<Positions />} />
          <Route path="department/positions/add"          element={<CreatePosition />} />
          <Route path="department/positions/edit/:id"     element={<EditPosition />} />

          <Route path="department/departments"            element={<Departments />} />
          <Route path="department/departments/add"        element={<CreateDepartment />} />
          <Route path="department/departments/edit/:id"   element={<EditDepartment />} />

          <Route path="department/employees"              element={<Employees />} />
          <Route path="department/employees/add"          element={<CreateEmployee />} />
          <Route path="department/employees/edit/:id"     element={<EditEmployee />} />

          <Route path="project/projects"                  element={<Projects />} />
          <Route path="project/projects/add"              element={<CreateProject />} />
          <Route path="project/projects/edit/:id"         element={<EditProject />} />

          <Route path="task/tasks"                        element={<Tasks />} />
          <Route path="task/tasks/add"                    element={<CreateTask />} />
          <Route path="task/tasks/edit/:id"               element={<EditTask />} />
        </Route>

        {/* Усі інші шляхи редіректять на логін */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}