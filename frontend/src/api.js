import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Додаємо access_token в кожен запит
api.interceptors.request.use(config => {
  const access = localStorage.getItem('access_token');
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Інтерцептор для обробки 401 і автоматичного refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Якщо 401, є refresh_token і ми ще не робили retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          // Оновлюємо access
          const { data } = await axios.post(
            'http://localhost:8000/api/token/refresh/',
            { refresh }
          );

          // Зберігаємо новий
          localStorage.setItem('access_token', data.access);

          // Оновлюємо заголовки
          api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
          originalRequest.headers.Authorization = `Bearer ${data.access}`;

          // Повторюємо початковий запит
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Не вдалось оновити токен:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
