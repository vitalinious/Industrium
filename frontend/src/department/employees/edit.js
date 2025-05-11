// src/pages/department/EditEmployee.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputMask from 'react-input-mask';
import api from '../../api';

import {
  validateName,
  validateEmail,
  validatePhone,
  validateSelect
} from '../../utils/validators';

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ─── Поля форми ─────────────────────────────────────────────────────────────
  const [lastName,    setLastName]    = useState('');
  const [firstName,   setFirstName]   = useState('');
  const [middleName,  setMiddleName]  = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId,   setPositionId]   = useState('');
  const [role,         setRole]         = useState('Worker');

  // ─── Опції селектів ─────────────────────────────────────────────────────────
  const [departments, setDepartments] = useState([]);
  const [positions,   setPositions]   = useState([]);

  // ─── Стани помилок ───────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({
    lastName: null,
    firstName: null,
    middleName: null,
    email: null,
    phone: null,
    department: null,
    position: null,
    submit: null
  });

  // ─── Повідомлення для required ───────────────────────────────────────────────
  const attachRequiredMsg = e => e.target.setCustomValidity('Будь ласка, заповніть це поле');
  const clearRequiredMsg  = e => e.target.setCustomValidity('');

  // ─── Завантажуємо список відділів ────────────────────────────────────────────
  useEffect(() => {
    api.get('/departments/')
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  // ─── Підвантажуємо список посад при зміні відділу ─────────────────────────────
  useEffect(() => {
    if (!departmentId) {
      setPositions([]);
      setPositionId('');
      return;
    }
    api.get('/positions/', { params: { department: departmentId } })
      .then(res => setPositions(res.data))
      .catch(() => setPositions([]));
  }, [departmentId]);

  // ─── Завантажуємо дані співробітника і підставляємо в поля ────────────────────
  useEffect(() => {
    api.get(`/employees/${id}/`)
      .then(({ data }) => {
        // прізвище / ім’я / по-батькові
        setLastName(data.lastName ?? data.last_name ?? '');
        setFirstName(data.firstName ?? data.first_name ?? '');
        setMiddleName(data.middleName ?? data.middle_name ?? '');

        // email
        setEmail(data.email ?? '');

        // телефон
        const raw = data.phoneNumber ?? data.phone_number ?? '';
        const formatted = raw.length === 12
          ? `+${raw.slice(0,3)} (${raw.slice(3,5)}) ${raw.slice(5,8)}-${raw.slice(8,10)}-${raw.slice(10)}`
          : '';
        setPhone(formatted);

        // відділ та посада
        const deptId = typeof data.department === 'object'
          ? data.department.id
          : data.department;
        setDepartmentId(deptId);

        // одразу підтягуємо посади і встановлюємо поточну
        api.get('/positions/', { params: { department: deptId } })
          .then(res => {
            setPositions(res.data);
            const posId = typeof data.position === 'object'
              ? data.position.id
              : data.position;
            setPositionId(posId);
          })
          .catch(() => setPositions([]));

        // роль
        setRole(data.role ?? 'Worker');
      })
      .catch(err => {
        console.error('Не вдалося завантажити дані:', err);
        setErrors(e => ({ ...e, submit: 'Не вдалося завантажити дані співробітника' }));
      });
  }, [id]);

  // ─── Обробник сабміту ───────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    // перевіряємо всі поля
    const newErrors = {
      lastName:  validateName(lastName),
      firstName: validateName(firstName),
      middleName: middleName ? validateName(middleName) : null,
      email:     validateEmail(email),
      phone:     validatePhone(phone),
      department: validateSelect(departmentId, 'Будь ласка, оберіть відділ'),
      position:   validateSelect(positionId,   'Будь ласка, оберіть посаду'),
      submit:    null
    };
    setErrors(newErrors);

    // якщо є хоч одна помилка — не відправляємо
    if (Object.values(newErrors).some(v => v)) {
      return;
    }

    try {
      const payload = {
        last_name:   lastName.trim(),
        first_name:  firstName.trim(),
        middle_name: middleName.trim(),
        email:       email.trim(),
        phone_number: phone.replace(/\D/g, ''),
        department:  departmentId,
        position:    positionId,
        role
      };
      await api.put(`/employees/${id}/`, payload);
      navigate('/department/employees');
    } catch (err) {
      if (err.response?.status === 400) {
        const msg = Object.entries(err.response.data)
          .map(([f, msgs]) => `${f}: ${msgs.join(' ')}`)
          .join('\n');
        setErrors(e => ({ ...e, submit: msg }));
      } else {
        setErrors(e => ({ ...e, submit: 'Не вдалося оновити співробітника' }));
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded overflow-auto">
      <h1 className="text-xl font-semibold mb-4">Редагувати співробітника</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

        {/* Ліва колонка */}
        <div className="space-y-4">
          {/* Прізвище */}
          <div>
            <label className="block text-sm mb-1">
              Прізвище <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
              className="w-full border px-3 py-2 rounded"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              onBlur={() => setErrors(e => ({ ...e, lastName: validateName(lastName) }))}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Ім’я */}
          <div>
            <label className="block text-sm mb-1">
              Ім’я <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
              className="w-full border px-3 py-2 rounded"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              onBlur={() => setErrors(e => ({ ...e, firstName: validateName(firstName) }))}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* По-батькові */}
          <div>
            <label className="block text-sm mb-1">По-батькові</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={middleName}
              onChange={e => setMiddleName(e.target.value)}
              onBlur={() => setErrors(e => ({ ...e, middleName: validateName(middleName) }))}
            />
            {errors.middleName && (
              <p className="text-red-500 text-sm mt-1">{errors.middleName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setErrors(e => ({ ...e, email: validateEmail(email) }))}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Телефон */}
          <div>
            <label className="block text-sm mb-1">Телефон</label>
            <InputMask
              mask="+380 (99) 999-99-99"
              maskChar={null}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onBlur={() => setErrors(e => ({ ...e, phone: validatePhone(phone) }))}
            >
              {inputProps => (
                <input
                  {...inputProps}
                  type="tel"
                  className={`w-full border px-3 py-2 rounded ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+380 (__) ___-__-__"
                />
              )}
            </InputMask>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Права колонка */}
        <div className="space-y-4">
          {/* Відділ */}
          <div>
            <label className="block text-sm mb-1">
              Відділ <span className="text-red-500">*</span>
            </label>
            <select
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
              className="w-full border px-3 py-2 rounded"
              value={departmentId}
              onChange={e => {
                setDepartmentId(e.target.value);
                setErrors(e => ({ ...e, department: null }));
              }}
            >
              <option value="">Оберіть відділ</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {/* Посада */}
          <div>
            <label className="block text-sm mb-1">
              Посада <span className="text-red-500">*</span>
            </label>
            <select
              required
              onInvalid={attachRequiredMsg}
              onInput={clearRequiredMsg}
              className="w-full border px-3 py-2 rounded"
              value={positionId}
              onChange={e => {
                setPositionId(e.target.value);
                setErrors(e => ({ ...e, position: null }));
              }}
              disabled={!departmentId}
            >
              <option value="">
                {departmentId ? 'Оберіть посаду' : 'Спочатку відділ'}
              </option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position}</p>
            )}
          </div>

          {/* Роль */}
          <div>
            <label className="block text-sm mb-1">Роль</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="Manager">Керівник</option>
              <option value="Worker">Працівник</option>
            </select>
          </div>
        </div>

        {/* Кнопки */}
        <div className="md:col-span-2">
          {errors.submit && (
            <p className="text-red-500 whitespace-pre-line mb-4">{errors.submit}</p>
          )}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Зберегти
            </button>
            <button
              type="button"
              onClick={() => navigate('/department/employees')}
              className="px-6 py-2 border rounded hover:bg-gray-100"
            >
              Скасувати
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
