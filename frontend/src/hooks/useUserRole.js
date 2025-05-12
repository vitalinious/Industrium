import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useUserRole() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role || null);
      } catch (err) {
        console.error('Помилка токена:', err);
        setRole(null); // важливо!
      }
    } else {
      setRole(null); // також обовʼязково
    }
  }, []);

  return role;
}