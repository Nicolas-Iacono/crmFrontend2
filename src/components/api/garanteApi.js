import axios from 'axios';
import http from './http';
import { uppercaseNameFields } from '../../utils/normalizers';
const URL_GARANTES = `${import.meta.env.VITE_API_URL}/garante`;

export const GarantesApi = {

  getGarantes: async () => {
    try {
      const response = await http.get(`${URL_GARANTES}/all`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching garantes:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },
  crearGarante: async (garante) => {
    try {
      const payload = uppercaseNameFields(garante);
      const response = await http.post(`${URL_GARANTES}/create`, payload);
      return response.data;
    } catch (error) {
      console.error("Error al crear garante: ", error);
      throw new Error("Error al crear garante"); 
    }
  },
  actualizarGarante: async (garante) => {
    try {
      const payload = uppercaseNameFields(garante);
      const response = await http.put(`${URL_GARANTES}/update`, payload);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar garante:', error);
      throw new Error('Error al actualizar garante');
    }
  },
  buscarGarantePorUsuario: (username) => http.get(`${URL_GARANTES}/${username}`),
  getGarantesPerLocalUser: async (username) => {
    if (!username) {
      console.error('Username is required for getGarantesPerLocalUser');
      return { data: null, isLoading: false, error: 'Username is required' };
    }
    try {
      const response = await http.get(`${URL_GARANTES}/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching garantes por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  }
}
export default GarantesApi;