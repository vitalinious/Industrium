import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use(async config => {
  const token = localStorage.getItem('access_token');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const refreshToken = localStorage.getItem('refresh_token');

    if (err.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (e) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;
