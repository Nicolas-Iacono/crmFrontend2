import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import Grid2 from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import NavigationMenu from './NavigattionMenu';
import { useTheme, useMediaQuery, ThemeProvider, createTheme } from '@mui/material';
import AppTour from '../common/tour/AppTour';

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

  // Sincronizar atributo data-theme y color-scheme del documento
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    // Sugerir al UA el esquema de color correcto para formularios/scrollbars
    root.style.colorScheme = darkMode ? 'dark' : 'light';

    // Actualizar la barra de estado en Android/Chrome
    const metaThemes = document.querySelectorAll('meta[name="theme-color"]');
    metaThemes.forEach((el) => {
      el.setAttribute('content', darkMode ? '#121212' : '#8D2EE6');
      if (el.hasAttribute('media')) el.removeAttribute('media');
    });

    // Actualizar preferencia de esquema de color del documento
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.setAttribute('content', darkMode ? 'dark light' : 'light only');
    }
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <Header toggleTheme={toggleTheme} darkMode={darkMode} />
      {/* Onboarding tour (first visit) */}
      <AppTour />
      
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
          minHeight: '100vh',
          width: '100%',
          overflow: 'hidden',// Prevenir scroll horizontal
          fontFamily: 'Poppins, sans-serif',
        }}>
                    <Grid2 
            container 
            sx={{ 
              justifyContent: "center", 
              pt: '10px', // Adjusted padding for the header
              px: 0, 
              flexGrow: 1,
              width: '100vw',
            }}
          >
            <Grid2 item xs={12} sx={{maxWidth: '100%'}}>
              <Outlet />
            </Grid2>
          </Grid2>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default Layout;
