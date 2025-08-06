import { Typography, useMediaQuery, useTheme, Paper, Fade, Grid2 } from '@mui/material'
import React, { useState } from 'react'
import LoginForm from './LoginForm'
import RegistroForm from '../registro/RegistroForm'
import { Box, Link, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
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

  const cambio = () => {
    setRegister(!register)
  }

  return (
   
    <Grid2 container sx={{backgroundColor:"rgb(86, 23, 164)", height:"100vh", width:"100vw",position:"fixed"}}>
        {register ? <LoginForm /> : <RegistroForm />}

        <Box sx={{  position: "fixed",
  bottom: "0",
  left: "0",
  width: "100%",
  height:"3rem",
  backgroundColor:"rgb(86, 23, 164)",
  textAlign: "center",
  zIndex: "1000"}}>
               {register ? (
             <>
         
           
               <Typography variant="body1" sx={{color:"white"}}>
                 ¿No tienes cuenta? <ToggleLink onClick={() => cambio()}>Registrarse</ToggleLink>
               </Typography>
             </>
           ) : (
             <>
               <Typography variant="body1" sx={{color:"white"}}>
                 ¿Ya tienes cuenta? <ToggleLink onClick={() => cambio()}>Iniciar sesión</ToggleLink>
               </Typography>
             </>
           )}
        </Box>
    </Grid2>
  )
}

export default Login