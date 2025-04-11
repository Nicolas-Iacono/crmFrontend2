import React from 'react'
import axios from 'axios';

const URL_CONTRATO = `${import.meta.env.VITE_API_URL}/contrato`;

export const contratoApi = {

  getContratos: async () => {
    try {
      const response = await axios.get(`${URL_CONTRATO}/all`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al obtener contratos: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  crearContrato: async (contrato) => {
    try {
      console.log("API sending contract data:", contrato);
      const response = await axios.post(`${URL_CONTRATO}/create`, contrato);
      console.log("API received response:", response);
      return response.data;
    } catch (error) {
      console.error("Error al crear contrato: ", error);
      // Provide more detailed error information
      if (error.response) {
        console.error("Error details:", {
          data: error.response.data,
          status: error.response.status
        });
      }
      throw error; // Propagate the original error for better debugging
    }
  },
  tiempoExpiracion : async(id) => {
    try {
      const response = await axios.get(`${URL_CONTRATO}/verificar-contrato/${id}`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al verificar tiempo de expiración: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  buscarContratoPorUsuario: (username) => axios.get(`${URL_CONTRATO}/${username}`),
  ultimosContratos: async () => {
    try {
      const response = await axios.get(`${URL_CONTRATO}/latest`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al obtener últimos contratos: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  getContratoById: async (id) => {
    try {
      const response = await axios.get(`${URL_CONTRATO}/buscar/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al buscar contrato por ID: ", error);
      throw new Error("Error al buscar contrato por ID");
    }
  },
  getContratosPerLocalUser: async (username) => {
    if (!username) {
      console.error('Username is required for getContratosPerLocalUser');
      return { data: null, isLoading: false, error: 'Username is required' };
    }
    try {
      const response = await axios.get(`${URL_CONTRATO}/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching contratos por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  }
}
export default contratoApi