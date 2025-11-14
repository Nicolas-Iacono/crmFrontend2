import axios from 'axios';
import http from './http';
const URL_USER = `${import.meta.env.VITE_API_URL}/usuario`;
const URL_AUTH = `${import.meta.env.VITE_API_URL}/auth`;

export const usuarioApi =  {

  registrarUsuario:async(usuario) => {
  try{
    // const response = await axios.post(`${URL_USER}/registrar-admin`, usuario);
    // return response.data;
    const { data } = await http.post(`${URL_USER}/registrar-admin`, usuario);
    return data;
  }catch (error){
    console.error('Error al registrar usuario:', error);
    throw new Error("Error al registrar usuario", error);
    }
  },
  login:async(usuario) => {
    try{
      // const response = await axios.post(`${URL_USER}/login`, usuario);
  
      // return response.data;
      const { data } = await http.post(`${URL_USER}/login`, usuario);
      return data;
    }catch (error){
      console.error('Error de login:', error);
      throw new Error("Error de login", error);
      }
    },
  eliminarCuenta: async(username) => {
    try{
      // const response = await axios.delete(`${URL_USER}/${username}`, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // return response.data;
      const { data } = await http.delete(`${URL_USER}/${username}`);
      return data;
    }catch (error){
      console.error('Error al eliminar cuenta:', error);
      throw new Error("Error al eliminar cuenta", error);
      }
    },
    refreshToken:async(refreshToken) => {
      refreshToken = localStorage.getItem('refreshToken');
      try{
        // const response = await http.post(`${URL_USER}/refresh`, { refreshToken });
        // return response.data;
        const { data } = await http.post(`${URL_USER}/refresh`, { refreshToken });
        return data;
        
      }catch (error){
        console.error('Error al refrescar token:', error);
        throw new Error("Error al refrescar token", error);
        }
      },
    forgotPassword: async (email) => {
      try {
        const { data } = await http.post(`${URL_AUTH}/password/forgot`, { email });
        return data;
      } catch (error) {
        console.error('Error al solicitar recupero de contraseña:', error);
        throw error;
      }
    },
    resetPassword: async ({ email, token, newPassword }) => {
      try {
        const { data } = await http.post(`${URL_AUTH}/password/reset`, { email, token, newPassword });
        return data;
      } catch (error) {
        console.error('Error al reiniciar contraseña:', error);
        throw error;
      }
    },
}

export default usuarioApi