import axios from 'axios';

const URL_GARANTES = `${import.meta.env.VITE_API_URL}/garante`;

export const GarantesApi = {

  getGarantes: async () => {
    try {
      const response = await axios.get(`${URL_GARANTES}/all`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching garantes:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },
  crearGarante: async (garante) => {
    try {
      const response = await axios.post(`${URL_GARANTES}/create`, garante);
      return response.data;
    } catch (error) {
      console.error("Error al crear garante: ", error);
      throw new Error("Error al crear garante"); 
    }
  },
  buscarGarantePorUsuario: (username) => axios.get(`${URL_GARANTES}/${username}`),
  getGarantesPerLocalUser: async (username) => {
    if (!username) {
      console.error('Username is required for getGarantesPerLocalUser');
      return { data: null, isLoading: false, error: 'Username is required' };
    }
    try {
      const response = await axios.get(`${URL_GARANTES}/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching garantes por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  }
}
export default GarantesApi;