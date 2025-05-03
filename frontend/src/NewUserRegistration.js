// src/NewUserRegistration.js
import React, { useState } from 'react';
import axios from 'axios';

export default function NewUserRegistration() {
  const [formData, setFormData] = useState({
    username: '', password: '', password2: '',
    first_name: '', last_name: '', middle_name: '',
    email: '', phone_number: '', department: '', position: ''
  });
  const [errors, setErrors]    = useState({});
  const [success, setSuccess]  = useState('');

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({}); setSuccess('');
    try {
      await axios.post(
        '/api/auth/create-employee/',
        formData
      );
      setSuccess('Працівника успішно створено');
      // очистить форму
      setFormData({
        username: '',
        first_name: '', last_name: '', middle_name: '',
        email: '', phone_number: '', department: '', position: ''
      });
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Помилка сервера'] });
    }
  };

  const inputClasses = `
    mt-1 block w-full px-3 py-2
    bg-gray-900 border border-gray-700
    rounded text-white
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold text-white">Створити працівника</h2>

      {/* Логін */}
      <div>
        <label className="block text-gray-200">Логін*</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Логін для входу"
        />
        {errors.username && <p className="text-red-600">{errors.username}</p>}
      </div>

      {/* Пароль */}
      <div>
        <label className="block text-gray-200">Пароль*</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Пароль"
        />
        {errors.password && <p className="text-red-600">{errors.password}</p>}
      </div>

      {/* Підтвердити пароль */}
      <div>
        <label className="block text-gray-200">Підтвердити пароль*</label>
        <input
          type="password"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Повторіть пароль"
        />
        {errors.password2 && <p className="text-red-600">{errors.password2}</p>}
      </div>

      {/* Ім'я */}
      <div>
        <label className="block text-gray-200">Ім'я*</label>
        <input
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Ім'я"
        />
        {errors.first_name && <p className="text-red-600">{errors.first_name}</p>}
      </div>

      {/* Прізвище */}
      <div>
        <label className="block text-gray-200">Прізвище*</label>
        <input
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Прізвище"
        />
        {errors.last_name && <p className="text-red-600">{errors.last_name}</p>}
      </div>

      {/* По батькові */}
      <div>
        <label className="block text-gray-200">По батькові</label>
        <input
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
          className={inputClasses}
          placeholder="По батькові"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-200">Електронна пошта*</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={inputClasses}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-red-600">{errors.email}</p>}
      </div>

      {/* Телефон */}
      <div>
        <label className="block text-gray-200">Номер телефону*</label>
        <input
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className={inputClasses}
          placeholder="+380XXXXXXXXX"
        />
        {errors.phone_number && <p className="text-red-600">{errors.phone_number}</p>}
      </div>

      {/* Відділ */}
      <div>
        <label className="block text-gray-200">Відділ*</label>
        <input
          name="department"
          value={formData.department}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Відділ"
        />
        {errors.department && <p className="text-red-600">{errors.department}</p>}
      </div>

      {/* Посада */}
      <div>
        <label className="block text-gray-200">Посада*</label>
        <input
          name="position"
          value={formData.position}
          onChange={handleChange}
          className={inputClasses}
          placeholder="Посада"
        />
        {errors.position && <p className="text-red-600">{errors.position}</p>}
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Зареєструвати
      </button>
    </form>
  );
}