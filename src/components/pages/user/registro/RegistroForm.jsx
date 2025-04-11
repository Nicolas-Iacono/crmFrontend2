import React from 'react'
import { Formik, Form, Field } from 'formik'
import { Box, Button, TextField, Grid2} from '@mui/material'
import Swal from 'sweetalert2'
import { usuarioApi } from '../../../api/usuarioApi'

const RegistroForm = () => {
  const initialValues = {
    username: '',
    password: '',
    nombreNegocio: '',
    email: ''
  }

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      await usuarioApi.registrarUsuario(values)
      console.log('Usuario registrado correctamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Usuario registrado exitosamente',
        icon: 'success',
      })
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
    <Formik
      initialValues={initialValues}  // Corregido de initValues a initialValues
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur }) => (
        <Form>
          <Grid2 sx={{display:"flex",flexDirection:"column", width:"16.5rem", gap:"1rem"}}>

          <Box>
            <Field
              name="username"
              as={TextField}
              label="Nombre"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
            />
          </Box>
          <Box>
            <Field
              name="password"
              as={TextField}
              label="Contraseña"
              variant="outlined"
              fullWidth
              type="password"  // Añadido type para ocultar la contraseña
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
          </Box>
          <Box>
            <Field
              name="nombreNegocio"
              as={TextField}
              label="Inmobiliaria"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.nombreNegocio}
            />
          </Box>
          <Box>
            <Field
              name="email"
              as={TextField}
              label="Email"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
          </Box>
          </Grid2>

          <Box sx={{ marginTop: "1rem" , display:"flex", justifyContent:"center", alignItems:"center"}}>
            <Button type="submit" variant="contained" color="primary">
            registrar
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  )
}

export default RegistroForm
