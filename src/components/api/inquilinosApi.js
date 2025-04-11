import axios from 'axios';

const URL_INQUILINOS = `${import.meta.env.VITE_API_URL}/inquilino`;


export const InquilinosApi =  {
  
  getInquilinos: async () => {
    try {
      const response = await axios.get(`${URL_INQUILINOS}/all`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  },

  crearInquilino:async(inquilino) => {
  try{
    const response = await axios.post(`${URL_INQUILINOS}/create`, inquilino);
    return response.data;
  }catch (error){
    console.error('Error al crear inquilino:', error);
    throw new Error("Error al crear inquilino", error);
    }
  },
  getInquilinosPerLocalUser : async (username) => {
    if (!username) {
      console.error('Username is required for getInquilinosPerLocalUser');
      return { data: null, isLoading: false, error: 'Username is required' };
    }
    try {
      const response = await axios.get(`${URL_INQUILINOS}/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching inquilinos por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
}
}

export default InquilinosApi;