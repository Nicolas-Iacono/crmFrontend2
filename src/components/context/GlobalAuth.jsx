import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthUserContext = createContext();

export const GlobalAuth = ({children}) => {

const [user, setUser] = useState({
  jwt:null,
  username:null,
  authorities:[],
  logo: null // Add logo to user state
});

const [isUser, setIsUser] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);
const [isLogged, setIsLogged] = useState(false);
const [logo, setLogo] = useState(null);
const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
const navigate = useNavigate();
  const [usuarioFetch, setUsuarioFetch] = useState(null);
  const [hasCalendarEvents, setHasCalendarEvents] = useState(false); // Add state for calendar event notifications

const checkCalendarEvents = (username) => {
  axios.get(`${import.meta.env.VITE_API_URL}/contrato/${username}`)
    .then(response => {
      setHasCalendarEvents(response.data.length > 0);
    })
    .catch(error => {
      console.error('Error checking calendar events:', error);
    });
};

useEffect(() => {
  if (user?.username) {
    axios.get(`${import.meta.env.VITE_API_URL}/usuario/username/${user.username}`)
      .then(res => {
        setUsuarioFetch(res.data);
        checkCalendarEvents(user.username); // Check events after fetching user
      })
      .catch(err => {
        console.error('Error fetching usuario:', err);
        setUsuarioFetch(null);
      });
  }
}, [user?.username]);

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
  localStorage.setItem('token', jwt);
  localStorage.setItem('username', username);
  localStorage.setItem('authorities', authorities);
  if (logo) localStorage.setItem('logo', logo);
  setIsAdmin(authorities.includes("ROLE_ADMIN"));
  setIsLogged(true);
  checkCalendarEvents(username); // Check events on login
  navigate('/contratos');
}

const logout = () => {
  setUser({jwt:null, username:null, authorities:[], logo: null}); // Reset logo on logout
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('logo'); // Remove logo on logout
  setIsLogged(false);
  Swal.fire({
    title: '¡Sesión cerrada!',
    text: 'Has cerrado sesión exitosamente.',
    icon: 'success',
    confirmButtonText: 'Aceptar',
  });

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

    if (userData.logo) {
      localStorage.setItem('logo', userData.logo);
      setLogoTimestamp(Date.now()); // Update timestamp to bust cache
    }
    if (userData.username) {
      localStorage.setItem('username', userData.username);
    }
  };

  return (
    <AuthUserContext.Provider value={{user, token: user.jwt, login, logout, isAdmin, isLogged, isLoading, updateUserProfile, usuarioFetch, logo, hasCalendarEvents, setHasCalendarEvents, logoTimestamp}}> 
      {children}
    </AuthUserContext.Provider>
  )
};
export const useAuth = () => {
  return useContext(AuthUserContext);
}
