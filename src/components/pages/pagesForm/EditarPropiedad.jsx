import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Grid2, IconButton, Tooltip, useMediaQuery, useTheme, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import PropiedadesEditForm from '../../common/PropiedadesEditForm';
import { PropiedadesApi } from '../../api/propiedades';
import { showError } from '../../alertas/showAlert';

const EditarPropiedad = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [propiedad, setPropiedad] = useState(null);

  useEffect(() => {
    const fetchPropiedad = async () => {
      try {
        setIsLoading(true);
        const data = await PropiedadesApi.buscarPropiedadPorId(id);
        const propiedadData = data?.data ?? data;
        setPropiedad(propiedadData);
      } catch (error) {
        console.error('Error al cargar la propiedad:', error);
        showError('No se pudo cargar la propiedad.');
        navigate('/propiedades');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchPropiedad();
    }
  }, [id, navigate]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100%',
        bgcolor: 'white',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: { xs: 0, md: 4 },
        pb: { xs: 0, md: 4 },
        position: 'relative',
        marginTop: { xs: '0', sm: '0', md: '2rem' },
        backgroundColor: 'background.default',
      }}
    >
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 2, marginTop: '2rem' }}>
          <Box sx={{ position: 'absolute', top: 0, right: 60 }}>
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
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            <Tooltip title="Volver" placement="bottom">
              <IconButton
                onClick={() => navigate(-1)}
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
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.3)' : '0 6px 16px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Grid2
        sx={{
          width: {
            xs: '100%',
            sm: '100%',
            md: '100%',
            lg: '80vw',
            xl: '80vw',
          },
          mx: 'auto',
          p: { xs: '1.5rem', md: '2rem' },
          borderRadius: { xs: '0', md: '10px' },
          bgcolor: 'background.default',
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'column' },
          justifyContent: 'center',
          gap: 2,
          minHeight: { xs: 'calc(100vh - 7rem)', md: 'auto' },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
            <CircularProgress />
            <Typography>Cargando propiedad...</Typography>
          </Box>
        ) : (
          <PropiedadesEditForm
            propiedad={propiedad}
            onCancel={() => navigate(-1)}
            onSuccess={() => navigate('/propiedades')}
          />
        )}
      </Grid2>
    </Box>
  );
};

export default EditarPropiedad;
