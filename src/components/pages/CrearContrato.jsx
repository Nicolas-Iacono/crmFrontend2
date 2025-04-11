import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import TextEditor from '../common/editorDTexto/TextEditor';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const CrearContrato = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '90%',
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        margin: '0 auto',
        pt: { xs: 3, md: 4 },
        position: 'relative'
      }}
    >
      {!isMobile && (
        <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 2 }}>
          <Tooltip title="Volver" placement="left">
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                }
              }}
            >
              <ArrowBackIcon color="primary" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Ir al inicio" placement="left">
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                }
              }}
            >
              <HomeIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: theme.palette.primary.main }}>
        Crear Contrato
      </Typography>

      <TextEditor />
    </Box>
  );
};

export default CrearContrato;