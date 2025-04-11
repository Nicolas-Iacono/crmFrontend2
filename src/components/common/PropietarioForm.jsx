import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography, useTheme, useMediaQuery, Grid2 } from '@mui/material';
import { PropietarioApi } from '../api/propietarios';
import {SchemaValidation} from '../validation/SchemaValidation'
import Swal from 'sweetalert2';
import PropiedadesApi from '../api/propiedades';

const PropietarioForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      console.log(propietario.id)
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
    nombreUsuario:user.name
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
      await PropietarioApi.crearPropietario(values);
      console.log(values);
      console.log('propietario creado exitosamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Propietario creado exitosamente',
        icon: 'success',
      })
    } catch (error) {
      console.log(values);
      console.error(`Error al crear el propietario: ${error.message}` );
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el propietario',
        icon: "error",
      })
    } finally {
      setSubmitting(false); 
    }
  };

  if (!isUserLoaded) return null;

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'background.default',
      color: 'text.primary',
      minHeight: '100vh'
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 3, 
          textAlign: 'center',
          color: 'text.primary',
          fontWeight: 600
        }}
      >
        Nuevo Propietario
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={SchemaValidation.propietarioValidation}
        onSubmit={onSubmit}
        enableReinitialize 
      >
        {({ values, handleChange, handleBlur }) => (
          <Form style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Grid2
              container 
              spacing={2}
              sx={{
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 4 },
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <Grid2 xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2, 
                  mt: { xs: 0, md: 3 },
                  width: '100%',
                  maxWidth: '500px',
                  mx: 'auto',
                  '& .MuiTextField-root': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'background.paper',
                    borderRadius: 1,
                    '& .MuiInputBase-input': {
                      color: 'text.primary'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  '& .MuiFormControl-root': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'background.paper',
                    borderRadius: 1,
                    '& .MuiInputBase-input': {
                      color: 'text.primary'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  '& .error-message': {
                    color: theme.palette.error.main,
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }
                }}>
                  <Field name="pronombre">
                    {({ field, form }) => (
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="pronombre-label">Pronombre</InputLabel>
                        <Select
                          labelId="pronombre-label"
                          label="Pronombre"
                          {...field}
                          value={form.values.pronombre}
                          onChange={(e) => {
                            form.setFieldValue("pronombre", e.target.value);
                          }}
                        >
                          {pronombres.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>

                  <Field
                    name="nombre"
                    as={TextField}
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.nombre}
                  />
                  <ErrorMessage name="nombre" component="div" className="error-message" />

                  <Field
                    name="apellido"
                    as={TextField}
                    label="Apellido"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.apellido}
                  />
                  <ErrorMessage name="apellido" component="div" className="error-message" />

                  <Field
                    name="telefono"
                    as={TextField}
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.telefono}
                  />
                  <ErrorMessage name="telefono" component="div" className="error-message" />

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
                  <ErrorMessage name="email" component="div" className="error-message" />
                </Box>
              </Grid2>

              <Grid2 xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2, 
                  mt: { xs: 0, md: 3 },
                  width: '100%',
                  maxWidth: '500px',
                  mx: 'auto',
                  '& .MuiTextField-root': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'background.paper',
                    borderRadius: 1,
                    '& .MuiInputBase-input': {
                      color: 'text.primary'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  '& .MuiFormControl-root': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'background.paper',
                    borderRadius: 1,
                    '& .MuiInputBase-input': {
                      color: 'text.primary'
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.secondary'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  '& .error-message': {
                    color: theme.palette.error.main,
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }
                }}>
                  <Field
                    name="dni"
                    as={TextField}
                    label="DNI"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.dni}
                  />
                  <ErrorMessage name="dni" component="div" className="error-message" />

                  <Field
                    name="cuit"
                    as={TextField}
                    label="CUIT"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.cuit}
                  />
                  <ErrorMessage name="cuit" component="div" className="error-message" />

                  <Field
                    name="nacionalidad"
                    as={TextField}
                    label="Nacionalidad"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.nacionalidad}
                  />
                  <ErrorMessage name="nacionalidad" component="div" className="error-message" />

                  <Field
                    name="direccionResidencial"
                    as={TextField}
                    label="Dirección Residencial"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.direccionResidencial}
                  />
                  <ErrorMessage name="direccionResidencial" component="div" className="error-message" />

                  <Field name="estadoCivil">
                    {({ field, form }) => (
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="estadoCivil-label">Estado Civil</InputLabel>
                        <Select
                          labelId="estadoCivil-label"
                          label="Estado Civil"
                          {...field}
                          value={form.values.estadoCivil}
                          onChange={(e) => {
                            form.setFieldValue("estadoCivil", e.target.value);
                          }}
                        >
                          {estadosCiviles.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>
                </Box>
              </Grid2>
            </Grid2>

            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%',
              maxWidth: '500px'
            }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  minWidth: { xs: '100%', md: '200px' },
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                  }
                }}
              >
                Crear Propietario
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PropietarioForm;
