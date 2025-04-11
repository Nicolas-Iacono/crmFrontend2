import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AuthUserContext = createContext();

export const GlobalAuth = ({children}) => {

const [user, setUser] = useState({
  jwt:null,
  username:null,
  authorities:[]
});

const [isUser, setIsUser] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);
const [isLogged, setIsLogged] = useState(false);
const navigate = useNavigate();

useEffect(()=>{
const token = localStorage.getItem('token');
const username =  localStorage.getItem('username');
  if (token && username) {
    const decodedToken = jwtDecode(token);
    const authorities = decodedToken.authorities.split(",");

    setUser({jwt: token, username, authorities});
    setIsAdmin(authorities.includes("ROLE_ADMIN"));
    setIsLogged(true);
  }
},[])

const login = (jwt, username) => {
  const decodedToken = jwtDecode(jwt);
  const authorities = decodedToken.authorities.split(',');
  setUser({jwt, username, authorities});
  localStorage.setItem('token', jwt);
  localStorage.setItem('username', username);
  localStorage.setItem('authorities', authorities)
  setIsAdmin(authorities.includes("ROLE_ADMIN"));
  setIsLogged(true);
  navigate('/contratos')
  
}

const logout = () => {
  setUser({jwt:null, username:null, authorities:[]});
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  setIsLogged(false);
  Swal.fire({
    title: '¡Sesión cerrada!',
    text: 'Has cerrado sesión exitosamente.',
    icon: 'success',
    confirmButtonText: 'Aceptar',
  });

  navigate('/login')
}
  return (
    <AuthUserContext.Provider value={{user, login, logout, isAdmin, isLogged}}>
      {children}
    </AuthUserContext.Provider>
  )
};
export const useAuth = () => {
  return useContext(AuthUserContext);
}
