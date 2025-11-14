import React from 'react'
import axios from 'axios';
import http from './http';
const URL_CONTRATO = `${import.meta.env.VITE_API_URL}/contrato`;

export const contratoApi = {

  getContratos: async () => {
    try {
      const response = await http.get(`${URL_CONTRATO}/all`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al obtener contratos: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  crearContrato: async (contrato) => {
    try {
      const response = await http.post(`${URL_CONTRATO}/create`, contrato);
      return response.data;
    } catch (error) {
      console.error("Error al crear contrato: ", error);
  
      if (error.response && error.response.data) {
        const backendMessage = error.response.data.message || "Error al crear contrato.";
        throw new Error(backendMessage); // mensaje personalizado del backend
      } else {
        throw new Error("Error de conexión con el servidor.");
      }
    }
  },
  tiempoExpiracion : async(id) => {
    try {
      const response = await http.get(`${URL_CONTRATO}/verificar-contrato/${id}`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al verificar tiempo de expiración: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  buscarContratoPorUsuario: () => http.get(`${URL_CONTRATO}/me`),
  ultimosContratos: async () => {
    try {
      const response = await http.get(`${URL_CONTRATO}/latest`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al obtener últimos contratos: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  getContratoById: async (id) => {
    try {
      const response = await http.get(`${URL_CONTRATO}/buscar/${id}`);
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
      const response = await http.get(`${URL_CONTRATO}/enum/${username}`);
      return { data: response.data, isLoading: false, error: null };
    } catch (error) {
      console.error('Error fetching contratos por usuario:', error);
      return { data: null, isLoading: false, error: error.message };
    }
  }
}
export default contratoApi