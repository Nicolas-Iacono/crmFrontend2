import axios from 'axios';

const googleApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

googleApi.interceptors.request.use((config) => {
  const jwt = localStorage.getItem("token");
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

export const googleUserApi = {
  getLinkStatus: async () => {
    const response = await googleApi.get('/oauth/google/link/status');
    return response.data;
  },
};

export default googleUserApi;