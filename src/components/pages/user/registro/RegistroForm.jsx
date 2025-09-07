import React, { useState, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { Box, Button, TextField, Typography, Stack, Modal, IconButton, Grid2} from '@mui/material';
import { Close as CloseIcon, Google as GoogleIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { usuarioApi } from '../../../api/usuarioApi';
import logoinmoListopng from "../../../../assets/logoinmo512.png"
import GoogleLogin  from "../../../../assets/logoGoogle.png"
import ButtonLoginGoogle from "../../../common/BotonGoogle/GoogleLoginButton"
import axios from 'axios';
import { registroSchema } from '../../../common/validationsForms/registroSchema';
const RegistroForm = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  const initialValues = {
    username: '',
    password: '',
    nombreNegocio: '',
    email: '',
    telefono: '',
    cuit: '',
    razonSocial: '',
    partido: '',
    provincia: '',
    localidad: '',
    matricula: ''
  }
function debounceAsync(fn, delay) {
  let timer;
  return (...args) =>
    new Promise((resolve) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
}

// validador "crudo"
async function validateUsernameRaw(value) {
  if (!value) return "El username es obligatorio";
  if (value.trim().length < 4) return "El username debe tener al menos 4 caracteres";
  // podés agregar aquí la misma regex que en Yup si querés reforzar
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/usuario/check-username`,
      { params: { username: value.trim() } }
    );
    console.log(data)
    if (!data?.available) return "El username ya está en uso";
    return undefined; // válido -> sin error
  } catch {
    // no bloquees al usuario si el check falla; mostrale un mensaje suave
    return "No se pudo validar el username";
  }
}

  const validateUsernameDebounced = useMemo(
    () => debounceAsync(validateUsernameRaw, 500),
    []
  );

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      await usuarioApi.registrarUsuario(values)
      console.log('Usuario registrado correctamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Usuario registrado exitosamente',
        icon: 'success',
      })
      handleCloseModal(); // Cerrar modal después del éxito
    } catch (error) {
      console.error(`Error al registrar usuario: ${error.message}`);
      if (error.response?.data?.error) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg(error.message);
      }
      setOpenError(true);
    } finally {
      setSubmitting(false); // Desactiva el estado de "submitting"
    }
  }

  return (
    <>
      {/* Página principal con botón para abrir modal */}
      <Box sx={{ 
        width: '100vw', 
        height: '100vh',
        backgroundColor: "rgb(86, 23, 164)",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
      }}>
        {/* Logo */}
        <Box sx={{
          backgroundImage: `url(${logoinmoListopng})`, 
          width: { xs: "330px", md: "400px" }, 
          height: { xs: "330px", md: "120px" }, 
          backgroundSize: "contain", 
          backgroundPosition: "center", 
          backgroundRepeat: "no-repeat", 
          borderRadius: 2
        }} />
        
        {/* Título */}
        <Typography variant="h4" fontWeight={700} align="center" sx={{ 
          color: "white", 
          fontSize: { xs: '1.8rem', md: '2.5rem' },
          mb: 2
        }}>
          Bienvenido
        </Typography>
        
        {/* Botón para abrir modal */}
        <Button
          variant="contained"
          size="large"
          onClick={handleOpenModal}
          sx={{
            backgroundColor: "white",
            color: "rgb(86, 23, 164)",
            fontSize: { xs: '1rem', md: '1.2rem' },
            fontWeight: 600,
            px: { xs: 4, md: 6 },
            py: { xs: 1.5, md: 2 },
            borderRadius: 3,
            '&:hover': {
              backgroundColor: "#f5f5f5"
            }
          }}
        >
          Iniciar Registro
        </Button>

      
      </Box>
    

      {/* Modal con formulario de registro */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{
          width: { xs: '100vw', md: '90vw' },
          height: { xs: '100vh', md: '90vh' },
          backgroundColor: "rgb(86, 23, 164)",
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: { xs: 0, md: 2 }
        }}>
          {/* Header del modal con logo y botón cerrar */}
          <Box sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: "rgb(86, 23, 164)",
            padding: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Botón cerrar */}
            <Box sx={{ alignSelf: 'flex-end' }}>
              <IconButton
                onClick={handleCloseModal}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            
    
         
            
          
            
          </Box>

          {/* Contenedor del formulario con scroll */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            padding: { xs: 2, md: 3 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: { xs: 3, md: 4 }
          }}>
            <Box sx={{
              width: '100%',
              maxWidth: '1000px',
              backgroundColor: "white",
              borderRadius: 6,
              padding: { xs: 3, md: 4 },
              minHeight: 'fit-content',
              margin: { xs: 1, md: 2 }
            }}>
              {/* Título del formulario */}
              <Typography variant="h5" fontWeight={600} align="center" sx={{
                color: "rgb(86, 23, 164)",
                mb: 3,
                fontSize: { xs: '1.3rem', md: '1.5rem' }
              }}>
                Crear cuenta
              </Typography>
              
              <Formik
                initialValues={initialValues}
                validationSchema={registroSchema}
                onSubmit={onSubmit}
              >
                {({ values, handleChange, handleBlur, isSubmitting, errors, touched }) => (
                  <Form>
        <Grid2 container spacing={2} sx={{ display:"flex", flexDirection:{ xs: "column", md: "row" }, alignItems:"center", justifyContent:"center" }}>
          {/* Primera columna */}
          <Grid2 xs={12} md={6}>
            <Stack spacing={2}>
              <Field
                name="username"
                as={TextField}
                label="Username"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.username}
                placeholder="Nombre de usuario"
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
                validate={(value) => validateUsernameDebounced(value)}
                sx={{
                  borderRadius: 2,
                  ...(touched.username && !errors.username && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="password"
                as={TextField}
                label="Contraseña"
                variant="outlined"
                fullWidth
                type="password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
                placeholder="Tu contraseña"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                sx={{
                  borderRadius: 2,
                  ...(touched.password && !errors.password && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="nombreNegocio"
                as={TextField}
                label="Inmobiliaria"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.nombreNegocio}
                placeholder="Nombre de la inmobiliaria"
                error={touched.nombreNegocio && Boolean(errors.nombreNegocio)}
                sx={{
                  borderRadius: 2,
                  ...(touched.nombreNegocio && !errors.nombreNegocio && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="email"
                as={TextField}
                label="Email"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                placeholder="ejemplo@gmail.com"
                error={touched.email && Boolean(errors.email)}
                sx={{
                  borderRadius: 2,
                  ...(touched.email && !errors.email && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
               <Field
                name="Telefono"
                as={TextField}
                label="Telefono"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.telefono}
                placeholder="+54 9 11 12345678"
                error={touched.telefono && Boolean(errors.telefono)}
                sx={{
                  borderRadius: 2,
                  ...(touched.telefono && !errors.telefono && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="cuit"
                as={TextField}
                label="CUIT"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.cuit}
                placeholder="Ej: 20-12345678-1"
                error={touched.cuit && Boolean(errors.cuit)}
                helperText={touched.cuit && errors.cuit}
                sx={{
                  borderRadius: 2,
                  ...(touched.cuit && !errors.cuit && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
            </Stack>
          </Grid2>

          {/* Segunda columna */}
          <Grid2 xs={12} md={6}>
            <Stack spacing={2}>
              <Field
                name="razonSocial"
                as={TextField}
                label="Razón Social"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.razonSocial}
                placeholder="Ej: Corrientes 321"
                error={touched.razonSocial && Boolean(errors.razonSocial)}
                helperText={touched.razonSocial && errors.razonSocial}
                sx={{
                  borderRadius: 2,
                  ...(touched.razonSocial && !errors.razonSocial && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="partido"
                as={TextField}
                label="Partido"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.partido}
                error={touched.partido && Boolean(errors.partido)}
                helperText={touched.partido && errors.partido}
                sx={{
                  borderRadius: 2,
                  ...(touched.partido && !errors.partido && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="provincia"
                as={TextField}
                label="Provincia"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.provincia}
                error={touched.provincia && Boolean(errors.provincia)}
                helperText={touched.provincia && errors.provincia}
                sx={{
                  borderRadius: 2,
                  ...(touched.provincia && !errors.provincia && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="localidad"
                as={TextField}
                label="Localidad"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.localidad}
                error={touched.localidad && Boolean(errors.localidad)}
                helperText={touched.localidad && errors.localidad}
                sx={{
                  borderRadius: 2,
                  ...(touched.localidad && !errors.localidad && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
              <Field
                name="matricula"
                as={TextField}
                label="Matrícula"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.matricula}
                placeholder="Ej: 12345"
                error={touched.matricula && Boolean(errors.matricula)}
                helperText={touched.matricula && errors.matricula}
                sx={{
                  borderRadius: 2,
                  ...(touched.matricula && !errors.matricula && {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'green' },
                      '&:hover fieldset': { borderColor: 'green' },
                      '&.Mui-focused fieldset': { borderColor: 'green' },
                    },
                    '& label.Mui-focused': { color: 'green' },
                  }),
                }}
              />
            </Stack>
          </Grid2>

          {/* Botón de envío */}
          <Grid2 xs={12}>
            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{
                  mt: 1,
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: 1,
                  backgroundColor: "rgb(86, 23, 164)",
                  color: "white",
                  '&:hover': {
                    backgroundColor: "rgb(76, 13, 154)"
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </Form>
    )}
  </Formik>
</Box>
          </Box>
        </Box>
      </Modal>
    </>
  );  

};

export default RegistroForm
