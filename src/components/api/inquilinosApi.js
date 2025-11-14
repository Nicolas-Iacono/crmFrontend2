import axios from 'axios';
import http from './http';
const URL_INQUILINOS = `${import.meta.env.VITE_API_URL}/inquilino`;


export const InquilinosApi =  {
  
  getInquilinos: async () => {
    try {
      const response = await http.get(`${URL_INQUILINOS}/all`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },

  crearInquilino: async (inquilino) => {
    try {
      // POST /api/inquilino/create con JWT (inyectado por http interceptor)
      const response = await http.post(`${URL_INQUILINOS}/create`, inquilino);
      return response.data;
    } catch (error) {
      console.error('Error al crear inquilino:', error);
      throw new Error('Error al crear inquilino');
    }
  },

  actualizarInquilino: async(inquilino) => {
    try {
      const response = await http.put(`${URL_INQUILINOS}/update`, inquilino);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar inquilino:', error);
      throw new Error("Error al actualizar inquilino", error);
    }
  },

  buscarInquilinoPorUsuario: (username) => http.get(`${URL_INQUILINOS}/${username}`),
  getInquilinosPerLocalUser : async (username) => {
    if (!username) {
      console.error('Username is required for getInquilinosPerLocalUser');
      return { data: null, isLoading: false, error: 'Username is required' };
    }
    try {
      const response = await http.get(`${URL_INQUILINOS}/enum/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching inquilinos por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
}
}

export default InquilinosApi;