import { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { Box, Button, TextField, Typography, Link, Paper} from '@mui/material'
import usuarioApi from '../../../api/usuarioApi'
import { useAuth } from '../../../context/GlobalAuth'
import { useNavigate } from 'react-router-dom'
import { showStyledError } from '../../../../utils/swalConfig';
import Swal from 'sweetalert2'
import PasswordTextField from '../../../common/PasswordTextField'
import logoinmoListopng from "../../../../assets/logoinmoListopng.png"
import { styled } from '@mui/material/styles'

const LoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [register, setRegister] = useState(false)

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
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: '¡Inicio de sesión exitoso!',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          background: "rgb(86, 23, 164)", // color de fondo de la app
          color: 'white',
          customClass: {
            popup: 'swal2-smaller-toast'
          }
        })

        // Redirige a /contratos después de un breve retraso
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        console.log("Inicio de sesión fallido: ", response)
        showStyledError('Error al iniciar sesión', response.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      showStyledError('Error al iniciar sesión', error.message || 'Ocurrió un error');
    } finally {
      setSubmitting(false)
    }
  }

  const ToggleLink = styled(Link)({
    cursor: "pointer",
    fontWeight: "600",
    "&:hover": {
      textDecoration: "underline",
    },
  });

  const cambio = () => {
    setRegister(!register)
  }
  return (

    <Box elevation={6} sx={{ borderRadius: 1, p: 2,width: '90%', height: "70vh",margin:"auto",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      gap:"2rem",
      backgroundColor:"rgb(86, 23, 164)",
     }}>

      <Box sx={{backgroundImage:`url(${logoinmoListopng})`, width:"34rem", height:"10rem", backgroundSize:"cover", backgroundPosition:"center", backgroundRepeat:"no-repeat", borderRadius:2}}>
      </Box>
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmitLogin}
    >
      {({ values, handleChange, handleBlur, isSubmitting }) => (
        <Form >
          <Box mb={2} >
            <Field
              name="username"
              as={TextField}
              label="Nombre"
              variant="outlined"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
              sx={{ borderRadius: 2, backgroundColor:"white", color:"#2E2C97" }}
            />
          </Box>
          <Box mb={2}>
           <PasswordTextField 
              handleChange={handleChange}
              handleBlur={handleBlur}
              values={values}/>
          </Box>
          <Box sx={{ display:"flex", justifyContent:"space-around", flexDirection:"column", alignItems:"center", gap:"1rem", }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              sx={{ borderRadius: 2, backgroundColor:"rgb(54, 154, 159)", color:"white" }}
            >
              Iniciar Sesión
            </Button>

              
          </Box>
        </Form>
        
       
      )}
    </Formik>
    
    </Box>
  )
}

export default LoginForm
