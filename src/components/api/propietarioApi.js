import axios from "axios";

axios.defaults.withCredentials = true; // 🔥 obligatorio para enviar y recibir cookies
axios.defaults.baseURL = "https://crminmobiliario-app-production.up.railway.app";

export const loginPropietario = async (credenciales) => {
  const response = await axios.post("/api/propietario/login", credenciales);
  return response.data;
};
