// src/api/http.js
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL;

const http = axios.create({ baseURL: API_BASE });

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
  (error) => {
    const status = error?.response?.status;
    const backendError = error?.response?.data?.error;

    if (status === 401 && backendError === 'token_expired') {
      hardLogout();
      return new Promise(() => {}); // no propaga el error
    }
    return Promise.reject(error);
  }
);

export default http;
