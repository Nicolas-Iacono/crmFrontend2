import { Typography, useMediaQuery, useTheme, Paper, Fade, Grid2, Button, IconButton, TextField } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Box, Link, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'
import PasswordTextField from '../../../common/PasswordTextField'
import axios from 'axios'
import Swal from 'sweetalert2'
import logoinmoListopng from "../../../../assets/logoInmo192.png"
import { useAuth } from '../../../context/GlobalAuth'
import { jwtDecode } from 'jwt-decode'
import { loginPropietario } from '../../../api/propietarioApi'

const LoginInquilinos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [loginType, setLoginType] = useState(null); // 'inquilino' o 'propietario'
  const { login } = useAuth();

  const volverAlLogin = () => {
    if (loginType || register) {
      // Si estamos en un formulario, volver a la selección de tipo
      setLoginType(null);
      setRegister(false);
    } else {
      // Si estamos en la selección de tipo, volver al login principal
      navigate('/login');
    }
  }

  const handleSubmitRegisterPropietario = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post('https://crminmobiliario-app-production.up.railway.app/api/propietario/register', {
        nombre: values.nombre,
        apellido: values.apellido,
        dni: values.dni,
        email: values.email,
        password: values.password
      });

      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Se ha enviado un email de confirmación a tu correo electrónico. Por favor, verifica tu cuenta antes de iniciar sesión.',
          background: "rgb(86, 23, 164)",
          color: 'white',
          confirmButtonColor: 'rgb(54, 154, 159)',
          confirmButtonText: 'Entendido'
        }).then(() => {
          resetForm();
          setRegister(false); // Volver al formulario de login
        });
      }
    } catch (error) {
      console.error('Error durante el registro de propietario:', error);
      let errorMessage = 'Error al registrar el propietario';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Por favor, verifica la información ingresada.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Ya existe un propietario registrado con este email o DNI.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al registrarse',
        text: errorMessage,
        background: "rgb(86, 23, 164)",
        color: 'white',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  }

  const cambio = () => {
    setRegister(!register)
  }

  // Registrar notificaciones push después de loguear al inquilino
  useEffect(() => {
    if (user && 'serviceWorker' in navigator && 'PushManager' in window) {
      registerPush(user.id);
    }
  }, [user]);

  const initialValues = {
    email: '',
    password: '',
  }

  const initialValuesRegister = {
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: '',
  }
  const initialValuesRegisterPropietario = {
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: '',
  }
 const handleSubmitLoginPropietario = async (values, { setSubmitting }) => {
    try {
      let response;
      
      if (loginType === 'propietario') {
        // Login de propietario
        response = await loginPropietario({
          email: values.email,
          password: values.password
        });
        
        // Envolver la respuesta en el formato esperado
        response = { data: response };
      } else {
        // Login de inquilino (original)
        response = await axios.post('https://crminmobiliario-app-production.up.railway.app/api/propietario/login', {
          email: values.email,
          password: values.password
        });
      }

      if (response.data && response.data.jwt) {
        // Decodificar el JWT y extraer authorities como en GlobalAuth
        const decodedToken = jwtDecode(response.data.jwt);
        const authorities = decodedToken.authorities.split(',');
        
  
        
        // Usar la función login de GlobalAuth para actualizar el estado global
        login(response.data.jwt, response.data.username, response.data.logo);
        
        // También guardar los tokens específicos para compatibilidad
        localStorage.setItem('propietario_token', response.data.jwt);
        localStorage.setItem('propietario_username', response.data.username);
        
        // Establecer el usuario para activar las notificaciones push
        setUser({ id: response.data.userId || response.data.id, username: response.data.username });
        
       
        const userTypeText = loginType === 'propietario' ? 'Propietario' : 'Inquilino';
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `¡Bienvenido ${userTypeText}!`,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          background: "rgb(86, 23, 164)",
          color: 'white',
          customClass: {
            popup: 'swal2-smaller-toast'
          }
        })

        // Navegar al dashboard correspondiente
        setTimeout(() => {
          navigate('/dashboard-inquilinos')
        }, 100)
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      
      let errorMessage = 'Credenciales incorrectas';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.response?.status === 404) {
        const userType = loginType === 'propietario' ? 'Propietario' : 'Inquilino';
        errorMessage = `${userType} no encontrado`;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: errorMessage,
        background: "rgb(86, 23, 164)",
        color: 'white',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false)
    }
  }
  const handleSubmitLogin = async (values, { setSubmitting }) => {
    try {
      let response;
      
      if (loginType === 'propietario') {
        // Login de propietario
        response = await loginPropietario({
          email: values.email,
          password: values.password
        });
        
        // Envolver la respuesta en el formato esperado
        response = { data: response };
      } else {
        // Login de inquilino (original)
        response = await axios.post('https://crminmobiliario-app-production.up.railway.app/api/inquilino/login', {
          email: values.email,
          password: values.password
        });
      }

      if (response.data && response.data.jwt) {
        // Decodificar el JWT y extraer authorities como en GlobalAuth
        const decodedToken = jwtDecode(response.data.jwt);
        const authorities = decodedToken.authorities.split(',');
        

        
        // Usar la función login de GlobalAuth para actualizar el estado global
        login(response.data.jwt, response.data.username, response.data.logo);
        
        // También guardar los tokens específicos para compatibilidad
        localStorage.setItem('inquilino_token', response.data.jwt);
        localStorage.setItem('inquilino_username', response.data.username);
        
        // Establecer el usuario para activar las notificaciones push
        setUser({ id: response.data.userId || response.data.id, username: response.data.username });
        
        
        const userTypeText = loginType === 'propietario' ? 'Propietario' : 'Inquilino';
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `¡Bienvenido ${userTypeText}!`,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          background: "rgb(86, 23, 164)",
          color: 'white',
          customClass: {
            popup: 'swal2-smaller-toast'
          }
        })

        // Navegar al dashboard correspondiente
        setTimeout(() => {
          navigate('/dashboard-inquilinos')
        }, 100)
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      
      let errorMessage = 'Credenciales incorrectas';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.response?.status === 404) {
        const userType = loginType === 'propietario' ? 'Propietario' : 'Inquilino';
        errorMessage = `${userType} no encontrado`;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: errorMessage,
        background: "rgb(86, 23, 164)",
        color: 'white',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post('https://crminmobiliario-app-production.up.railway.app/api/inquilino/register', {
        nombre: values.nombre,
        apellido: values.apellido,
        dni: values.dni,
        email: values.email,
        password: values.password
      });

      if (response.data) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Se ha enviado un email de confirmación a tu correo electrónico. Por favor, verifica tu cuenta antes de iniciar sesión.',
          background: "rgb(86, 23, 164)",
          color: 'white',
          confirmButtonColor: 'rgb(54, 154, 159)',
          confirmButtonText: 'Entendido'
        }).then(() => {
          resetForm();
          setRegister(false); // Volver al formulario de login
        });
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      
      let errorMessage = 'Error al registrar el inquilino';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Por favor, verifica la información ingresada.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Ya existe un inquilino registrado con este email o DNI.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error al registrarse',
        text: errorMessage,
        background: "rgb(86, 23, 164)",
        color: 'white',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  }

  const ToggleLink = styled(Link)({
    cursor: "pointer",
    fontWeight: "600",
    color:"white",
    "&:hover": {
      textDecoration: "underline",
    },
  });

  return (
    <Grid2 container sx={{backgroundColor:"rgb(86, 23, 164)", height:"100vh", width:"100vw",position:"fixed"}}>
      
      {/* Botón Volver en esquina superior izquierda */}
      <Box
        onClick={volverAlLogin}
        sx={{
          position: "fixed",
          top: "20px",
          left: "20px",
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
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ color: "white", fontSize: "0.875rem" }}>
          {loginType || register ? 'Volver' : 'Inicio'}
        </Typography>
      </Box>

      {/* Selección de tipo de usuario */}
      {!loginType && !register ? (
        <Box sx={{ 
          width: '90%', 
          height: "70vh",
          margin:"auto",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"center",
          gap:"3rem",
          backgroundColor:"rgb(86, 23, 164)",
        }}>
          <Box sx={{
            backgroundImage:`url(${logoinmoListopng})`, 
            width:"10rem", 
            height:"10rem", 
            backgroundSize:"contain", 
            backgroundPosition:"center", 
            backgroundRepeat:"no-repeat", 
            borderRadius:2
          }}>
          </Box>

          <Typography 
            variant="h4" 
            sx={{ 
              color: "white", 
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "1rem"
            }}
          >
            Selecciona tu tipo de acceso
          </Typography>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            width: '100%',
            maxWidth: '500px',
            justifyContent: 'center'
          }}>
            <Button
              onClick={() => setLoginType('inquilino')}
              startIcon={<PersonIcon />}
              variant="contained"
              sx={{
                borderRadius: 3,
                backgroundColor: "rgb(54, 154, 159)",
                color: "white",
                minHeight: "4rem",
                fontSize: "1.1rem",
                fontWeight: "bold",
                flex: 1,
                "&:hover": {
                  backgroundColor: "rgb(44, 134, 139)",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Ingresar como Inquilino
            </Button>

            <Button
              onClick={() => setLoginType('propietario')}
              startIcon={<BusinessIcon />}
              variant="contained"
              sx={{
                borderRadius: 3,
                backgroundColor: "rgb(54, 154, 159)",
                color: "white",
                minHeight: "4rem",
                fontSize: "1.1rem",
                fontWeight: "bold",
                flex: 1,
                "&:hover": {
                  backgroundColor: "rgb(44, 134, 139)",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Ingresar como Propietario
            </Button>
          </Box>
        </Box>
      ) : register ? (
        // Formulario de Registro
        <Box sx={{ 
          width: '90%', 
          height: "70vh",
          margin:"auto",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"center",
          gap:"2rem",
          backgroundColor:"rgb(86, 23, 164)",
        }}>
          <Box sx={{
            backgroundImage:`url(${logoinmoListopng})`, 
            width:"8rem", 
            height:"8rem", 
            backgroundSize:"contain", 
            backgroundPosition:"center", 
            backgroundRepeat:"no-repeat", 
            borderRadius:2
          }}>
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              color: "white", 
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "1rem"
            }}
          >
            {loginType === 'propietario' ? 'Registro de Propietarios' : 'Registro de Inquilinos'}
          </Typography>

          <Formik
            initialValues={loginType === 'propietario' ? initialValuesRegisterPropietario : initialValuesRegister}
            onSubmit={loginType === 'propietario' ? handleSubmitRegisterPropietario : handleSubmitRegister}
          >
            {({ values, handleChange, handleBlur, isSubmitting }) => (
              <Form style={{ width: '100%', maxWidth: '400px' }}>
                <Box mb={2}>
                  <Field
                    name="nombre"
                    as={TextField}
                    label="Nombre"
                    type="text"
                    variant="outlined"
                    fullWidth
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.nombre}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor:"white", 
                      color:"#2E2C97",
                      mb: 2
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    name="apellido"
                    as={TextField}
                    label="Apellido"
                    type="text"
                    variant="outlined"
                    fullWidth
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.apellido}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor:"white", 
                      color:"#2E2C97",
                      mb: 2
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    name="dni"
                    as={TextField}
                    label="DNI"
                    type="text"
                    variant="outlined"
                    fullWidth
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.dni}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor:"white", 
                      color:"#2E2C97",
                      mb: 2
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    name="email"
                    as={TextField}
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor:"white", 
                      color:"#2E2C97",
                      mb: 2
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <Field
                    name="password"
                    as={TextField}
                    label="Contraseña"
                    type="password"
                    variant="outlined"
                    fullWidth
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor:"white", 
                      color:"#2E2C97",
                      mb: 2
                    }}
                  />
                </Box>
                <Box sx={{ 
                  display:"flex", 
                  justifyContent:"space-around", 
                  flexDirection:"column", 
                  alignItems:"center", 
                  gap:"1rem" 
                }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ 
                      borderRadius: 6, 
                      backgroundColor:"rgb(54, 154, 159)", 
                      color:"white", 
                      width:"14.5rem", 
                      height:"3rem", 
                      fontSize:"1rem",
                      "&:hover": {
                        backgroundColor: "rgb(44, 134, 139)"
                      }
                    }}
                  >
                    {isSubmitting ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      ) : (
        // Formulario de Login
        <Box sx={{ 
          width: '90%', 
          height: "70vh",
          margin:"auto",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"center",
          gap:"2rem",
          backgroundColor:"rgb(86, 23, 164)",
        }}>
          
          <Box sx={{
            backgroundImage:`url(${logoinmoListopng})`, 
            width:"10rem", 
            height:"10rem", 
            backgroundSize:"contain", 
            backgroundPosition:"center", 
            backgroundRepeat:"no-repeat", 
            borderRadius:2
          }}>
          </Box>

          <Typography 
            variant="h4" 
            sx={{ 
              color: "white", 
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "1rem"
            }}
          >
            {loginType === 'propietario' ? 'Portal de Propietarios' : 'Portal de Inquilinos'}
          </Typography>

          <Formik
            initialValues={initialValues}
            onSubmit={loginType === 'propietario' ? handleSubmitLoginPropietario : handleSubmitLogin}
          >
            {({ values, handleChange, handleBlur, isSubmitting }) => (
              <Form style={{ width: '100%', maxWidth: '400px' }}>
                <Box mb={2}>
                  <Field
                    name="email"
                    as={TextField}
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor:"white", 
                      color:"#2E2C97",
                      mb: 2
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <PasswordTextField 
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    values={values}
                  />
                </Box>
                <Box sx={{ 
                  display:"flex", 
                  justifyContent:"space-around", 
                  flexDirection:"column", 
                  alignItems:"center", 
                  gap:"1rem" 
                }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ 
                      borderRadius: 6, 
                      backgroundColor:"rgb(54, 154, 159)", 
                      color:"white", 
                      width:"14.5rem", 
                      height:"3rem", 
                      fontSize:"1rem",
                      "&:hover": {
                        backgroundColor: "rgb(44, 134, 139)"
                      }
                    }}
                  >
                    {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      )}

   
    </Grid2>
  )
}

export default LoginInquilinos
