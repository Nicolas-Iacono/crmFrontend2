import React from "react";
import { Grid2, Box, useTheme, useMediaQuery, IconButton, Tooltip } from "@mui/material";
import ContratoForm from "../../common/ContratoForm";
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ContratoFormMobile from "../../common/mobile/ContratoFormMobile"

const NuevoContrato = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '90%',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: "2rem",
        pt: { xs: 2, md: 4 },
        pb: { xs: 8, md: 4 },
        px: { xs: 2, md: 0 },
        position: 'relative'
      }}
    >
      {!isMobile && (
        <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 2 }}>
          <Tooltip title="Volver" placement="left">
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

          <Tooltip title="Ir al inicio" placement="left">
            <IconButton
              onClick={() => navigate('/')}
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
              <HomeIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {isMobile ? (
        <ContratoFormMobile/>
      ) : (
        <Grid2
          sx={{
            width: { xs: '100%', md: '50%' },
            mx: 'auto',
            p: { xs: '1.5rem', md: '2rem' },
            borderRadius: '10px',
            bgcolor: 'background.paper',
            boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 2,
            minHeight: { xs: 'calc(100vh - 7rem)', md: 'auto' }
          }}
        >
          <ContratoForm />
        </Grid2>
      )}
    </Box>
  );
};

export default NuevoContrato;