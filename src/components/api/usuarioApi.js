import axios from 'axios';

const URL_USER = `${import.meta.env.VITE_API_URL}/usuario`;

export const usuarioApi =  {

  registrarUsuario:async(usuario) => {
  try{
    const response = await axios.post(`${URL_USER}/registrar-admin`, usuario);
    return response.data;
  }catch (error){
    console.error('Error al registrar usuario:', error);
    throw new Error("Error al registrar usuario", error);
    }
  },
  login:async(usuario) => {
    try{
      const response = await axios.post(`${URL_USER}/login`, usuario);
      return response.data;
    }catch (error){
      console.error('Error de login:', error);
      throw new Error("Error de login", error);
      }
    }


}

export default usuarioApi