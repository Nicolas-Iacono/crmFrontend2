import http from './http';
const URL_PROPIEDADES = `${import.meta.env.VITE_API_URL}/propiedad`;

export const PropiedadesApi =  {
  
  getPropiedades: async () => {
    try {
      const response = await http.get(`${URL_PROPIEDADES}/all`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching propiedades:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },
  buscarPropiedadesPorUsuario: (username) => http.get(`${URL_PROPIEDADES}/${username}`),
    getPropiedadesPerLocalUser : async (username) => {
      if (!username) {
        console.error('Username is required for getPropiedadesPerLocalUser');
        return { data: null, isLoading: false, error: 'Username is required' };
      }
      try {
        const response = await http.get(`${URL_PROPIEDADES}/enum/${username}`);
        return { data: response.data, isLoading: false, error: null };
      } catch (error) {
        console.error('Error fetching propiedades por usuario:', error);
        return { data: null, isLoading: false, error: error.message };
      }
    },
  

  crearPropiedad:async(propiedad) => {
  try{
    const response = await http.post(`${URL_PROPIEDADES}/create`, propiedad);
    return response.data;
  }catch (error){
    console.error('Error al crear propiedad:', error);
    console.error('Response data:', error.response?.data);
    console.error('Status:', error.response?.status);
    throw new Error("Error al crear propiedad", error);
    }
  },
  actualizarPropiedad: async (propiedadId, propiedad) => {
    try {
      const response = await http.put(`${URL_PROPIEDADES}/${propiedadId}`, propiedad);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      throw new Error('Error al actualizar propiedad', error);
    }
  },
  buscarPropiedadPorId: async (propiedadId) => {
    try {
      const response = await http.get(`${URL_PROPIEDADES}/buscar/${propiedadId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener propiedad:', error);
      throw new Error('Error al obtener propiedad', error);
    }
  },
    buscarPropiedadPorUsuario: (username) => http.get(`${URL_PROPIEDADES}/${username}`),

  asignarPropietario: async (propiedadId, propietarioId) => {
    try {
      const response = await http.put(`${URL_PROPIEDADES}/propiedad/${propiedadId}/asignar-propietario/${propietarioId}`, null, {
        params: {
          propiedadId,
          propietarioId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al asignar propietario:', error);
      throw new Error("Error al asignar propietario", error);
    }
  }

}

export default PropiedadesApi
