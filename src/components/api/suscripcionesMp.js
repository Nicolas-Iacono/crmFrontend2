import React from 'react'
import axios from 'axios';
import http from './http';
const URL_SUSCRIPCIONES = `${import.meta.env.VITE_API_URL}/plans`;

export const suscripcionesApi = {

  getPlans: async () => {
    try {
      const response = await http.get(`${URL_SUSCRIPCIONES}`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al obtener planes: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  createPlan: async (payload, planCode, planName, contractLimit) => {
    try {
      // Construir URL con query parameters
      const params = new URLSearchParams();
      if (planCode) params.append('planCode', planCode);
      if (planName) params.append('planName', planName);
      if (contractLimit) params.append('contractLimit', contractLimit);
      
      const url = `${URL_SUSCRIPCIONES}/mp?${params.toString()}`;
      const response = await http.post(url, payload);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error al crear plan de suscripción:', error);
      // devolver detalle si está disponible
      const message = error?.response?.data?.message || error.message || 'Error desconocido';
      return { data: null, error: message };
    }
  },
  estadoSuscripcion: async (token) => {
    try {
      const response = await http.post(`${URL_CONTRATO}/me`, token);
      return response.data;
    } catch (error) {
      console.error("Error al obtener estado de suscripción: ", error);
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
      const response = await http.get(`${URL_CONTRATO}/verificar-contrato/${id}`);
      return { data: response.data, error: null, isLoading: false };
    } catch (error) {
      console.error("Error al verificar tiempo de expiración: ", error);
      return { data: null, error: error.message, isLoading: false };
    }
  },
  buscarContratoPorUsuario: (username) => http.get(`${URL_CONTRATO}/${username}`),
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
export default suscripcionesApi