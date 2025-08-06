import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Box, Button, TextField, Typography, Stack, Modal, IconButton, Grid2} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { usuarioApi } from '../../../api/usuarioApi';
import logoinmoListopng from "../../../../assets/logoinmo512.png"

const RegistroForm = () => {
  const [openModal, setOpenModal] = useState(false);

  const initialValues = {
    username: '',
    password: '',
    nombreNegocio: '',
    email: '',
    cuit: '',
    razonSocial: '',
    partido: '',
    provincia: '',
    localidad: '',
    matricula: ''
  }

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
      Swal.fire({
        title: 'Error',
        text: 'Error al registrar usuario',
        icon: 'error',
      })
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
                onSubmit={onSubmit}
              >
                {({ values, handleChange, handleBlur, isSubmitting }) => (
                  <Form>
        <Grid2 container spacing={2} sx={{ display:"flex", flexDirection:{ xs: "column", md: "row" }, alignItems:"center", justifyContent:"center" }}>
          {/* Primera columna */}
          <Grid2 item xs={12} md={6}>
            <Stack spacing={2}>
              <Field
                name="username"
                as={TextField}
                label="Nombre"
                variant="outlined"
                fullWidth
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.username}
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Grid2>

          {/* Segunda columna */}
          <Grid2 item xs={12} md={6}>
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
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
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
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Grid2>

          {/* Botón de envío */}
          <Grid2 item xs={12}>
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
