// src/utils/validators.js

// Дозволяє літери (укр/англ), пробіли, апострофи та дефіси
export const nameRegex = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'\-\s]+$/;

/**
 * Перевіряє, що рядок не порожній.
 * @param {string} value
 * @returns {string|null} Помилка або null
 */
export function validateNotEmpty(value) {
  return value.trim()
    ? null
    : 'Поле не може бути порожнім';
}

/**
 * Перевіряє ім’я/прізвище/по-батькові.
 * @param {string} value
 * @returns {string|null} Помилка або null
 */
export function validateName(value) {
  if (!value.trim()) {
    return 'Поле не може бути порожнім';
  }
  if (!nameRegex.test(value)) {
    return 'Допустимі лише літери, пробіли, апострофи та дефіси';
  }
  return null;
}

/**
 * Перевіряє формат email.
 * @param {string} value
 * @returns {string|null} Помилка або null
 */
export function validateEmail(value) {
  const re = /^\S+@\S+\.\S+$/;
  if (!value.trim()) {
    return 'Поле не може бути порожнім';
  }
  if (!re.test(value)) {
    return 'Невірний формат email';
  }
  return null;
}

/**
 * Перевіряє повноту заповнення маски +380 (99) 999-99-99.
 * @param {string} value
 * @returns {string|null} Помилка або null
 */
export function validatePhone(value) {
  if (value.includes('_') || value.replace(/\D/g, '').length < 12) {
    return 'Введіть повний номер телефону';
  }
  return null;
}
