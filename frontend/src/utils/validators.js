// src/utils/validators.js

// Дозволяє літери (укр/англ), пробіли, апострофи та дефіси
export const nameRegex = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'\-\s]+$/;

/**
 * Перевіряє, що рядок не порожній.
 * @param {string} value
 * @returns {string|null}
 */
export function validateNotEmpty(value) {
  return value && value.trim() ? null : 'Поле не може бути порожнім';
}

/**
 * Перевіряє ім’я/прізвище/по-батькові.
 * @param {string} value
 * @returns {string|null}
 */
export function validateName(value) {
  const emptyErr = validateNotEmpty(value);
  if (emptyErr) return emptyErr;
  if (!nameRegex.test(value)) {
    return 'Допустимі лише літери, пробіли, апострофи та дефіси';
  }
  return null;
}

/**
 * Перевіряє формат email.
 * @param {string} value
 * @returns {string|null}
 */
export function validateEmail(value) {
  const emptyErr = validateNotEmpty(value);
  if (emptyErr) return emptyErr;
  const re = /^\S+@\S+\.\S+$/;
  return re.test(value) ? null : 'Невірний формат email';
}

/**
 * Перевіряє повноту номера +380 (99) 999-99-99.
 * @param {string} value
 * @returns {string|null}
 */
export function validatePhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits || digits.length < 12 || value.includes('_')) {
    return 'Введіть повний номер телефону';
  }
  return null;
}

/**
 * Перевіряє, що селект має значення
 * @param {string|number} value
 * @param {string} [message]
 * @returns {string|null}
 */
export function validateSelect(value, message = 'Будь ласка, оберіть значення') {
  return value ? null : message;
}
