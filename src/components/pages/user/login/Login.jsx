import { Typography, useMediaQuery, useTheme, Paper, Fade, Grid2, Button, IconButton } from '@mui/material'
import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegistroForm from '../registro/RegistroForm'
import { Box, Link, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import logoinmoListopng from "../../../../assets/logoinmoListopng.png"

// Estilos personalizados para los componentes


const LogoSection = styled(Box)(({ theme }) => ({
  width: "50%",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  [theme.breakpoints.down('md')]: {
    width: "100%",
    height: "30vh",
  },
}));

const FormSection = styled(Paper)(({ theme }) => ({
  width: "40%",
  backgroundColor: "white",
  minHeight: "80vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "20px",
  flexDirection: "column",
  gap: "2rem",
  padding: theme.spacing(3),
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  [theme.breakpoints.down('md')]: {
    width: "100%",
    minHeight: "60vh",
    maxHeight: "70vh",
    overflow: "auto",
    borderRadius: theme.spacing(2),
  },
}));

const LogoImage = styled('img')(({ theme }) => ({
  marginBottom: "2rem",
  width: "25rem",
  maxWidth: "500px",
  borderRadius: "8px",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
  [theme.breakpoints.down('md')]: {
    width: "80%",
    maxWidth: "300px",
    marginBottom: "1rem",
  },
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  fontSize: "2.5rem",
  fontWeight: "bold",
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: "2rem",
  },
}));

const FormContainer = styled(Box)({
  width: "80%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const ToggleLink = styled(Link)({
  cursor: "pointer",
  fontWeight: "600",
  color:"white",
  "&:hover": {
    textDecoration: "underline",
  },
});




const Login = () => {
  const [register, setRegister] = useState(false)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const cambio = () => {
    setRegister(!register)
  }

  const irALoginInquilinos = () => {
    navigate('/login-inquilinos')
  }

  return (
   
    <Grid2 container sx={{
      background: 'white',
      height:"100vh", width:"100vw",position:"fixed"
    }}>
        {register ? <RegistroForm onRegistroExitoso={cambio} />:<LoginForm /> }

        {/* Botón Inquilinos en esquina superior derecha - solo visible en LoginForm */}
        {!register && (
          <Box
            onClick={irALoginInquilinos}
            sx={{
              position: "fixed",
              top: "20px",
              right: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "white",
              cursor: "pointer",
              zIndex: "1001",
              padding: "8px 12px",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }
            }}
          >
            <Typography variant="body2" sx={{ color: "white", fontSize: "0.875rem" }}>
              Portal alquileres
            </Typography>
            <IconButton 
              size="small"
              sx={{
                color: "white",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "transparent"
                }
              }}
            >
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 760, display: 'block', zIndex: -11110 }}
        >
          <defs>
            <linearGradient id="loginWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(117,104,218)" />
              <stop offset="100%" stopColor="rgb(86,23,164)" />
            </linearGradient>
          </defs>
          {/** Downward wave filled with violet-blue gradient */}
          <path
            d="M0,0 L0,80 C 340,110 480,40 720,80 C 960,120 1200,80 1440,80 L1440,0 Z"
            fill="url(#loginWaveGrad)"
          />
        </svg>

        <Box sx={{  position: "fixed",
  bottom: "0",
  left: "0",
  width: "100%",
  height:"3rem",
  backgroundColor: register ? "rgb(86, 23, 164)" : "white",
  textAlign: "center",
  zIndex: "1000"}}>
               {register ? (
             <>
               <Typography variant="body1" sx={{color: register ? "white" : "rgb(86, 23, 164)"}}>
                 ¿Ya tienes cuenta? <ToggleLink sx={{ color: register ? "white" : "rgb(86, 23, 164)" }} onClick={() => cambio()}>Iniciar sesión</ToggleLink>
               </Typography>
           
               
             </>
           ) : (
             <>
               <Typography variant="body1" sx={{color: register ? "white" : "rgb(86, 23, 164)"}}>
                 ¿No tienes cuenta? <ToggleLink sx={{ color: register ? "white" : "rgb(86, 23, 164)" }} onClick={() => cambio()}>Registrarse</ToggleLink>
               </Typography>
             </>
           )}
        </Box>
    </Grid2>
  )
}

export default Login