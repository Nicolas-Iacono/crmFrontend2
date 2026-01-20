import React, { useState, useMemo } from 'react';
import { Formik, Form } from 'formik';
import { 
  Box, 
  Button, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Divider,
  IconButton,
  Container,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Apple as AppleIcon,
  Google as GoogleIcon, 
  Facebook as FacebookIcon,
  Visibility,
  VisibilityOff,
  TheaterComedy
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { usuarioApi } from '../../../api/usuarioApi';
import axios from 'axios';
import { registroSchema } from '../../../common/validationsForms/registroSchema';
import { showSuccess, showError, showWarning } from '../../../alertas/showAlert';
import FormTextField from '../../../common/FormTextField/FormTextField';
import banderaArgentina from '../../../../assets/banderas/banderaArgentina.png';
import banderaBolivia from '../../../../assets/banderas/banderaBolivia.png';
import banderaBrasil from '../../../../assets/banderas/banderaBrasil.png';
import banderaChile from '../../../../assets/banderas/banderaChile.png';
import banderaEeuu from '../../../../assets/banderas/banderaEeuu.png';
import banderaParaguay from '../../../../assets/banderas/banderaParaguay.png';
import banderaSpain from '../../../../assets/banderas/banderaSpain.png';
import banderaUruguay from '../../../../assets/banderas/banderaUruguay.png';
import logoBlanco from '../../../../assets/logotipoblanco.png'
import logoT from "../../../../assets/logoInmo512.png";
const RegistroForm = ({ onRegistroExitoso }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [country, setCountry] = useState('AR');

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
  const countryOptions = useMemo(() => ([
    { code: 'AR', name: 'Argentina', prefix: '+54' },
    { code: 'UY', name: 'Uruguay', prefix: '+598' },
    { code: 'CL', name: 'Chile', prefix: '+56' },
    { code: 'PY', name: 'Paraguay', prefix: '+595' },
    { code: 'BO', name: 'Bolivia', prefix: '+591' },
    { code: 'BR', name: 'Brasil', prefix: '+55' },
    { code: 'US', name: 'Estados Unidos', prefix: '+1' },
    { code: 'ES', name: 'España', prefix: '+34' },
  ]), []);
  const flagSrc = (code = '') => {
    switch ((code || '').toUpperCase()) {
      case 'AR': return banderaArgentina;
      case 'UY': return banderaUruguay;
      case 'CL': return banderaChile;
      case 'PY': return banderaParaguay;
      case 'BO': return banderaBolivia;
      case 'BR': return banderaBrasil;
      case 'US': return banderaEeuu;
      case 'ES': return banderaSpain;
      default: return banderaArgentina;
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values, { setSubmitting }) => {
    if (!acceptTerms) {
      showWarning('Debes aceptar los términos y condiciones');
      setSubmitting(false);
      return;
    }

    try {
      await usuarioApi.registrarUsuario(values);
      showSuccess('Usuario registrado exitosamente');
      
      // Cambiar al formulario de login después del registro exitoso
      setTimeout(() => {
        if (onRegistroExitoso) {
          onRegistroExitoso();
        }
      }, 1000); // Esperar 1 segundo para que el usuario vea el mensaje de éxito
      
    } catch (error) {
      console.error(`Error al registrar usuario: ${error.message}`);
      showError(error.response?.data?.error || error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgb(117,104,218) 0%, rgb(86,23,164) 50%)',
        minHeight: '100dvh',
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: { xs: 'center', md: 'space-between' },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '50%',
          minHeight: '100dvh',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Box
            sx={{
              backgroundImage: `url(${logoT})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              maxWidth: 460,
              height: 360,
            }}
          />
          <Box
            sx={{
              backgroundImage: `url(${logoBlanco})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              maxWidth: 230,
              height: 90,
             

            }}
          />
        </Box>
      </Box>
    

      <Container
        sx={{
          width: { xs: '100%', md: '50%' },
          maxWidth: { xs: '100%', md: '50%' },
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: { xs: 2, md: 4 },
          overflowY: 'auto',        // 👈 ahora el scroll está aquí
          maxHeight: '100dvh',
          scrollbarWidth: 'none',   // Firefox
  '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 600,
            px: 3,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ 
              color: 'white',
              mb: 1,
              fontSize: { xs: '24px', md: '28px' }
            }}>
              Crear Cuenta
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px'
            }}>
              Llená los campos para crear tu cuenta
            </Typography>
          </Box>

          {/* Formulario */}
          <Formik
            initialValues={initialValues}
            validationSchema={registroSchema}
            onSubmit={onSubmit}
          >
            {({ values, handleChange, handleBlur, isSubmitting, errors, touched, setFieldValue }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  {/* Campos básicos */}
                  <FormTextField
                    name="username"
                    label="Username"
                    placeholder="Nombre de usuario"
                  />
                  
                  <FormTextField
                    name="email"
                    label="Email"
                    placeholder="ejemplo@gmail.com"
                    type="email"
                  />
                  
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <FormTextField
                      name="password"
                      label="Password"
                      placeholder="Tu contraseña"
                      type={showPassword ? "text" : "password"}
                    />
                    <IconButton
                      onClick={togglePasswordVisibility}
                      sx={{
                        position: 'absolute',
                        right: 12,
                        top: 32,
                        color: '#999'
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>

                  {/* Campos del negocio */}
                  <FormTextField
                    name="nombreNegocio"
                    label="Inmobiliaria"
                    placeholder="Nombre de la inmobiliaria"
                  />

                  {/* Teléfono con país */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '30% 68%', gap: 1, alignItems: 'start', mb: 1.5 }}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ mb: 0.5, color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}
                      >
                        País
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={country}
                          renderValue={(value) => (
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                              <img src={flagSrc(value)} alt={value} style={{ height: 20, width: 28, objectFit: 'cover', borderRadius: 4 }} />
                            </Box>
                          )}
                          onChange={(e) => {
                          const newCode = e.target.value;
                          setCountry(newCode);
                          const prefix = countryOptions.find(c => c.code === newCode)?.prefix || '';
                          const rest = (values.telefono || '').replace(/^\+?\d+\s?/, '');
                          setFieldValue('telefono', prefix ? `${prefix} ${rest}` : rest);
                          }}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            backgroundColor: '#f5f5f5', borderRadius: '12px', height: '48px',
                            '& .MuiSelect-select': { display: 'flex', alignItems: 'center', py: 0 },
                          }}
                        >
                          {countryOptions.map(opt => (
                            <MenuItem key={opt.code} value={opt.code}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <img src={flagSrc(opt.code)} alt={opt.code} style={{ height: 16, width: 24, objectFit: 'cover', borderRadius: 3 }} />
                                {opt.name} ({opt.prefix})
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <FormTextField
                      name="telefono"
                      label="Teléfono"
                      placeholder="+54 9 11 12345678"
                      onChange={(e) => {
                        // Mantener el prefijo del país seleccionado al inicio
                        const prefix = countryOptions.find(c => c.code === country)?.prefix || '';
                        const digitsRest = (e.target.value || '').replace(/^\+?\d+\s?/, '');
                        setFieldValue('telefono', prefix ? `${prefix} ${digitsRest}` : digitsRest);
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          height: '48px',
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    />
                  </Box>
                  {/* Si no hay teléfono inicial, pre-cargar prefijo seleccionado */}
                  {(!values.telefono && country) ? (() => {
                    const prefix = countryOptions.find(c => c.code === country)?.prefix || '';
                    if (prefix) setFieldValue('telefono', `${prefix} `);
                    return null;
                  })() : null}

                  <FormTextField
                    name="cuit"
                    label="CUIT"
                    placeholder="Ej: 20-12345678-1"
                    inputProps={{ maxLength: 13, inputMode: 'numeric' }}
                    onChange={(e) => {
                      const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 11);
                      let formatted = digits;
                      if (digits.length > 2 && digits.length <= 10) {
                        formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
                      } else if (digits.length > 10) {
                        formatted = `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
                      }
                      setFieldValue('cuit', formatted);
                    }}
                  />

                  <FormTextField
                    name="razonSocial"
                    label="Razón Social"
                    placeholder="Razón social de la empresa"
                  />

                  {/* Campos de ubicación */}
                  <FormTextField
                    name="partido"
                    label="Partido"
                    placeholder="Partido"
                  />

                  <FormTextField
                    name="provincia"
                    label="Provincia"
                    placeholder="Provincia"
                  />

                  <FormTextField
                    name="localidad"
                    label="Localidad"
                    placeholder="Localidad"
                  />

                  <FormTextField
                    name="matricula"
                    label="Matrícula"
                    placeholder="Ej: 12345"
                  />
                </Box>

                {/* Checkbox términos y condiciones */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        '&.Mui-checked': {
                          color: 'white',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                      Acepto {' '}
                      <Typography component="span" sx={{ color: 'white', textDecoration: 'underline' }}>
                       <Link sx={{color:"white", textDecoration:"none"}} href="https://landing.tuinmo.net/privacidad-tuinmo">
                       Términos y Condiciones
                       
                       </Link>
                      </Typography>
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                {/* Botón Sign Up */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting || !acceptTerms}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#6c5ce7',
                    borderRadius: '25px',
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    textTransform: 'none',
                    mb: 4,
                    '&:hover': {
                      backgroundColor: 'white',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      color: 'rgba(108,92,231,0.5)'
                    }
                  }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </Button>

           

               

          
              </Form>
            )}
          </Formik>
        </Box>
      </Container>

  
    </Box>
  );  

};

export default RegistroForm
