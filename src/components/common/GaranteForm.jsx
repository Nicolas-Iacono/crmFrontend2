import React, { useEffect, useState } from 'react';
import GarantesApi from '../api/garanteApi';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import SchemaValidation from '../validation/SchemaValidation';
import { Grid, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography, Switch, Paper, IconButton, CircularProgress, Chip } from '@mui/material';
import Swal from 'sweetalert2';
import ContratoApi from '../api/contratoApi';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { showAlert, showError, showInfo, showSuccess } from '../alertas/showAlert';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const GaranteForm = ({ onSuccess }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [contratos, setContratos] = useState([]);
  const [tipoGarantia, setTipoGarantia] = useState(false);
  
  const [localUser, setLocalUser] = useState({
    name: '',
    authorities: '',
  });
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setLocalUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
      setIsUserLoaded(true);
    }
  }, []);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const authorities = localStorage.getItem("authorities");
    if (username) {
      setLocalUser({ name: username, authorities });
    }
  }, []);

  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    try {
      const response = await ContratoApi.getContratos();
      setContratos(response.data);
    } catch (e) {
      console.error('error al traer contratos: ', e);
    }
  };

  if(contratos.data){
    contratos.data.forEach((contrato) => {});
  }

  const initialValues = {
    pronombre:"",
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    dni: '',
    cuit:'',
    nacionalidad:'',
    direccionResidencial: '',
    estadoCivil:'',
    nombreEmpresa:'',
    legajo:'',
    cuitEmpresa:'',
    sectorActual:'',
    cargoActual:'',
    tipoGarantia:'',
    partidaInmobiliaria:'',
    direccion:'',
    infoCatastral:'',
    estadoOcupacion:'',
    tipoPropiedad:'',
    informeDominio:'',
    informeInhibicion:'',
    nombreUsuario:localUser.name
  };

  const pronombres = [
    { value: 'El Sr.', label: 'El Sr.' },
    { value: 'La Sra.', label: 'La Sra.' },
  ];
  const estadosCiviles = [
    { value: 'Soltero', label: 'Soltero' },
    { value: 'Casado', label: 'Casado' },
    { value: 'Viudo', label: 'Viudo' },
    { value: 'Divorciado', label: 'Divorciado' },
  ];

  const onSubmit = async (values, { setSubmitting }) => {
    const onlyDigits = (v) => (v == null ? '' : String(v).replace(/\D/g, ''));
    const processedValues = {
      ...values,
      dni: values.dni ? parseInt(onlyDigits(values.dni), 10) : values.dni,
      telefono: values.telefono ? parseInt(onlyDigits(values.telefono), 10) : values.telefono,
      cuit: values.cuit ? parseInt(onlyDigits(values.cuit), 10) : values.cuit,
      legajo: values.legajo ? parseInt(onlyDigits(values.legajo), 10) : values.legajo,
      cuitEmpresa: values.cuitEmpresa ? parseInt(onlyDigits(values.cuitEmpresa), 10) : values.cuitEmpresa,
      partidaInmobiliaria: values.partidaInmobiliaria ? parseInt(onlyDigits(values.partidaInmobiliaria), 10) : values.partidaInmobiliaria,
    };

    try {
      await GarantesApi.crearGarante(processedValues);
      showSuccess('Garante creado exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      showError('Error al crear el garante');
    } finally {
      setSubmitting(false);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
      '&.Mui-focused': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#fff' },
    },
  };

  const sectionTitle = (icon, text) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: 1.5,
        bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 18, color: '#8b5cf6' } })}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {text}
      </Typography>
    </Box>
  );

  const errStyle = { color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 };

  if (!isUserLoaded) return null;

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: { xs: 2, sm: 3, md: 2 },
      pb: { xs: 14, sm: 12 },
      pl: { xs: 2, sm: 3, md: '16rem' },
      pr: { xs: 2, sm: 4, md: 3 },
      boxSizing: 'border-box',
    }}>
      <Box sx={{ mt: { xs: '4rem', sm: 0 }, maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => navigate('/garantes')}
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                <PersonAddIcon sx={{ color: '#8b5cf6', fontSize: { xs: 20, sm: 24 } }} />
                Nuevo Garante
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Completa los datos del garante
              </Typography>
            </Box>
          </Box>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={SchemaValidation.garanteValidation}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ values, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
            <Form>
              {/* Datos Personales */}
              <Paper elevation={0} sx={{
                p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}>
                {sectionTitle(<PersonIcon />, 'Datos Personales')}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="pronombre">
                      {({ field, form }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Pronombre</InputLabel>
                          <Select label="Pronombre" {...field} value={form.values.pronombre} onChange={(e) => form.setFieldValue("pronombre", e.target.value)} sx={{ borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                            {pronombres.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="nombre" as={TextField} label="Nombre *" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.nombre} sx={inputSx} />
                    <ErrorMessage name="nombre" component="div" style={errStyle} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="apellido" as={TextField} label="Apellido *" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.apellido} sx={inputSx} />
                    <ErrorMessage name="apellido" component="div" style={errStyle} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="telefono" as={TextField} label="Teléfono" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.telefono} sx={inputSx} />
                    <ErrorMessage name="telefono" component="div" style={errStyle} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="email" as={TextField} label="Email" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.email} sx={inputSx} />
                    <ErrorMessage name="email" component="div" style={errStyle} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="estadoCivil">
                      {({ field, form }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Estado Civil</InputLabel>
                          <Select label="Estado Civil" {...field} value={form.values.estadoCivil} onChange={(e) => form.setFieldValue("estadoCivil", e.target.value)} sx={{ borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                            {estadosCiviles.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Paper>

              {/* Documentación */}
              <Paper elevation={0} sx={{
                p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}>
                {sectionTitle(<BadgeIcon />, 'Documentación y Dirección')}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="dni">
                      {({ field }) => (
                        <TextField {...field} label="DNI" fullWidth size="small" value={field.value}
                          onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 11); setFieldValue('dni', digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')); }}
                          onBlur={handleBlur} sx={inputSx} />
                      )}
                    </Field>
                    <ErrorMessage name="dni" component="div" style={errStyle} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="cuit">
                      {({ field }) => (
                        <TextField {...field} label="CUIT" fullWidth size="small" value={field.value}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                            const a = digits.slice(0, 2), b = digits.slice(2, 10), c = digits.slice(10, 11);
                            setFieldValue('cuit', [a, b, c].map((seg, idx) => (idx === 0 ? seg : seg ? '-' + seg : '')).join('').replace(/^-/, ''));
                          }}
                          onBlur={handleBlur} sx={inputSx} />
                      )}
                    </Field>
                    <ErrorMessage name="cuit" component="div" style={errStyle} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="nacionalidad" as={TextField} label="Nacionalidad" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.nacionalidad} sx={inputSx} />
                    <ErrorMessage name="nacionalidad" component="div" style={errStyle} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="direccionResidencial" as={TextField} label="Dirección Residencial" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.direccionResidencial} sx={inputSx} />
                    <ErrorMessage name="direccionResidencial" component="div" style={errStyle} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Tipo de Garantía Toggle */}
              <Paper elevation={0} sx={{
                p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    label="Recibo de Sueldo"
                    onClick={() => { setTipoGarantia(false); setFieldValue("tipoGarantia", "Recibo de Sueldo"); }}
                    sx={{
                      fontWeight: 600, px: 1,
                      bgcolor: !tipoGarantia ? (isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.15)') : 'transparent',
                      color: !tipoGarantia ? '#8b5cf6' : 'text.secondary',
                      border: `1px solid ${!tipoGarantia ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')}`,
                      '&:hover': { bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)' },
                    }}
                  />
                  <Switch
                    checked={tipoGarantia}
                    onChange={() => {
                      const next = !tipoGarantia;
                      setTipoGarantia(next);
                      setFieldValue("tipoGarantia", next ? "Garantia Propietaria" : "Recibo de Sueldo");
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' },
                    }}
                  />
                  <Chip
                    label="Garantía Propietaria"
                    onClick={() => { setTipoGarantia(true); setFieldValue("tipoGarantia", "Garantia Propietaria"); }}
                    sx={{
                      fontWeight: 600, px: 1,
                      bgcolor: tipoGarantia ? (isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.15)') : 'transparent',
                      color: tipoGarantia ? '#8b5cf6' : 'text.secondary',
                      border: `1px solid ${tipoGarantia ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')}`,
                      '&:hover': { bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)' },
                    }}
                  />
                </Box>

                {tipoGarantia ? (
                  <>
                    {sectionTitle(<HomeWorkIcon />, 'Garantía Propietaria')}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Field name="partidaInmobiliaria" as={TextField} label="Partida Inmobiliaria" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.partidaInmobiliaria} sx={inputSx} />
                        <ErrorMessage name="partidaInmobiliaria" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="direccion" as={TextField} label="Dirección Completa" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.direccion} sx={inputSx} />
                        <ErrorMessage name="direccion" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="infoCatastral" as={TextField} label="Información Catastral" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.infoCatastral} sx={inputSx} />
                        <ErrorMessage name="infoCatastral" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="estadoOcupacion" as={TextField} label="Estado de Ocupación" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.estadoOcupacion} sx={inputSx} />
                        <ErrorMessage name="estadoOcupacion" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="tipoPropiedad" as={TextField} label="Tipo de Propiedad" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.tipoPropiedad} sx={inputSx} />
                        <ErrorMessage name="tipoPropiedad" component="div" style={errStyle} />
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    {sectionTitle(<WorkIcon />, 'Datos Laborales')}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Field name="nombreEmpresa" as={TextField} label="Empresa" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.nombreEmpresa} sx={inputSx} />
                        <ErrorMessage name="nombreEmpresa" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="legajo" as={TextField} label="Legajo" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.legajo} sx={inputSx} />
                        <ErrorMessage name="legajo" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="cuitEmpresa" as={TextField} label="CUIT Empresa" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.cuitEmpresa} sx={inputSx} />
                        <ErrorMessage name="cuitEmpresa" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="sectorActual" as={TextField} label="Sector" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.sectorActual} sx={inputSx} />
                        <ErrorMessage name="sectorActual" component="div" style={errStyle} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="cargoActual" as={TextField} label="Cargo" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.cargoActual} sx={inputSx} />
                        <ErrorMessage name="cargoActual" component="div" style={errStyle} />
                      </Grid>
                    </Grid>
                  </>
                )}
              </Paper>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/garantes')}
                  sx={{
                    flex: { xs: 1, sm: 'none' }, minWidth: { sm: 120 }, borderRadius: 2.5,
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: 'text.primary',
                    '&:hover': { borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                  sx={{
                    flex: { xs: 1, sm: 'none' }, minWidth: { sm: 180 }, borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    boxShadow: 'none', fontWeight: 600,
                    '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' },
                  }}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Garante'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default GaranteForm;
