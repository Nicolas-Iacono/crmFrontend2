import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Grid, Typography, InputAdornment, Switch, FormControlLabel, Paper, IconButton, CircularProgress } from '@mui/material';
import { PropiedadesApi } from '../api/propiedades';
import { SchemaValidation } from "../validation/SchemaValidation";
import { useNavigate } from 'react-router-dom';
import http from '../api/http';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { showError, showSuccess } from '../alertas/showAlert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GarageIcon from '@mui/icons-material/Garage';
import YardIcon from '@mui/icons-material/Yard';
import GrassIcon from '@mui/icons-material/Grass';
import PoolIcon from '@mui/icons-material/Pool';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

const PropiedadesForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [numDePalabras, setNumDePalabras] = useState(0);
  const [propietarios, setPropietarios] = useState({ data: [] });
  const [searchTermPropietario, setSearchTermPropietario] = useState('');
  const [showOwnerSelection, setShowOwnerSelection] = useState(false);
  const [alert, setAlert] = useState(false)
  const [user, setUser] = useState({
    name: "",
    authorities: "",
  });
  
  // Obtener el usuario de localStorage solo una vez al montar el componente
  useEffect(() => {
    const username = localStorage.getItem("username");
    const authorities = localStorage.getItem("authorities");

    if (username) {
      setUser({
        name: username,
        authorities,
      });
    }
  }, []);

  useEffect(() => {
  const fetchPropietarios = async () => {
    try {
        const response = await http.get(`${import.meta.env.VITE_API_URL}/propietario/me`);
        const propietariosObtenidos = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data && Array.isArray(response.data.data)) 
          ? response.data.data 
          : [];
      
      setPropietarios({ data: propietariosObtenidos });
    } catch (error) {
      console.error('Error fetching propietarios:', error);
    }
  };
    fetchPropietarios();
  }, [user]);

  const initialValues = {
    direccion: '',
    localidad: '',
    partido: '',
    provincia: '',
    disponibilidad: false,
    precio: '',
    cantidadAmbientes: '',
    pileta: false,
    cochera: false,
    jardin: false,
    patio: false,
    tipo: "",
    inventario: "",
    id_propietario: ''
  };
  const tipos = [
    { value: 'PH', label: 'PH' },
    { value: 'Casa de material', label: 'Casa de material' },
    { value: 'Casa prefabricada', label: 'Casa prefabricada' },
    { value: 'Departamento', label: 'Departamento' },
    { value: 'Terreno', label: 'Terreno' },
    { value: 'Chalet', label: 'Chalet' },
    { value: 'Galpon', label: 'Galpon' },
    {value: "Local", label:"Local"}
  ];

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      // Aseguramos que nombreUsuario esté establecido antes de enviar
            const dataToSend = {
        ...values,
        id_propietario: values.id_propietario || null,
        nombreUsuario: user.name || localStorage.getItem("username") || "",
        precio: values.precio !== '' ? Number(values.precio) : null,
        cantidadAmbientes: values.cantidadAmbientes !== '' ? Number(values.cantidadAmbientes) : null
      };
      
      await PropiedadesApi.crearPropiedad(dataToSend);
      showSuccess('Propiedad creada exitosamente');
      navigate("/propiedades")
    } catch (error) {
      console.error(`Error al crear la propiedad: ${error.message}`);
      showError('Error al crear la propiedad');
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

  const switchCard = (checked, name, icon, label, handleChange) => (
    <Paper
      elevation={0}
      sx={{
        p: 2, borderRadius: 2.5,
        border: `1px solid ${checked
          ? (isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)')
          : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
        }`,
        bgcolor: checked
          ? (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)')
          : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={handleChange}
            name={name}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' },
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {React.cloneElement(icon, { sx: { fontSize: 20, color: checked ? '#8b5cf6' : 'text.secondary' } })}
            <Typography variant="body2" sx={{ fontWeight: checked ? 600 : 400 }}>
              {label}
            </Typography>
          </Box>
        }
      />
    </Paper>
  );

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
              onClick={() => navigate('/propiedades')}
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
                <HomeIcon sx={{ color: '#8b5cf6', fontSize: { xs: 20, sm: 24 } }} />
                Nueva Propiedad
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Completa los datos de la propiedad
              </Typography>
            </Box>
          </Box>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={SchemaValidation.propiedadesValidation}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {({ values, handleChange, handleBlur, setFieldValue, isSubmitting }) => {
            // Actualizar el recuento de palabras cada vez que cambie el campo inventario
            useEffect(() => {
              const wordCount = values.inventario.length ;
              setNumDePalabras(wordCount);
              if(wordCount >= 3000){
                setAlert(true)
              }else{
                setAlert(false)
              }

            }, [values.inventario]);

            return (
              <Form>
                {/* Ubicación */}
                <Paper elevation={0} sx={{
                  p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}>
                  {sectionTitle(<PlaceIcon />, 'Ubicación')}
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field name="direccion" as={TextField} label="Dirección *" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.direccion} sx={inputSx} />
                      <ErrorMessage name="direccion" component="div" style={errStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field name="localidad" as={TextField} label="Localidad" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.localidad} sx={inputSx} />
                      <ErrorMessage name="localidad" component="div" style={errStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field name="partido" as={TextField} label="Partido" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.partido} sx={inputSx} />
                      <ErrorMessage name="partido" component="div" style={errStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field name="provincia" as={TextField} label="Provincia" fullWidth size="small" onChange={handleChange} onBlur={handleBlur} value={values.provincia} sx={inputSx} />
                      <ErrorMessage name="provincia" component="div" style={errStyle} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field name="tipo">
                        {({ field, form }) => (
                          <FormControl fullWidth size="small">
                            <InputLabel>Tipo de propiedad</InputLabel>
                            <Select
                              label="Tipo de propiedad"
                              {...field}
                              value={form.values.tipo}
                              onChange={(e) => form.setFieldValue("tipo", e.target.value)}
                              sx={{ borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                            >
                              {tipos.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </Select>
                          </FormControl>
                        )}
                      </Field>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Propietario */}
                <Paper elevation={0} sx={{
                  p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}>
                  {sectionTitle(<PersonIcon />, 'Propietario')}
                  {showOwnerSelection ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Buscar Propietario"
                        value={searchTermPropietario}
                        onChange={(e) => setSearchTermPropietario(e.target.value)}
                        sx={inputSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start"><SearchIcon sx={{ color: '#8b5cf6' }} /></InputAdornment>
                          ),
                        }}
                        placeholder="Buscar por nombre o apellido"
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel>Propietario</InputLabel>
                        <Field
                          name="id_propietario"
                          as={Select}
                          label="Propietario"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.id_propietario}
                          sx={{ borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                        >
                          {propietarios ?
                            (propietarios.data?.length > 0 ? (
                              propietarios.data
                                .filter((propietario) => {
                                  if (searchTermPropietario === '') return true;
                                  const nombre = propietario.nombre || "";
                                  const apellido = propietario.apellido || "";
                                  const dni = propietario.dni || "";
                                  const email = propietario.email || "";
                                  const telefono = propietario.telefono || "";
                                  const termino = searchTermPropietario.toLowerCase();
                                  return nombre.toLowerCase().includes(termino) ||
                                    apellido.toLowerCase().includes(termino) ||
                                    dni.toLowerCase().includes(termino) ||
                                    email.toLowerCase().includes(termino) ||
                                    telefono.toLowerCase().includes(termino);
                                })
                                .map((propietario) => (
                                  <MenuItem key={propietario.id} value={propietario.id}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography variant="body2">{`${propietario.nombre} ${propietario.apellido}`}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {propietario.dni && `DNI: ${propietario.dni}`}
                                        {propietario.telefono && ` • Tel: ${propietario.telefono}`}
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                ))
                            ) : (
                              <MenuItem disabled value="">No hay propietarios disponibles</MenuItem>
                            )
                            ) : (
                              <MenuItem disabled value="">Cargando propietarios...</MenuItem>
                            )}
                        </Field>
                      </FormControl>
                      <ErrorMessage name="id_propietario" component="div" style={errStyle} />
                      <Button
                        variant="outlined"
                        onClick={() => setShowOwnerSelection(false)}
                        sx={{
                          alignSelf: 'flex-start', borderRadius: 2.5,
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: 'text.primary',
                        }}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        onClick={() => setShowOwnerSelection(true)}
                        sx={{
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          boxShadow: 'none', fontWeight: 600, textTransform: 'none',
                          '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' },
                        }}
                      >
                        Asignar Propietario
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        o asignar más tarde
                      </Typography>
                    </Box>
                  )}
                </Paper>

                {/* Detalles */}
                <Paper elevation={0} sx={{
                  p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}>
                  {sectionTitle(<AttachMoneyIcon />, 'Detalles')}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth size="small"
                        label="Precio"
                        name="precio"
                        type="number"
                        value={values.precio}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputProps={{ min: 0, step: 1000 }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth size="small"
                        label="Cantidad de ambientes"
                        name="cantidadAmbientes"
                        type="number"
                        value={values.cantidadAmbientes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        inputProps={{ min: 0 }}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>

                  {/* Disponibilidad */}
                  <Box sx={{ mt: 2.5 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2, borderRadius: 2.5,
                        border: `1px solid ${values.disponibilidad
                          ? (isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)')
                          : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                        }`,
                        bgcolor: values.disponibilidad
                          ? (isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)')
                          : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.disponibilidad}
                            onChange={handleChange}
                            name="disponibilidad"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#22c55e' },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {values.disponibilidad
                              ? <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e' }} />
                              : <CancelIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                            }
                            <Typography variant="body2" sx={{ fontWeight: values.disponibilidad ? 600 : 400 }}>
                              {values.disponibilidad ? 'Disponible' : 'No disponible'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Box>
                </Paper>

                {/* Amenities */}
                <Paper elevation={0} sx={{
                  p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}>
                  {sectionTitle(<HomeIcon />, 'Amenities')}
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      {switchCard(values.cochera, 'cochera', <GarageIcon />, 'Cochera', handleChange)}
                    </Grid>
                    <Grid item xs={6}>
                      {switchCard(values.patio, 'patio', <YardIcon />, 'Patio', handleChange)}
                    </Grid>
                    <Grid item xs={6}>
                      {switchCard(values.jardin, 'jardin', <GrassIcon />, 'Jardín', handleChange)}
                    </Grid>
                    <Grid item xs={6}>
                      {switchCard(values.pileta, 'pileta', <PoolIcon />, 'Pileta', handleChange)}
                    </Grid>
                  </Grid>
                </Paper>

                {/* Inventario */}
                <Paper elevation={0} sx={{
                  p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 2.5,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                }}>
                  {sectionTitle(<InventoryIcon />, 'Inventario')}
                  <Field
                    name="inventario"
                    as={TextField}
                    label="Descripción del inventario"
                    fullWidth
                    multiline
                    rows={4}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.inventario}
                    sx={inputSx}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: alert ? theme.palette.error.main : 'text.secondary' }}>
                      {numDePalabras}/3000
                    </Typography>
                  </Box>
                  <ErrorMessage name="inventario" component="div" style={errStyle} />
                </Paper>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/propiedades')}
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
                    {isSubmitting ? 'Creando...' : 'Crear Propiedad'}
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Box>
  );
};

export default PropiedadesForm;
