import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography, useTheme, useMediaQuery, Grid, Paper, IconButton, CircularProgress } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';
import { PropietarioApi } from '../api/propietarios';
import {SchemaValidation} from '../validation/SchemaValidation'
import Swal from 'sweetalert2';
import PropiedadesApi from '../api/propiedades';
import { showAlert, showError, showInfo, showSuccess } from '../alertas/showAlert';
import { useNavigate } from 'react-router-dom';

const PropietarioForm = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [propietarios, setPropietarios] = useState([]);
  const [user, setUser] = useState({
    name: "",
    authorities: "",
  });
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const authorities = localStorage.getItem("authorities");

    if (username) {
      setUser({
        name: username,
        authorities,
      });
      setIsUserLoaded(true);
    }
  }, []);

  useEffect(() => {
    const fetchPropietarios = async () => {
      if (user.name) {
        try {
          const { data } = await PropietarioApi.buscarPropietarioPorUsuario(user.name);
          setPropietarios(data || []);
        } catch (error) {
          console.error(`Error al obtener propietarios: ${error.message}`);
        }
      }
    };
    fetchPropietarios();
  }, [user.name]);

  if(propietarios.data){
    propietarios.data.forEach((propietario)=>{
    })
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
    try {
      const onlyDigits = (v) => (v == null ? '' : String(v).replace(/\D/g, ''));
      const processed = {
        ...values,
        dni: values.dni ? parseInt(onlyDigits(values.dni), 10) : values.dni,
        cuit: values.cuit ? parseInt(onlyDigits(values.cuit), 10) : values.cuit,
        telefono: values.telefono ? parseInt(onlyDigits(values.telefono), 10) : values.telefono,
      };
      await PropietarioApi.crearPropietario(processed);
      showSuccess('Propietario creado exitosamente');
    } catch (error) {
      showError('Error al crear el propietario');
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
              onClick={() => navigate('/propietarios')}
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
                Nuevo Propietario
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Completa los datos del propietario
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={SchemaValidation.propietarioValidation}
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
                          <Select
                            label="Pronombre"
                            {...field}
                            value={form.values.pronombre}
                            onChange={(e) => form.setFieldValue("pronombre", e.target.value)}
                            sx={{ borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                          >
                            {pronombres.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                          </Select>
                        </FormControl>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="nombre" as={TextField} label="Nombre *" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.nombre} sx={inputSx} />
                    <ErrorMessage name="nombre" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="apellido" as={TextField} label="Apellido *" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.apellido} sx={inputSx} />
                    <ErrorMessage name="apellido" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="telefono" as={TextField} label="Teléfono" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.telefono} sx={inputSx} />
                    <ErrorMessage name="telefono" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="email" as={TextField} label="Email" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.email} sx={inputSx} />
                    <ErrorMessage name="email" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="estadoCivil">
                      {({ field, form }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Estado Civil</InputLabel>
                          <Select
                            label="Estado Civil"
                            {...field}
                            value={form.values.estadoCivil}
                            onChange={(e) => form.setFieldValue("estadoCivil", e.target.value)}
                            sx={{ borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                          >
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
                        <TextField
                          {...field}
                          label="DNI"
                          fullWidth
                          size="small"
                          value={field.value}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                            const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                            setFieldValue('dni', formatted);
                          }}
                          onBlur={handleBlur}
                          sx={inputSx}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="dni" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="cuit">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="CUIT"
                          fullWidth
                          size="small"
                          value={field.value}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                            const a = digits.slice(0, 2);
                            const b = digits.slice(2, 10);
                            const c = digits.slice(10, 11);
                            const formatted = [a, b, c]
                              .map((seg, idx) => (idx === 0 ? seg : seg ? '-' + seg : ''))
                              .join('')
                              .replace(/^-/, '');
                            setFieldValue('cuit', formatted);
                          }}
                          onBlur={handleBlur}
                          sx={inputSx}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="cuit" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="nacionalidad" as={TextField} label="Nacionalidad" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.nacionalidad} sx={inputSx} />
                    <ErrorMessage name="nacionalidad" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="direccionResidencial" as={TextField} label="Dirección Residencial" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.direccionResidencial} sx={inputSx} />
                    <ErrorMessage name="direccionResidencial" component="div" style={{ color: theme.palette.error.main, fontSize: '0.75rem', marginTop: 4 }} />
                  </Grid>
                </Grid>
              </Paper>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/propietarios')}
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
                  {isSubmitting ? 'Creando...' : 'Crear Propietario'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default PropietarioForm;
