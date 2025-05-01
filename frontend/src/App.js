import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Login     from './Login';
import EmployeeDashboard from './EmployeeDashboard';
import ChiefDashboard from './ChiefDashboard';

export default function App(){
  return (
    <Router>
      <Routes>
     <Route path="/"         element={<Navigate to="/login" />} />
     <Route path="/login"    element={<Login />} />
     <Route path="/employee" element={<EmployeeDashboard />} />
     <Route path="/chief"    element={<ChiefDashboard />} />
   </Routes>
    </Router>
  );
}