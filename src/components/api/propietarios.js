import axios from 'axios';
import useGetAxios from './useAxios';
import http from './http';
const URL_PROPIETARIO = `${import.meta.env.VITE_API_URL}/propietario`;


export const PropietarioApi =  {
  
  getPropietarios: () => {
  return useGetAxios(`${URL_PROPIETARIO}/all`);
  },

  crearPropietario: async (propietario) => {
    try {
      // POST /api/propietario/create con JWT (inyectado por http interceptor)
      const response = await http.post(`${URL_PROPIETARIO}/create`, propietario);
      return response.data;
    } catch (error) {
      console.error('Error al crear propietario:', error);
      throw new Error("Error al crear propietario");
    }
  },

  actualizarPropietario: async(propietario) => {
    try {
      const response = await http.put(`${URL_PROPIETARIO}/update`, propietario);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar propietario:', error);
      throw new Error("Error al actualizar propietario", error);
    }
  },
  buscarPropietarioPorUsuario: (username) => {
    return http.get(`${URL_PROPIETARIO}/${username}`);
  },
  
  getPropietariosPerLocalUser : async (username) => {
    if (!username) {
      console.error('Username is required for getPropietariosPerLocalUser');
      return { data: null, isLoading: false, error: 'Username is required' };
    }
    try {
      const response = await http.get(`${URL_PROPIETARIO}/enum/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching propietarios por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },

  deletePropietario: async (id) => {
    try {
      const response = await http.delete(`${URL_PROPIETARIO}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar propietario:', error);
      throw new Error("Error al eliminar propietario", error);
    }
  }
}

export default PropietarioApi