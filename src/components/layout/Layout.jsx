import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import Grid2 from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Dashboard from './Dashboard';
import NavigationMenu from './NavigattionMenu';
import { useTheme, useMediaQuery, ThemeProvider, createTheme } from '@mui/material';

export const Layout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Recuperar preferencia del localStorage si existe
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Crear tema basado en el modo claro/oscuro
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1a237e',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: darkMode ? '#121212' : '#f8fafc',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [darkMode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Función para alternar entre tema claro y oscuro
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  return (
    <ThemeProvider theme={theme}>
      <Header toggleTheme={toggleTheme} darkMode={darkMode} />
      
      {isMobile ? (
        <Box sx={{ 
          width: '100%',
          minHeight: '100vh',
          p: 0,
          m: 0,
          bgcolor: 'background.default'
        }}>
          <Outlet />
          <NavigationMenu />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '140vh',
          bgcolor: 'background.default',
          width: '100%',
          overflow: 'hidden' // Prevenir scroll horizontal
        }}>
          <Grid2 container sx={{ flexGrow: 1, display: "flex", position: "relative", width: '100%' }}>
            <Box sx={{ 
              minWidth: "100px", 
              height: "100vh", 
              width: { md: "20%", xs: "1%" },
              position: "fixed",
              left: 0,
              top: 0,
              paddingTop: "64px" // Espacio para el header
            }}>
              <Dashboard />
            </Box>

            <Grid2 
              item 
              xs={12} 
              sx={{ 
                width: "100%", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "flex-start", 
                mt: "5rem",
                ml: { md: "10%" }, // Margen izquierdo para compensar el Dashboard
                pr: "1rem",
                boxSizing: "border-box"
              }}
            >
              <Outlet />
            </Grid2>
          </Grid2>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default Layout;
