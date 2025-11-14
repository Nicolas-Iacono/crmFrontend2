import axios from 'axios';
import { config } from '../../config/env';

const emailApi = {
  // Enviar email de contacto
  sendContactEmail: async (emailData) => {
    try {
      const response = await axios.post(`${config.API_URL}/email/contact`, emailData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  },

  // Enviar email genérico
  sendEmail: async (emailData) => {
    try {
      const response = await axios.post(`${config.API_URL}/email/send`, emailData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
};

export default emailApi;
