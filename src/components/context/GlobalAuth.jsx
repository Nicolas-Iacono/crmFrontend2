import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showSuccess, showError, showInfo } from '../alertas/showAlert';
import suscripcionesApi from '../api/suscripcionesMp';

const AuthUserContext = createContext();

export const GlobalAuth = ({children}) => {

const [user, setUser] = useState({
  jwt:null,
  username:null,
  authorities:[],
  logo: null, // Add logo to user state
});

const [isUser, setIsUser] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);
const [isLogged, setIsLogged] = useState(false);
const [logo, setLogo] = useState(null);
const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
const navigate = useNavigate();
const [usuarioFetch, setUsuarioFetch] = useState(null);
const [hasCalendarEvents, setHasCalendarEvents] = useState(false); // Add state for calendar event notifications
const [plan, setPlan] = useState(null);
const [token, setToken] = useState(null);
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    setToken(token);
  }
}, []);
const getPlan = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado');
      return;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/subscriptions/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
        
      }

    );

    setPlan(response.data);
  } catch (error) {
    console.error('Error fetching plan:', error.response?.data || error);
  }
};

useEffect(() => {
  getPlan();
}, [user]);


const checkCalendarEvents = (username) => {
  axios.get(`${import.meta.env.VITE_API_URL}/contrato/${username}`)
    .then(response => {
      setHasCalendarEvents(response.data.length > 0);
    })
    .catch(error => {
      console.error('Error checking calendar events:', error);
    });
};
// Effect: fetch usuario/me
useEffect(() => {
  if (!token) return;
  axios.get(`${import.meta.env.VITE_API_URL}/usuario/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    setUsuarioFetch(res.data);
    const uname = res.data?.username;
    if (uname) {
      // keep username in state/localStorage if needed
      if (!user.username) setUser(prev => ({ ...prev, username: uname }));
      localStorage.setItem('username', uname);
    }
    checkCalendarEvents(uname); // or call /contrato/me
  })
  .catch(err => {
    console.error("Error fetching usuario/me:", err);
    setUsuarioFetch(null);
  });
}, [token]); // <-- fix dependency



console.log(usuarioFetch)
useEffect(()=>{
setLogo(usuarioFetch?.logo)
}, [usuarioFetch])

const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const logo = localStorage.getItem('logo');
  const token = localStorage.getItem('token');
  const username =  localStorage.getItem('username');

  if (token && username) {
    const decodedToken = jwtDecode(token);
    const authorities = decodedToken.authorities.split(",");

    setUser({ jwt: token, username, authorities, logo });
    setIsAdmin(authorities.includes("ROLE_ADMIN"));
    setIsLogged(true);
  }

  setIsLoading(false); // terminamos de chequear
}, []);

const login = (jwt, username, logo) => {
  const decodedToken = jwtDecode(jwt);
  const authorities = decodedToken.authorities.split(',');
  setUser({jwt, username, authorities, logo});
  setToken(jwt); // <-- asegura que el efecto de /usuario/me se dispare sin recargar
  setUsuarioFetch(null); // limpia datos de la sesión anterior para evitar parpadeos con datos viejos
  localStorage.setItem('token', jwt);
  localStorage.setItem('username', username);
  localStorage.setItem('authorities', authorities);
  if (logo) localStorage.setItem('logo', logo);
  setIsAdmin(authorities.includes("ROLE_ADMIN"));
  setIsLogged(true);
  checkCalendarEvents(username); // Check events on login
  navigate('/');
}

const logout = () => {
  setUser({jwt:null, username:null, authorities:[], logo: null}); // Reset logo on logout
  setUsuarioFetch(null); // limpia cache de usuario
  setToken(null); // limpia token para detener efectos dependientes y evitar lecturas viejas
  setPlan(null);
  setHasCalendarEvents(false);
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('logo'); // Remove logo on logout
  localStorage.removeItem('authorities');
  localStorage.removeItem('chat_session_id');
  setIsLogged(false);
  showSuccess('Has cerrado sesión exitosamente.');

  navigate('/login')
}
const updateUserProfile = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));

    setUsuarioFetch(prevFetch => ({
      ...prevFetch,
      ...userData
    }));

    if (usuarioFetch.logo) {
      localStorage.setItem('logo', usuarioFetch.logo);
      setLogoTimestamp(Date.now()); // Update timestamp to bust cache
    }
    if (usuarioFetch.username) {
      localStorage.setItem('username', usuarioFetch.username);
    }
  };
console.log(usuarioFetch)
  return (
    <AuthUserContext.Provider value={{plan, user, token: user.jwt, login, logout, isAdmin, isLogged, isLoading, updateUserProfile, usuarioFetch, logo, hasCalendarEvents, setHasCalendarEvents, logoTimestamp}}> 
      {children}
    </AuthUserContext.Provider>
  )
};
export const useAuth = () => {
  return useContext(AuthUserContext);
}

export default GlobalAuth