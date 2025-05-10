import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import api from '../../api';

import {
  validateName,
  validateEmail,
  validatePhone
} from '../../utils/validators';

export default function CreateEmployee() {
  const navigate = useNavigate();

  // form fields
  const [lastName, setLastName]       = useState('');
  const [firstName, setFirstName]     = useState('');
  const [middleName, setMiddleName]   = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');

  // selects
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId]     = useState('');
  const [role, setRole]                 = useState('Worker');

  // options
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions]     = useState([]);

  // errors
  const [lastNameErr,   setLastNameErr]   = useState(null);
  const [firstNameErr,  setFirstNameErr]  = useState(null);
  const [middleNameErr, setMiddleNameErr] = useState(null);
  const [emailErr,      setEmailErr]      = useState(null);
  const [phoneErr,      setPhoneErr]      = useState(null);
  const [submitErr,     setSubmitErr]     = useState(null);

  // custom required-message handlers
  const attachRequiredMsg = e => e.target.setCustomValidity('Будь ласка, заповніть це поле');
  const clearRequiredMsg  = e => e.target.setCustomValidity('');

  // load departments
  useEffect(() => {
    api.get('/departments/')
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  // load positions when department changes
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

  const handleSubmit = async e => {
    e.preventDefault();

    // validate all fields
    const ln = validateName(lastName);
    const fn = validateName(firstName);
    const mn = middleName ? validateName(middleName) : null;
    const em = validateEmail(email);
    const ph = validatePhone(phone);

    setLastNameErr(ln);
    setFirstNameErr(fn);
    setMiddleNameErr(mn);
    setEmailErr(em);
    setPhoneErr(ph);
    setSubmitErr(null);

    if (ln || fn || mn || em || ph) {
      return; // don't submit if any error
    }

    try {
      const payload = {
        last_name:    lastName.trim(),
        first_name:   firstName.trim(),
        middle_name:  middleName.trim(),
        email:        email.trim(),
        phone_number: phone.replace(/\D/g, ''),
        department:   departmentId,
        position:     positionId,
        role,
      };
      const { data } = await api.post('/employees/', payload);

      const creds =
        `✅ Співробітника створено!\n\n` +
        `Логін: ${data.username}\n` +
        `Пароль: ${data.password}`;

      window.prompt('Скопіюйте логін і пароль:', creds);
      navigate('/department/employees');
    } catch (err) {
      if (err.response?.status === 400) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(' ')}`)
          .join('\n');
        setSubmitErr(messages);
      } else {
        setSubmitErr('Не вдалося створити співробітника');
      }
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded overflow-auto">
      <h1 className="text-xl font-semibold mb-4">Новий співробітник</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

        {/* Ліва колонка */}
        <div className="space-y-4">
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
              onBlur={() => setLastNameErr(validateName(lastName))}
              onChange={e => setLastName(e.target.value)}
            />
            {lastNameErr && (
              <p className="text-red-500 text-sm mt-1">{lastNameErr}</p>
            )}
          </div>

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
              onBlur={() => setFirstNameErr(validateName(firstName))}
              onChange={e => setFirstName(e.target.value)}
            />
            {firstNameErr && (
              <p className="text-red-500 text-sm mt-1">{firstNameErr}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">По-батькові</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={middleName}
              onBlur={() => setMiddleNameErr(validateName(middleName))}
              onChange={e => setMiddleName(e.target.value)}
            />
            {middleNameErr && (
              <p className="text-red-500 text-sm mt-1">{middleNameErr}</p>
            )}
          </div>

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
              onBlur={() => setEmailErr(validateEmail(email))}
              onChange={e => setEmail(e.target.value)}
            />
            {emailErr && (
              <p className="text-red-500 text-sm mt-1">{emailErr}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Телефон</label>
            <InputMask
              mask="+380 (99) 999-99-99"
              maskChar={null}
              value={phone}
              onChange={e => setPhone(e.target.value)}
            >
              {inputProps => (
                <input
                  {...inputProps}
                  type="tel"
                  className={`w-full border px-3 py-2 rounded ${
                    phoneErr ? 'border-red-500' : ''
                  }`}
                  placeholder="+380 (__) ___-__-__"
                />
              )}
            </InputMask>
            {phoneErr && (
              <p className="text-red-500 text-sm mt-1">{phoneErr}</p>
            )}
          </div>
        </div>

        {/* Права колонка */}
        <div className="space-y-4">
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
              onChange={e => setDepartmentId(e.target.value)}
            >
              <option value="">Оберіть відділ</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

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
              onChange={e => setPositionId(e.target.value)}
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
          </div>

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

        <div className="md:col-span-2">
          {submitErr && (
            <p className="text-red-500 whitespace-pre-line mb-4">{submitErr}</p>
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