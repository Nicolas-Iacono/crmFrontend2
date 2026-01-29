import http from './http';

const URL_PROSPECTOS = `${import.meta.env.VITE_API_URL}/prospecto`;

export const ProspectosApi = {
  listarMisProspectos: async () => {
    try {
      const response = await http.get(`${URL_PROSPECTOS}/me`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching prospectos:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },
  crearProspecto: async (prospecto) => {
    try {
      const response = await http.post(`${URL_PROSPECTOS}/create`, prospecto);
      return response.data;
    } catch (error) {
      console.error('Error al crear prospecto:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      throw new Error('Error al crear prospecto', error);
    }
  },
  actualizarProspecto: async (prospectoId, prospecto) => {
    try {
      const response = await http.put(`${URL_PROSPECTOS}/${prospectoId}`, prospecto);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar prospecto:', error);
      throw new Error('Error al actualizar prospecto', error);
    }
  },
  eliminarProspecto: async (prospectoId) => {
    try {
      const response = await http.delete(`${URL_PROSPECTOS}/${prospectoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar prospecto:', error);
      throw new Error('Error al eliminar prospecto', error);
    }
  },
  listarCompatibles: async (propiedadId) => {
    try {
      const response = await http.get(`${URL_PROSPECTOS}/compatibles/${propiedadId}`);
      return response.data;
    } catch (error) {
      console.error('Error al listar prospectos compatibles:', error);
      throw new Error('Error al listar prospectos compatibles', error);
    }
  },
};

export default ProspectosApi;
