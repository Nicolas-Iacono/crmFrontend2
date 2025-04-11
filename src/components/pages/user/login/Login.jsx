import { Typography, useMediaQuery, useTheme, Paper, Fade } from '@mui/material'
import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegistroForm from '../registro/RegistroForm'
import logo1 from "../../../../assets/logo2.png"
import { Box, Link, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'

// Estilos personalizados para los componentes
const LoginContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
  width: "100vw",
  minHeight: "100vh",
  [theme.breakpoints.down('md')]: {
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  width: "50%",
  height: "80vh",
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
  "&:hover": {
    textDecoration: "underline",
  },
});

// Formas decorativas para el fondo
const DecorativeShape1 = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "300px",
  height: "300px",
  borderRadius: "50%",
  background: "rgba(25, 118, 210, 0.1)",
  top: "10%",
  right: "10%",
  [theme.breakpoints.down('md')]: {
    width: "150px",
    height: "150px",
    top: "5%",
    right: "5%",
  },
}));

const DecorativeShape2 = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "200px",
  height: "200px",
  borderRadius: "50%",
  background: "rgba(25, 118, 210, 0.1)",
  bottom: "10%",
  left: "15%",
  [theme.breakpoints.down('md')]: {
    width: "100px",
    height: "100px",
    bottom: "5%",
    left: "10%",
  },
}));

const Login = () => {
  const [register, setRegister] = useState(false)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cambio = () => {
    setRegister(!register)
  }

  return (
    <Fade in={true} timeout={800}>
      <LoginContainer>
        {/* Formas decorativas */}
        <DecorativeShape1 />
        <DecorativeShape2 />
        
        {/* Sección del logo */}
     
        
        {/* Sección del formulario */}
        <FormSection elevation={10}>
          <FormContainer>
            <FormTitle>
              {register ? 'Iniciar Sesión' : 'Registrarse'}
            </FormTitle>
          </FormContainer>

          {register ? (
            <>
              <FormContainer>
                <LoginForm />
              </FormContainer>
              <Typography variant="body1">
                ¿No tienes cuenta? <ToggleLink onClick={() => cambio()}>Registrarse</ToggleLink>
              </Typography>
            </>
          ) : (
            <>
              <FormContainer>
                <RegistroForm />
              </FormContainer>
              <Typography variant="body1">
                ¿Ya tienes cuenta? <ToggleLink onClick={() => cambio()}>Iniciar sesión</ToggleLink>
              </Typography>
            </>
          )}
        </FormSection>
      </LoginContainer>
    </Fade>
  )
}

export default Login