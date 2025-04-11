import axios from 'axios';

const URL_IMPUESTOS = `${import.meta.env.VITE_API_URL}/impuesto`;


export const ImpuestosApi =  {
  
  getImpuestos: async () => {
    try {
      const response = await axios.get(`${URL_IMPUESTOS}/all`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching impuestos:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },

  crearImpuesto:async(impuesto) => {
  try{
    const response = await axios.post(`${URL_IMPUESTOS}/create`, impuesto);
    return response.data;
  }catch (error){
    console.error('Error al crear impuesto:', error);
    throw new Error("Error al crear impuesto", error);
    }
  },
  buscarImpuestoPorUsuario: (username) => axios.get(`${URL_IMPUESTOS}/${username}`)

}

export default ImpuestosApi;