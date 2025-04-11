import axios from 'axios';
import useGetAxios from './useAxios';

const URL_PROPIETARIO = `${import.meta.env.VITE_API_URL}/propietario`;


export const PropietarioApi =  {
  
  getPropietarios: () => {
  return useGetAxios(`${URL_PROPIETARIO}/all`);
  },

  crearPropietario:async(propietario) => {
  try{
    const response = await axios.post(`${URL_PROPIETARIO}/create`, propietario);
    return response.data;
  }catch (error){
    console.error('Error al crear propietario:', error);
    throw new Error("Error al crear propietario", error);
    }
  },
  buscarPropietarioPorUsuario: (username) => axios.get(`${URL_PROPIETARIO}/${username}`),
  getPropietariosPerLocalUser : async (username) => {
    if (!username) {
      console.error('Username is required for getPropietariosPerLocalUser');
      return { data: null, isLoading: false, error: 'Username is required' };
    }
    try {
      const response = await axios.get(`${URL_PROPIETARIO}/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching propietarios por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  }
}

export default PropietarioApi