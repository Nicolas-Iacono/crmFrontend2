import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import DashboardInquilinos from './DashboardPropietario';
import DashboardPropietario from './DashboardInquilinos';

const DashboardUnificado = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token y authorities
    const token = localStorage.getItem('inquilino_token') || localStorage.getItem('token') || localStorage.getItem('propietario_token');
    const authorities = localStorage.getItem('authorities');
    
    if (!token) {
      navigate('/login-inquilinos');
      return;
    }
    
    // Detectar el rol del usuario
    let role = '';
    if (authorities) {
      if (authorities.includes('ROLE_INQUILINO_USER')) {
        role = 'ROLE_INQUILINO_USER';
      } else if (authorities.includes('ROLE_PROPIETARIO_USER')) {
        role = 'ROLE_PROPIETARIO_USER';
      }
    }
    
    setUserRole(role);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('propietario_token');
    localStorage.removeItem('propietario_username');
    localStorage.removeItem('inquilino_token');
    localStorage.removeItem('inquilino_username');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('authorities');
    localStorage.removeItem('chat_session_id');
    navigate('/login-inquilinos');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Renderizar el dashboard correspondiente según el rol
  if (userRole === 'ROLE_INQUILINO_USER') {
    return <DashboardPropietario />; // Usando DashboardPropietario que tiene la funcionalidad completa de inquilinos
  }
  
  if (userRole === 'ROLE_PROPIETARIO_USER') {
    return <DashboardInquilinos />; // Usando DashboardInquilinos que ahora es solo para propietarios
  }

  // Si no hay rol válido, mostrar mensaje de error
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f5f5f5',
      textAlign: 'center',
      p: 3
    }}>
      <Typography variant="h5" color="error" sx={{ mb: 2 }}>
        Acceso no autorizado
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        No tienes permisos para acceder a esta sección o tu rol no está definido correctamente.
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Rol detectado: {userRole || 'Sin rol definido'}
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleLogout}
        sx={{ 
          backgroundColor: 'rgb(86, 23, 164)',
          '&:hover': {
            backgroundColor: 'rgb(66, 18, 134)'
          }
        }}
      >
        Volver al login
      </Button>
    </Box>
  );
};

export default DashboardUnificado;
