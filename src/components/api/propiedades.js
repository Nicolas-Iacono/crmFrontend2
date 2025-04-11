import axios from 'axios';

const URL_PROPIEDADES = `${import.meta.env.VITE_API_URL}/propiedad`;

export const PropiedadesApi =  {
  
  getPropiedades: async () => {
    try {
      const response = await axios.get(`${URL_PROPIEDADES}/all`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching propiedades:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },
    getPropiedadesPerLocalUser : async (username) => {
      if (!username) {
        console.error('Username is required for getPropiedadesPerLocalUser');
        return { data: null, isLoading: false, error: 'Username is required' };
      }
      try {
        const response = await axios.get(`${URL_PROPIEDADES}/${username}`);
        return { data: response.data, isLoading: false, error: null };
      } catch (error) {
        console.error('Error fetching propiedades por usuario:', error);
        return { data: null, isLoading: false, error: error.message };
      }
    },
  

  crearPropiedad:async(propiedad) => {
  try{
    const response = await axios.post(`${URL_PROPIEDADES}/create`, propiedad);
    return response.data;
  }catch (error){
    console.error('Error al crear propiedad:', error);
    console.error('Response data:', error.response?.data);
    console.error('Status:', error.response?.status);
    throw new Error("Error al crear propiedad", error);
    }
  },
  buscarPropiedadPorUsuario: (username) => axios.get(`${URL_PROPIEDADES}/${username}`)

}

export default PropiedadesApi