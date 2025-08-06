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
const navigate = useNavigate();
  const [usuarioFetch, setUsuarioFetch] = useState(null);


useEffect(() => {
  if (user?.username) {
    axios.get(`${import.meta.env.VITE_API_URL}/usuario/username/${user.username}`)
      .then(res => setUsuarioFetch(res.data))
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

  setIsLoading(false); // ✅ terminamos de chequear
}, []);

const login = (jwt, username, logo) => { // Add logo to login params
  const decodedToken = jwtDecode(jwt);
  const authorities = decodedToken.authorities.split(',');
  setUser({jwt, username, authorities, logo}); // Set logo in user state on login
  localStorage.setItem('token', jwt);
  localStorage.setItem('username', username);
  localStorage.setItem('authorities', authorities);
  if (logo) localStorage.setItem('logo', logo); // Store logo in localStorage
  setIsAdmin(authorities.includes("ROLE_ADMIN"));
  setIsLogged(true);
  navigate('/contratos')
  
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
      ...userData // Update user with new data, including logo
    }));
    if (userData.logo) {
      localStorage.setItem('logo', userData.logo);
    }
    // Potentially update other localStorage items if needed, e.g., username if it can change
    if (userData.username) {
      localStorage.setItem('username', userData.username);
    }
  };

  return (
    <AuthUserContext.Provider value={{user, login, logout, isAdmin, isLogged, isLoading, updateUserProfile, usuarioFetch, logo}}> 
      {children}
    </AuthUserContext.Provider>
  )
};
export const useAuth = () => {
  return useContext(AuthUserContext);
}
