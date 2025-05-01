import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    try {
      await axios.post('http://localhost:8000/api/auth/register/', formData);
      // Після успішної реєстрації — перенаправимо на логін
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Реєстрація</h2>

      <label>Username</label>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      {errors.username && <p style={{color: 'red'}}>{errors.username}</p>}

      <label>Email</label>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      {errors.email && <p style={{color: 'red'}}>{errors.email}</p>}

      <label>Password</label>
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
      />
      {errors.password && <p style={{color: 'red'}}>{errors.password}</p>}

      <label>Confirm Password</label>
      <input
        name="password2"
        type="password"
        value={formData.password2}
        onChange={handleChange}
      />
      {errors.password2 && <p style={{color: 'red'}}>{errors.password2}</p>}

      <label>Role</label>
      <input
        name="role"
        value={formData.role}
        onChange={handleChange}
        placeholder="Наприклад: manager"
      />
      {errors.role && <p style={{color: 'red'}}>{errors.role}</p>}

      <button type="submit" style={{ marginTop: 16 }}>Зареєструватися</button>
    </form>
  );
}
