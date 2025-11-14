import axios from 'axios';
import http from './http';
const URL_PRESUPUESTO = `${import.meta.env.VITE_API_URL}`;

// Opcional: si usás cookies httpOnly en backend
// axios.defaults.withCredentials = true;


axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toPercent = (v) => {
  const n = toNumber(v, 0);
  return n < 0 ? 0 : n;
};

const normalizeError = (error) =>
  error?.response?.data?.message || error?.response?.data?.error || error.message || 'Error desconocido';

export const presupuestoApi = {
  /**
   * Crea un nuevo presupuesto
   */
  createPresupuesto: async (presupuestoData) => {
    try {
      const response = await http.post(`${URL_PRESUPUESTO}/presupuestos`, presupuestoData);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error al crear presupuesto: ', error);
      return { data: null, error: normalizeError(error), isLoading: false, status: error?.response?.status };
    }
  },

  /**
   * Obtiene presupuesto por ID
   */
  getPresupuestoById: async (id) => {
    try {
      const response = await http.get(`${URL_PRESUPUESTO}/presupuesto/${id}`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error al obtener presupuesto: ', error);
      return { data: null, error: normalizeError(error), isLoading: false, status: error?.response?.status };
    }
  },

  /**
   * Lista todos los presupuestos del usuario (por username)
   */
  getAllPresupuestos: async (username) => {
    try {
      if (!username) {
        return { data: [], error: 'username vacío', isLoading: false };
      }
      const response = await http.get(`${URL_PRESUPUESTO}/presupuestos/usuario/${encodeURIComponent(username)}`);
      const payload = response.data;
      const data = Array.isArray(payload) ? payload : payload?.data || [];
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error al obtener presupuestos: ', error);
      return { data: [], error: normalizeError(error), isLoading: false, status: error?.response?.status };
    }
  },

  /**
   * Elimina presupuesto por ID
   */
  deletePresupuesto: async (id) => {
    try {
      const response = await http.delete(`${URL_PRESUPUESTO}/presupuestos/${id}`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error al eliminar presupuesto: ', error);
      return { data: null, error: normalizeError(error), isLoading: false, status: error?.response?.status };
    }
  },

  /**
   * Actualiza un presupuesto por ID
   */
  updatePresupuesto: async (id, presupuestoData) => {
    try {
      const response = await http.put(`${URL_PRESUPUESTO}/presupuesto/${id}`, presupuestoData);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error al actualizar presupuesto: ', error);
      return { data: null, error: normalizeError(error), isLoading: false, status: error?.response?.status };
    }
  },

  /**
   * Lista presupuestos por ID de usuario (si tuvieses ese endpoint)
   */
  getPresupuestosByUsuario: async (usuarioId) => {
    try {
      const response = await http.get(`${URL_PRESUPUESTO}/presupuestos/${usuarioId}`);
      const payload = response.data;
      const data = Array.isArray(payload) ? payload : payload?.data || [];
      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error al obtener presupuestos del usuario: ', error);
      return { data: [], error: normalizeError(error), isLoading: false, status: error?.response?.status };
    }
  },

  /**
   * Calcula totales de un presupuesto (helper local)
   */
  calculateTotals: (presupuestoData) => {
    const {
      monto,
      porcentajeContrato,
      porcentajeSello,
      gastosExtras,
      deposito = 0,
    } = presupuestoData;

    const primerMes = toNumber(monto, 0);
    const contratoPct = toPercent(porcentajeContrato) / 100;
    const selloPct = toPercent(porcentajeSello) / 100;
    const extras = toNumber(gastosExtras, 0);
    const depositoValue = toNumber(deposito, 0);

    const comisionContrato = primerMes * contratoPct;
    const sello = primerMes * selloPct;
    const total = primerMes + depositoValue + comisionContrato + sello + extras;

    return {
      primerMes,
      comisionContrato,
      sello,
      extras,
      deposito: depositoValue,
      total,
      breakdown: {
        montoBase: primerMes,
        deposito: depositoValue,
        comisionContrato,
        sellos: sello,
        gastosExtras: extras,
        total,
      },
    };
  },

  /**
   * Valida datos de un presupuesto antes de enviarlo
   */
  validatePresupuestoData: (presupuestoData) => {
    const errors = [];

    const titulo = (presupuestoData.titulo || '').trim();
    const monto = toNumber(presupuestoData.monto, NaN);
    const duracion = Math.trunc(toNumber(presupuestoData.duracion, NaN));
    const pctContrato = toNumber(presupuestoData.porcentajeContrato, NaN);
    const pctSello = toNumber(presupuestoData.porcentajeSello, NaN);

    if (!titulo) errors.push('El título es requerido');
    if (!Number.isFinite(monto) || monto <= 0) errors.push('El monto debe ser mayor a 0');

    if (!Number.isFinite(pctContrato)) {
      errors.push('El porcentaje de contrato es requerido y debe ser numérico');
    } else if (pctContrato < 0 || pctContrato > 100) {
      errors.push('El porcentaje de contrato debe estar entre 0 y 100');
    }

    if (!Number.isFinite(pctSello)) {
      errors.push('El porcentaje de sello es requerido y debe ser numérico');
    } else if (pctSello < 0 || pctSello > 100) {
      errors.push('El porcentaje de sello debe estar entre 0 y 100');
    }

    if (!Number.isInteger(duracion) || duracion <= 0) {
      errors.push('La duración debe ser un entero mayor a 0 meses');
    }

    if (!presupuestoData.usuarioId) {
      errors.push('ID de usuario es requerido');
    }

    return { isValid: errors.length === 0, errors };
  }
};

export default presupuestoApi;
