// src/utils/alertService.js
import Swal from "sweetalert2";

const isDarkMode = () => document.documentElement.getAttribute('data-theme') === 'dark' ||
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.getAttribute('data-theme') !== 'light');

export const showAlert = (title, text, icon = "info") => {
  const dark = isDarkMode();
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "Aceptar",
    customClass: {
      popup: 'modern-swal-popup',
      title: 'modern-swal-title',
      htmlContainer: 'modern-swal-text',
      confirmButton: 'modern-swal-confirm',
      cancelButton: 'modern-swal-cancel',
      actions: 'modern-swal-actions',
    },
    background: dark ? '#1a1625' : '#ffffff',
    color: dark ? '#e2e0e9' : '#1e1b2e',
    confirmButtonColor: '#8b5cf6',
    heightAuto: false,
    showClass: { popup: 'swal2-show modern-swal-animate' },
  });
};

// Helpers específicos
export const showSuccess = (text, title = "¡Listo!") =>
  showAlert(title, text, "success");

export const showError = (text, title = "Error") =>
  showAlert(title, text, "error");

export const showWarning = (text, title = "Atención") =>
  showAlert(title, text, "warning");

export const showInfo = (text, title = "Info") =>
  showAlert(title, text, "info");

export const showConfirm = ({
  title = 'Confirmar',
  text = '¿Estás seguro?',
  icon = 'warning',
  confirmText = 'Sí, confirmar',
  cancelText = 'Cancelar',
  confirmColor = '#ef4444',
} = {}) => {
  const dark = isDarkMode();
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'modern-swal-popup',
      title: 'modern-swal-title',
      htmlContainer: 'modern-swal-text',
      confirmButton: 'modern-swal-confirm',
      cancelButton: 'modern-swal-cancel',
      actions: 'modern-swal-actions',
    },
    background: dark ? '#1a1625' : '#ffffff',
    color: dark ? '#e2e0e9' : '#1e1b2e',
    confirmButtonColor: confirmColor,
    cancelButtonColor: dark ? '#2d2640' : '#e8e5f0',
    heightAuto: false,
    reverseButtons: true,
    showClass: { popup: 'swal2-show modern-swal-animate' },
  });
};
