// src/api/ingresoApi.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const ingresoApi = {
  generarIngresos: () => axios.post(`${API_URL}/ingresos/generar`),

  // GET /api/ingresos/mensuales?mes=7&anio=2025&userId=2
  getMensuales: (userId, mes, anio) =>
    axios.get(`${API_URL}/ingresos/mensuales`, {
      params: { mes, anio, userId },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }),

  // GET /api/ingresos/anual?anio=2025&userId=2
  getAnual: (userId, anio) =>
    axios.get(`${API_URL}/ingresos/anual`, {
      params: { anio, userId },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }),
};

export default ingresoApi;
