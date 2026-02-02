// src/api/http.js
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL;

const http = axios.create({ baseURL: API_BASE });

const AUTH_REFRESH_PATH = '/auth/refresh';
let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (error, token) => {
  pendingRequests.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  pendingRequests = [];
};

const requestTokenRefresh = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('refresh_token_missing');
  }

  const { data } = await axios.post(
    `${API_BASE}${AUTH_REFRESH_PATH}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return data;
};

// --- Adjunta token en cada request ---
http.interceptors.request.use((config) => {
  if (config?.skipAuth) return config;
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('inquilino_token') ||
    localStorage.getItem('propietario_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Logout centralizado con cartel ---
function hardLogout() {
  // limpia el storage
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('authorities');
  localStorage.removeItem('logo');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('chat_session_id');

  // muestra cartel
  Swal.fire({
    title: 'Tu sesión ha expirado',
    text: 'Redirigiendo al login…',
    icon: 'warning',
    showConfirmButton: true,   // 👈 lo activás para cerrarlo vos
    allowOutsideClick: false,  // opcional: evita que se cierre haciendo click afuera
    allowEscapeKey: false,  
    timerProgressBar: true,
    background: ' #5617a4',
    color: 'white',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    customClass: {
      popup: 'custom-popup',
      header: 'custom-header',
      content: 'custom-content',
      confirmButton: 'custom-confirm-button',
      cancelButton: 'custom-cancel-button',
    },
   
  });

  // redirige después de un breve delay
  setTimeout(() => {
    window.location.href = '/login';
  }, 2500);
}

// --- Interceptor de respuesta ---
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const backendError = error?.response?.data?.error;
    const originalRequest = error?.config;

    if (
      status === 401 &&
      backendError === 'token_expired' &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        hardLogout();
        return new Promise(() => {}); // no propaga el error
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(http(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshData = await requestTokenRefresh();
        const newAccessToken =
          refreshData?.jwt ||
          refreshData?.accessToken ||
          refreshData?.access ||
          refreshData?.token;
        const newRefreshToken =
          refreshData?.refreshToken || refreshData?.refresh || storedRefreshToken;

        if (!newAccessToken) {
          throw new Error('refresh_token_invalid');
        }

        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        resolvePendingRequests(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        resolvePendingRequests(refreshError, null);
        hardLogout();
        return new Promise(() => {}); // no propaga el error
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && backendError === 'token_expired') {
      hardLogout();
      return new Promise(() => {}); // no propaga el error
    }

    return Promise.reject(error);
  }
);

export default http;
