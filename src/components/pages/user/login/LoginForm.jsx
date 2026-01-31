import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { Box, Button, TextField, Typography, Link, Paper, Dialog, Slide, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import usuarioApi from '../../../api/usuarioApi'
import { useAuth } from '../../../context/GlobalAuth'
import { useNavigate } from 'react-router-dom'
import { showStyledError } from '../../../../utils/swalConfig';
import Swal from 'sweetalert2'
import PasswordTextField from '../../../common/PasswordTextField'
import logoinmoListopng from "../../../../assets/logotipoblanco.png"
import { styled } from '@mui/material/styles'
import { showSuccess, showError, showWarning, showInfo } from '../../../alertas/showAlert';
// Stable Transition outside component to avoid recreation every render
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})
const LoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [register, setRegister] = useState(false)
  const [openRecover, setOpenRecover] = useState(false)
  const [recoverEmail, setRecoverEmail] = useState('')
  const [recoverLoading, setRecoverLoading] = useState(false)

  const initialValues = {
    username: '',
    password: '',
  }
const ir = (url) =>{
  navigate(url)
}
  const handleSubmitLogin = async (values, { setSubmitting }) => {
    try {
      const response = await usuarioApi.login(values)
      if (response && response.jwt && response.username) {
        login(response.jwt, response.username)
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
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

        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
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

    <Box elevation={0} sx={{
      width: '100%',
      maxWidth: 820,
      margin: '0 auto',
      mt: { xs: 4, md: 8 },
      p: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
     }}>

      <Box sx={{
        width: 520,
        height: 520,
        backgroundImage: `url(${logoinmoListopng})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        mt: -15,
        mb: -15,
      }} />

      <Box sx={{ width: '100%', px: 3, pt: 1, pb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width:"100%" }}>
       
       <Box sx={{display:"flex", alignItems:"center", gap:"1rem", width:"80%", paddingLeft:"2rem"}}>

        <Typography variant="h5" sx={{ fontWeight: 400, color: "rgba(53, 52, 54, 1)"}}>
         Login
        </Typography>
       </Box>

    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmitLogin}
    >
      {({ values, handleChange, handleBlur, isSubmitting }) => (
        <Form >
          <Box mb={2} sx={{ width: '80vw', maxWidth: 600 }}>
            <Field
              name="username"
              as={TextField}
              label="Nombre de tu inmo, email ..."
              variant="outlined"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 14,
                  backgroundColor: 'white',
                }
              }}
            />
          </Box>
          <Box mb={2} sx={{ width: '80vw', maxWidth: 600 }}>
           <PasswordTextField 
           sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius:14,
              backgroundColor: 'white',
            }
          }}
              handleChange={handleChange}
              handleBlur={handleBlur}
              values={values}/>
          </Box>
          <Box sx={{ display:"flex", justifyContent:"space-around", flexDirection:"column", alignItems:"center", gap:"1rem", width: '80vw', maxWidth: 600 }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              sx={{
                borderRadius: 999,
                width: '100%',
                height: '48px',
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(90deg, rgba(119, 90, 224, 1) 0%, rgba(99, 67, 173, 100%))',
                boxShadow: '0 8px 20px rgba(108,62,255,0.35)',
                '&:hover': {
                  background: 'linear-gradient(90deg,  rgba(119, 90, 224, 1) 0%, rgba(99, 67, 173, 1)) 100%)'
                }
               }}
            >
              Iniciar Sesión
            </Button>

            <Link
              component="button"
              type="button"
              underline="hover"
              sx={{ mt: 1, color: 'rgba(122, 37, 192, 1)', fontWeight: 500, fontFamily: 'Roboto, Arial, sans-serif' }}
              onClick={() => setOpenRecover(true)}
            >
              Olvidé la contraseña
            </Link>
          </Box>
        </Form>
        
       
      )}
    </Formik>
    </Box>
    {/* Modal Recuperar contraseña */}
    <Dialog
      open={openRecover}
      onClose={() => setOpenRecover(false)}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="xs"
      keepMounted
      disableScrollLock
      disableEnforceFocus
      disableRestoreFocus
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-end',
        },
      }}
      PaperProps={{
        sx: {
          background: 'linear-gradient(0deg, rgb(117,104,218) 0%, rgba(86, 23, 164, 0.41) 50%)',
          position: 'fixed',
           backdropFilter: 'blur(20px)',
           WebkitBackdropFilter: 'blur(20px)',
          bottom: 0,
          left: 0,
          right: 0,
          m: 0,
          width: '100%',
          height: '40%',
          borderTopLeftRadius: '25px',
          borderTopRightRadius: '25px',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }
      }}
    >
      <Box sx={{ position: 'relative', p: 2, mt: 1, mb:2 }}>
       
        <IconButton
          aria-label="cerrar"
          onClick={() => setOpenRecover(false)}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
          Recuperar contraseña
        </Typography>
      </Box>
      <Box sx={{ display:"flex", flexDirection:"column", alignItems:"end", justifyContent:"center", gap:"1rem", width:"80%", margin:"0 auto" }}>

      <Box sx={{ mb: 2, maxHeight: '60vh', overflowY: 'auto',width: '100%', margin:"0 auto", mt:2 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={recoverEmail}
          onChange={(e) => setRecoverEmail(e.target.value)}
          sx={{ borderRadius: 3, backgroundColor: 'white', color: '#2E2C97' }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Button
          variant="contained"
          sx={{
            borderRadius: 5,
            backgroundColor: 'rgb(54, 154, 159)',
            color: 'white',
            height: '3rem',
            fontSize: '1rem',
            px: 3,
            mt: 3,
            width:"10rem"
          }}
          disabled={recoverLoading || !recoverEmail}
          onClick={async () => {
            if (!recoverEmail) {
              showStyledError('Email requerido', 'Por favor ingresá tu email.');
              return;
            }
            try {
              setRecoverLoading(true);
              await usuarioApi.forgotPassword(String(recoverEmail || '').trim());
              showInfo('Te enviamos un correo si el email existe. Revisá tu bandeja de entrada y spam.', '¡Listo!');
              setOpenRecover(false);
              setRecoverEmail('');
            } catch (error) {
              const status = error?.response?.status;
              const backendMsg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                (typeof error?.response?.data === 'string' ? error.response.data : null);
              showStyledError(
                'No pudimos iniciar el recupero',
                backendMsg || (status ? `Error ${status}` : error.message) || 'Intentá nuevamente en unos minutos.'
              );
            } finally {
              setRecoverLoading(false);
            }
          }}
        >
          {recoverLoading ? 'Enviando...' : 'Recuperar'}
        </Button>
      </Box>
      </Box>

    </Dialog>
    
    </Box>
  )
}

export default LoginForm
