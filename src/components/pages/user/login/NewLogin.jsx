import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Grid, 
  IconButton, 
  InputAdornment, 
  useMediaQuery, 
  Divider, 
  Link,
  Fade,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  BusinessCenter,
  Person
} from '@mui/icons-material';
import logo from "../../../../assets/logo2.png";
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AppleIcon from '@mui/icons-material/Apple';

// Estilos personalizados para los componentes
const LoginPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  display: 'flex',
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    maxWidth: '100%',
    borderRadius: 0,
    boxShadow: 'none',
    minHeight: '100vh',
  },
}));

const ImageSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  width: '50%',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(3, 2),
    minHeight: '35vh',
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 6),
  width: '50%',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(3, 2),
  },
}));

const LogoImage = styled('img')({
  maxWidth: '80%',
  maxHeight: '200px',
  objectFit: 'contain',
  marginBottom: 24,
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1),
  marginRight: theme.spacing(2),
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  minWidth: 'auto',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1.5, 0),
  marginTop: theme.spacing(2),
  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
  '&:hover': {
    boxShadow: '0 6px 10px 2px rgba(33, 150, 243, .3)',
  },
}));

const SocialButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const NewLogin = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: { xs: 0, md: 4 },
      }}
    >
      <Fade in={true} timeout={800}>
        <LoginPaper elevation={isMobile ? 0 : 10}>
          <ImageSection>
            <LogoImage src={logo} alt="CRM Inmobiliario" />
            <Typography
              variant="h4"
              color="white"
              fontWeight="bold"
              textAlign="center"
              sx={{ mb: 2 }}
            >
              {isLogin ? 'Bienvenido de nuevo!' : 'Unete a nosotros!'}
            </Typography>
            <Typography
              variant="body1"
              color="white"
              textAlign="center"
              sx={{ opacity: 0.8, maxWidth: '80%' }}
            >
              {isLogin
                ? 'Accede a tu cuenta para gestionar tus propiedades inmobiliarias con eficiencia.'
                : 'Crea una cuenta y comienza a administrar tus propiedades con nuestro avanzado sistema CRM.'}
            </Typography>
            
            {/* Formas decorativas para el fondo */}
            <Box
              sx={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                top: '-50px',
                right: '-100px',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                bottom: '-50px',
                left: '-50px',
              }}
            />
          </ImageSection>

          <FormSection>
            <Typography
              variant="h4"
              color="textPrimary"
              fontWeight="bold"
              sx={{ mb: 4 }}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Typography>

            {/* Formulario de Registro */}
            {!isLogin && (
              <>
                <StyledTextField
                  label="Nombre de usuario"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <StyledTextField
                  label="Nombre del negocio"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessCenter color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}

            {/* Campos comunes */}
            <StyledTextField
              label="Correo electrónico"
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              label="Contraseña"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {isLogin && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mb: 2,
                }}
              >
                <Link
                  href="#"
                  underline="hover"
                  color="primary"
                  sx={{ fontSize: '0.875rem' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>
            )}

            <LoginButton
              variant="contained"
              fullWidth
              color="primary"
              disableElevation
            >
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </LoginButton>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 3,
                mb: 3,
              }}
            >
              <Divider sx={{ flexGrow: 1 }} />
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mx: 2 }}
              >
                O continúa con
              </Typography>
              <Divider sx={{ flexGrow: 1 }} />
            </Box>

            <SocialButtonsContainer>
              <SocialButton variant="outlined" color="primary">
                <GoogleIcon />
              </SocialButton>
              <SocialButton variant="outlined" color="primary">
                <FacebookIcon />
              </SocialButton>
              <SocialButton variant="outlined" color="primary">
                <AppleIcon />
              </SocialButton>
            </SocialButtonsContainer>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={toggleMode}
                  color="primary"
                  underline="hover"
                >
                  {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </Link>
              </Typography>
            </Box>
          </FormSection>
        </LoginPaper>
      </Fade>
    </Box>
  );
};

export default NewLogin;
