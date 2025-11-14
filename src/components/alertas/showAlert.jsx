// src/utils/alertService.js
import Swal from "sweetalert2";

export const showAlert = (title, text, icon = "info") => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "Aceptar",
    customClass: {
      popup: "custom-popup",
      title: "custom-header",
      confirmButton: "custom-confirm-button",
    },
    // Usar heightAuto en lugar de zIndex para evitar warnings
    heightAuto: false,
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
