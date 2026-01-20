// Configuración de entorno centralizada
// Compatible con diferentes bundlers (Vite, Webpack, etc.)

const getEnvVar = (key, defaultValue = '') => {
  // Intenta obtener de diferentes fuentes según el entorno
  if (typeof window !== 'undefined') {
    // En el navegador
    if (window.env && window.env[key]) {
      return window.env[key];
    }
  }
  
  // Intenta import.meta.env (Vite) - comentado para evitar errores de sintaxis
  // try {
  //   if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[key]) {
  //     return import.meta.env[key];
  //   }
  // } catch (e) {
  //   // Silenciosamente ignora el error si import.meta no está disponible
  // }
  
  // Intenta process.env (Node.js/Webpack)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Silenciosamente ignora el error si process no está disponible
  }
  
  return defaultValue;
};

// Configuración de la aplicación
export const config = {
  API_URL: getEnvVar('VITE_API_URL', 
    window.location.origin.includes('localhost') 
      ? 'http://localhost:8080/api' 
      : 'https://crminmobiliario-app-production.up.railway.app/api'
  ),
  
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // Otras variables de entorno que puedas necesitar
  GOOGLE_CLIENT_ID: getEnvVar('VITE_GOOGLE_CLIENT_ID', ''),
  
  // Función helper para determinar si estamos en desarrollo
  isDevelopment: () => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           config.NODE_ENV === 'development';
  },
  
  // Función helper para determinar si estamos en producción
  isProduction: () => {
    return !config.isDevelopment();
  }
};

export default config;
