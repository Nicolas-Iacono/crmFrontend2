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
  })
}
// ====================================================
// 🧠 Registro del Service Worker MANUAL (sin vite-plugin-pwa)
// ====================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {

        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              window.location.reload();
            }
          });
        });
      })
      .catch((err) => console.error("Error registrando SW", err));
  });
}