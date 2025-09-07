import axios from 'axios';

const googleApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_2,
  withCredentials: true,
});

googleApi.interceptors.request.use((config) => {
  const jwt = localStorage.getItem("token");
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

export const calendarApi = {
    listEvents: async ({ from, to, calendarId }) => {
        const params = new URLSearchParams();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (calendarId) params.set("calendarId", calendarId);
    
                const { data } = await googleApi.get(`/google/calendar/events?${params.toString()}`);
       console.log("calendario data",data);
                return data; // array de eventos mapeados por tu servicio
      },
      createEvent: async (eventData) => {
        const { data } = await googleApi.post('/google/calendar/events', eventData);
        return data;
      },
      // si después agregás borrar:
      // deleteEvent: async ({ calendarId, eventId }) => { ... }

    };