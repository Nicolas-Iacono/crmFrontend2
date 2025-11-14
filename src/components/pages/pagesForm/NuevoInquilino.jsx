import React from "react";
import { Grid2, Box, useTheme, useMediaQuery, IconButton, Tooltip } from "@mui/material";
import InquilinoForm from "../../common/InquilinoForm";
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

export const NuevoInquilino = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: {xs:"90%", md:"100vw"},
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: { xs: 2, md: 4 },
        pb: { xs: 8, md: 4 },
        px: { xs: 2, md: 0 },
        position: 'relative',
        marginTop: {xs:0, md:"2rem"}
      }}
    >
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 2, marginTop: {xs:2, md:"2rem"} }}>
          {/* Botón Cerrar - Ir a lista de inquilinos */}
          <Box sx={{ position: 'absolute', top: 0, right: 120, }}>
            <Tooltip title="Volver a inquilinos" placement="bottom">
              <IconButton
                onClick={() => navigate('/inquilinos')}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(101, 131, 231, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                  color: 'error.main',
                  boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 87, 87, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ position: 'absolute', top: 0, right: 60, }}>
        <Tooltip title="Ir al inicio" placement="bottom">
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white',
              color: 'text.primary',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'white',
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.12)'
              }
            }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>
        </Box>
        <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
         <Tooltip title="Volver" placement="bottom">
         <IconButton
           onClick={() => navigate(-1)}
           sx={{
             bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white',
             color: 'text.primary',
             boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
             '&:hover': {
               bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'white',
               transform: 'translateY(-2px)',
               boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.12)'
             }
           }}
         >
           <ArrowBackIcon />
         </IconButton>
       </Tooltip>
       </Box>
      </Box>
      )}
      
      {/* CloseIcon para móvil */}
      {isMobile && (
        <Tooltip title="Volver a inquilinos" placement="left">
          <IconButton
            onClick={() => navigate('/inquilinos')}
            sx={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 1300,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(174, 206, 236, 0.1)' : 'rgba(29, 27, 139, 0.22)',
              color: theme.palette.mode === 'dark' ? 'rgba(21, 58, 223, 0.71)' : 'rgba(10, 32, 105, 0.81)',
              boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(47, 125, 199, 0.15)' : 'rgba(18, 17, 97, 0.22)',
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      )}

      <Grid2 
        sx={{
          width: { xs: '100%', md: '90%' },
          mx: 'auto',
          p: { xs: '1.5rem', md: '2rem' },
          borderRadius: '10px',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 2,
          minHeight: { xs: 'calc(100vh - 7rem)', md: 'auto' },
          backgroundColor:"background.default",
        
        }}
      >
        <InquilinoForm />
      </Grid2>
    </Box>
  );
};

export default NuevoInquilino;
