import { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { Box, Button, TextField, Typography, Link} from '@mui/material'
import usuarioApi from '../../../api/usuarioApi'
import { useAuth } from '../../../context/GlobalAuth'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import PasswordTextField from '../../../common/PasswordTextField'

const LoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const initialValues = {
    username: '',
    password: '',
  }
const ir = (url) =>{
  navigate(url)
}
  const handleSubmitLogin = async (values, { setSubmitting }) => {
    console.log('Form data', values);
    try {
      const response = await usuarioApi.login(values)
      console.log(response)
      // Verifica la respuesta y maneja el JWT
      if (response && response.jwt && response.username) {
        // Llama a login del contexto con el token y el nombre de usuario
        login(response.jwt, response.username)
        
        Swal.fire(
          '¡Inicio de sesión exitoso!',
          'Has iniciado sesión correctamente',
          'success'
        )

        // Redirige a /contratos después de un breve retraso
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        console.log("Inicio de sesión fallido: ", response)
        Swal.fire(
          'Error al iniciar sesión',
          response.message || 'Credenciales incorrectas',
          'error'
        )
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      Swal.fire(
        'Error al iniciar sesión',
        error.message || 'Ocurrió un error',
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmitLogin}
    >
      {({ values, handleChange, handleBlur, isSubmitting }) => (
        <Form>
          <Box mb={2}>
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
          <Box mb={2}>
           <PasswordTextField 
              handleChange={handleChange}
              handleBlur={handleBlur}
              values={values}/>
          </Box>
          <Box sx={{ display:"flex", justifyContent:"space-around", flexDirection:"column", alignItems:"center", gap:"1rem"}}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              Iniciar Sesión
            </Button>

              
          </Box>
        </Form>
        
       
      )}
    </Formik>
  )
}

export default LoginForm
