import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Grid2, Typography, InputAdornment, Switch, FormControlLabel, Divider } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { SchemaValidation } from '../validation/SchemaValidation';
import { PropiedadesApi } from '../api/propiedades';
import http from '../api/http';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import { showError, showSuccess } from '../alertas/showAlert';

const PropiedadesEditForm = ({ propiedad, onCancel, onSuccess }) => {
  // Si no hay propiedad, mostrar mensaje de carga
  if (!propiedad) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Cargando datos de la propiedad...</Typography>
      </Box>
    );
  }
  
  const theme = useTheme();
  const [propietarios, setPropietarios] = useState({ data: [] });
  const [searchTermPropietario, setSearchTermPropietario] = useState('');
  const [showOwnerSelection, setShowOwnerSelection] = useState(false);

  const tipos = [
    { value: 'PH', label: 'PH' },
    { value: 'Casa de material', label: 'Casa de material' },
    { value: 'Casa prefabricada', label: 'Casa prefabricada' },
    { value: 'Departamento', label: 'Departamento' },
    { value: 'Terreno', label: 'Terreno' },
    { value: 'Chalet', label: 'Chalet' },
    { value: 'Galpon', label: 'Galpon' },
    { value: 'Local', label: 'Local' },
  ];

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
  }, []);

  const initialValues = {
    direccion: propiedad?.direccion || '',
    localidad: propiedad?.localidad || '',
    partido: propiedad?.partido || '',
    provincia: propiedad?.provincia || '',
    disponibilidad: Boolean(propiedad?.disponibilidad),
    precio: propiedad?.precio?.toString() || '',
    cantidadAmbientes: propiedad?.cantidadAmbientes?.toString() || '',
    pileta: Boolean(propiedad?.pileta),
    cochera: Boolean(propiedad?.cochera),
    jardin: Boolean(propiedad?.jardin),
    patio: Boolean(propiedad?.patio),
    tipo: propiedad?.tipo || '',
    inventario: propiedad?.inventario || '',
    propietarioId: propiedad?.propietarioSalidaDto?.id || '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const dataToSend = {
        ...values,
        propietarioId: values.propietarioId || null,
        precio: values.precio !== '' ? Number(values.precio) : null,
        cantidadAmbientes: values.cantidadAmbientes !== '' ? Number(values.cantidadAmbientes) : null,
      };
      await PropiedadesApi.actualizarPropiedad(propiedad.id, dataToSend);
      showSuccess('Propiedad actualizada exitosamente');
      onSuccess?.();
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      showError('Error al actualizar la propiedad');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 1, bgcolor: 'background.default', color: 'text.primary', width: '100%' }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 3,
          textAlign: 'center',
          color: 'text.primary',
          fontWeight: 600,
          marginTop: { xs: '2rem', md: '0' },
        }}
      >
        Editar Propiedad
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={SchemaValidation.propiedadesValidation}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
                maxWidth: '500px',
                mx: 'auto',
                '& .MuiTextField-root': {
                  bgcolor: 'transparent',
                  borderRadius: 0,
                  '& .MuiInputBase-input': { color: 'text.primary' },
                  '& .MuiInputLabel-root': { color: 'text.secondary' },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  },
                },
                '& .MuiFormControl-root': {
                  bgcolor: 'transparent',
                  borderRadius: 0,
                  '& .MuiInputBase-input': { color: 'text.primary' },
                  '& .MuiInputLabel-root': { color: 'text.secondary' },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  },
                },
                '& .MuiOutlinedInput-root': { borderRadius: 6, overflow: 'hidden' },
                '& .MuiOutlinedInput-root fieldset': { borderRadius: 6 },
                '& .MuiButton-root': { borderRadius: 6 },
              }}
            >
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="direccion"
                  as={TextField}
                  label="Dirección"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.direccion}
                />
                <ErrorMessage name="direccion" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="localidad"
                  as={TextField}
                  label="Localidad"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.localidad}
                />
                <ErrorMessage name="localidad" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="partido"
                  as={TextField}
                  label="Partido"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.partido}
                />
                <ErrorMessage name="partido" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="provincia"
                  as={TextField}
                  label="Provincia"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.provincia}
                />
                <ErrorMessage name="provincia" component="div" style={{ color: 'red' }} />
              </Box>

              <Grid2 sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start', gap: '2rem', flexDirection: 'column' }}>
                <Box sx={{ marginTop: '.5rem', width: '100%', height: '4rem' }}>
                  <Field name="tipo">
                    {({ field, form }) => (
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="tipos-label">Tipo de propiedad</InputLabel>
                        <Select
                          labelId="tipo-label"
                          label="Tipo de propiedad"
                          {...field}
                          value={form.values.tipo}
                          onChange={(e) => {
                            form.setFieldValue('tipo', e.target.value);
                          }}
                          sx={{ mb: 2 }}
                        >
                          {tipos.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>
                </Box>
                <Box sx={{ marginTop: '.5rem', width: '100%', padding: '1rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', borderRadius: '1rem', border: showOwnerSelection ? '1px solid rgb(31, 36, 90)' : 'none', boxShadow: showOwnerSelection ? '0px 0px 10px 1px rgba(130, 130, 130, 0.85)' : 'none' }}>
                  {showOwnerSelection ? (
                    <>
                      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' }, padding: '1rem ' }}>
                        Seleccionar Propietario
                      </Typography>
                      <TextField
                        fullWidth
                        label="Buscar Propietario"
                        variant="outlined"
                        value={searchTermPropietario}
                        onChange={(e) => setSearchTermPropietario(e.target.value)}
                        sx={{ mb: 2, width: '90%', '& .MuiOutlinedInput-root': { borderRadius: 6 }, '& fieldset': { borderRadius: 6 } }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>
                          ),
                        }}
                        placeholder="Buscar por nombre o apellido"
                      />
                      <FormControl fullWidth>
                        <InputLabel id="propietario-label" sx={{ paddingLeft: '1.5rem' }}>Propietario</InputLabel>
                        <Field
                          name="propietarioId"
                          as={Select}
                          labelId="propietario-label"
                          label="Propietario"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.propietarioId}
                          sx={{ width: '90%', margin: '0 auto', '& .MuiOutlinedInput-root': { borderRadius: 6 }, '& fieldset': { borderRadius: 6 }, '& .MuiSelect-select': { padding: '12px' } }}
                        >
                          {propietarios
                            ? (propietarios.data?.length > 0 ? (
                              propietarios.data
                                .filter((propietario) => {
                                  if (searchTermPropietario === '') return true;
                                  const nombre = propietario.nombre || '';
                                  const apellido = propietario.apellido || '';
                                  const dni = propietario.dni || '';
                                  const email = propietario.email || '';
                                  const telefono = propietario.telefono || '';
                                  const termino = searchTermPropietario.toLowerCase();
                                  return nombre.toLowerCase().includes(termino)
                                    || apellido.toLowerCase().includes(termino)
                                    || dni.toLowerCase().includes(termino)
                                    || email.toLowerCase().includes(termino)
                                    || telefono.toLowerCase().includes(termino);
                                })
                                .map((propietario) => (
                                  <MenuItem key={propietario.id} value={propietario.id}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                      <Typography variant="body1">{`${propietario.nombre} ${propietario.apellido}`}</Typography>
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
                      <ErrorMessage name="propietarioId" component="div" style={{ color: 'red' }} />
                      <Button variant="outlined" onClick={() => setShowOwnerSelection(false)} sx={{ mt: 2 }}>Cancelar</Button>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                      <Button variant="contained" onClick={() => setShowOwnerSelection(true)}>
                        Cambiar Propietario
                      </Button>
                      <Button variant="text" onClick={() => {}}>
                        Mantener propietario actual
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid2>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Detalles de la propiedad
              </Typography>

              <Grid2 container spacing={2}>
                <Grid2 xs={12} sm={6}>
                  <NumericFormat
                    fullWidth
                    label="Precio"
                    name="precio"
                    customInput={TextField}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="$"
                    value={values.precio}
                    onValueChange={(values) => {
                      handleChange({ target: { name: 'precio', value: values.value } });
                    }}
                    onBlur={handleBlur}
                    inputProps={{ min: 0, step: 1000 }}
                  />
                </Grid2>
                <Grid2 xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cantidad de ambientes"
                    name="cantidadAmbientes"
                    type="number"
                    value={values.cantidadAmbientes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    inputProps={{ min: 0 }}
                  />
                </Grid2>
              </Grid2>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Disponibilidad
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.disponibilidad}
                      onChange={handleChange}
                      name="disponibilidad"
                      color="primary"
                    />
                  }
                  label={values.disponibilidad ? 'Disponible' : 'No disponible'}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Amenities
                </Typography>
                <Grid2 container spacing={1}>
                  <Grid2 xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.cochera}
                          onChange={handleChange}
                          name="cochera"
                          color="primary"
                        />
                      }
                      label="Cochera"
                    />
                  </Grid2>
                  <Grid2 xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.patio}
                          onChange={handleChange}
                          name="patio"
                          color="primary"
                        />
                      }
                      label="Patio"
                    />
                  </Grid2>
                  <Grid2 xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.jardin}
                          onChange={handleChange}
                          name="jardin"
                          color="primary"
                        />
                      }
                      label="Jardín"
                    />
                  </Grid2>
                  <Grid2 xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.pileta}
                          onChange={handleChange}
                          name="pileta"
                          color="primary"
                        />
                      }
                      label="Pileta"
                    />
                  </Grid2>
                </Grid2>
              </Box>

              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="inventario"
                  as={TextField}
                  label="Inventario"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.inventario}
                />
                <ErrorMessage name="inventario" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginTop: '1rem', marginBottom: '2rem', display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={onCancel} disabled={isSubmitting} sx={{ borderRadius: 6 }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ borderRadius: 6 }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PropiedadesEditForm;
