import React, { useState } from 'react';
import axios from 'axios';

export default function NewUserRegistration() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: '', role: 'employee'
  });
  const [errors, setErrors]  = useState({});
  const [success, setSuccess]= useState('');

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({}); setSuccess('');
    try {
      // Здесь axios уже имеет default Authorization с access-token
      await axios.post(
        'http://localhost:8000/api/auth/register/',
        formData
      );
      setSuccess('Користувача успішно створено');
      setFormData({ username: '', email: '', password: '', password2: '', role: 'employee' });
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Помилка сервера'] });
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-semibold mb-4">Створити працівника</h2>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* username, email, password, password2 */}
        <div>
          <label className="block text-sm">Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
          {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}
        </div>
        {/* Поле Email */}
        <div>
          <label className="block text-sm">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
        </div>
        {/* Password */}
        <div>
          <label className="block text-sm">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
        </div>
        {/* Confirm Password */}
        <div>
          <label className="block text-sm">Confirm Password</label>
          <input
            name="password2"
            type="password"
            value={formData.password2}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded"
          />
          {errors.password2 && <p className="text-red-600 text-sm">{errors.password2}</p>}
        </div>
        {/* Роль тільки “employee” (не даємо вибору менеджеру для нових) */}
        <input type="hidden" name="role" value="employee" />
        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Зареєструвати
        </button>
      </form>
    </div>
  );
}
