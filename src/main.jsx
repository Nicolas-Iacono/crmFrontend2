import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Swal from 'sweetalert2'
import { initGoogleDriveAuth } from './googleDriverAuth.js';


// ====================================================
// 🚀 Render principal de la app
// ====================================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

initGoogleDriveAuth();

// ====================================================
// 🔔 Permiso de notificaciones (una sola vez)
// ====================================================
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then((result) => {
    console.log('🔔 Permiso de notificaciones:', result)
  })
}
// ====================================================
// 🧠 Registro del Service Worker MANUAL (sin vite-plugin-pwa)
// ====================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registrado", reg.scope))
      .catch((err) =>
        console.error("Error registrando SW", err)
      );
  });
}