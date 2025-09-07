import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, Grid2, Typography, InputAdornment } from '@mui/material';
import { PropiedadesApi } from '../api/propiedades';
import { SchemaValidation } from "../validation/SchemaValidation";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import PropietarioApi from '../api/propietarios';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';

const PropiedadesForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();

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
        const response = await PropietarioApi.buscarPropietarioPorUsuario(user.name);
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

  console.log(propietarios)
  const initialValues = {
    direccion: '',
    localidad: '',
    partido: '',
    provincia: '',
    disponibilidad: false,
    tipo: "",
    inventario: "",
    id_propietario: '',
    nombreUsuario:user.name
  };
  console.log(user.name)
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
        nombreUsuario: user.name || localStorage.getItem("username") || ""
      };
      
      console.log('Enviando datos al servidor:', JSON.stringify(dataToSend, null, 2));
      await PropiedadesApi.crearPropiedad(dataToSend);
      console.log('Propiedad creada exitosamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Propiedad creada exitosamente',
        icon: 'success',
      });
      navigate("/propiedades")
    } catch (error) {
      console.error(`Error al crear la propiedad: ${error.message}`);
      Swal.fire({
        title: 'Error',
        text: 'Error al crear la propiedad',
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ 
      p: 1, 
      bgcolor: 'background.default',
      color: 'text.primary',
      minHeight: '100vh',
      width: '100%',
      
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 3, 
          textAlign: 'center',
          color: 'text.primary',
          fontWeight: 600,
          marginTop:{xs:"2rem",md:"0"},
        }}
      >
        Nueva Propiedad
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={SchemaValidation.propiedadesValidation}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ values, handleChange, handleBlur,isSubmitting }) => {
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
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
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
                {/* Campos del formulario */}
                <Box sx={{ marginTop: ".5rem" }}>
                  <Field
                    name="direccion"
                    as={TextField}
                    label="Dirección"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.direccion}
                    sx={{ 
                
                    
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      
                      }
                    }}
                  />
                  <ErrorMessage name="direccion" component="div" style={{ color: 'red' }} />
                </Box>
                <Box sx={{marginTop:".5rem"}}>
                <Field
                  name="localidad"
                  as={TextField}
                  label="Localidad"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.localidad}
                  sx={{ 
                
                    
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    
                    }
                  }}
                />
                <ErrorMessage name="localidad" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{marginTop:".5rem"}}>
                <Field
                  name="partido"
                  as={TextField}
                  label="Partido"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.partido}
                  sx={{ 
                
                    
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    
                    }
                  }}
                />
                <ErrorMessage name="partido" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{marginTop:".5rem"}}>
                <Field
                  name="provincia"
                  as={TextField}
                  label="Provincia"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.provincia}
                  sx={{ 
                
                    
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    
                    }
                  }}
                />
                <ErrorMessage name="provincia" component="div" style={{ color: 'red' }} />
              </Box>

              <Grid2 sx={{display:"flex", width:"100%", justifyContent:"flex-start", gap:"2rem", flexDirection:"column", }}> 
              <Box sx={{ marginTop: '.5rem',width:"100%",height:"4rem"}}>
                    
                    <Field name="tipo" >
                      {({ field, form }) => (
                        <FormControl fullWidth variant="outlined" 
                         
                          >
                          <InputLabel id="tipos-label" >Tipo de propiedad</InputLabel >
                          <Select
                            labelId="tipo-label"
                            label="Tipo de propiedad"
                            {...field}
                            value={form.values.tipo}
                            onChange={(e) => {
                              form.setFieldValue("tipo", e.target.value);
                            }}
                            sx={{ 
                              mb: 2,
                              borderRadius: '8px',
                              
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                              
                              }
                            }}>
                            {tipos.map((option) => (
                              <MenuItem key={option.value} value={option.value} >
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Field>
                  </Box>
                                    <Box sx={{ marginTop: ".5rem", width: "100%", padding: "1rem 0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem", borderRadius: "1rem", border: showOwnerSelection ? "1px solid rgb(31, 36, 90)" : "none", boxShadow: showOwnerSelection ? "0px 0px 10px 1px rgba(130, 130, 130, 0.85)" : "none" }}>
                    {showOwnerSelection ? (
                      <>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' }, padding: "1rem " }}>
                          Seleccionar Propietario
                        </Typography>
                        <TextField
                          fullWidth
                          label="Buscar Propietario"
                          variant="outlined"
                          value={searchTermPropietario}
                          onChange={(e) => setSearchTermPropietario(e.target.value)}
                          sx={{ mb: 2, width: "90%", '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>
                            ),
                          }}
                          placeholder="Buscar por nombre o apellido"
                        />
                        <FormControl fullWidth>
                          <InputLabel id="propietario-label" sx={{ paddingLeft: "1.5rem" }}>Propietario</InputLabel>
                          <Field
                            name="id_propietario"
                            as={Select}
                            labelId="propietario-label"
                            label="Propietario"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.id_propietario}
                            sx={{ width: "90%", margin: "0 auto", '& .MuiOutlinedInput-root': { borderRadius: '8px' }, '& .MuiSelect-select': { padding: '12px' } }}
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
                        <ErrorMessage name="id_propietario" component="div" style={{ color: 'red' }} />
                        <Button variant="outlined" onClick={() => setShowOwnerSelection(false)} sx={{ mt: 2 }}>Cancelar</Button>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                        <Button variant="contained" onClick={() => setShowOwnerSelection(true)}>
                          Asignar Propietario
                        </Button>
                        <Button variant="text" onClick={() => { /* No action needed, just proceed */ }}>
                          Asignar Propietario más tarde
                        </Button>
                      </Box>
                    )}
                  </Box>
                  </Grid2>
                
                {/* Campo Inventario con recuento de palabras */}
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
                    sx={{ 
                
                    
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      
                      }
                    }}
                  />
                  <Box sx={{ color: 'gray', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {alert ? (
                      <Typography>
                        {numDePalabras}<span style={{color:"red"}}>/3000</span>
                      </Typography>
                      ):( <Typography>
                        {numDePalabras}/3000
                      </Typography>)}

                    
                  </Box>
                  <ErrorMessage name="inventario" component="div" style={{ color: 'red' }} />
                </Box>

                <Box sx={{ marginTop: "1rem" ,marginBottom:"4rem"}}>
                  <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creando propiedad..." : "Crear propiedad"}
                  </Button>
                </Box>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default PropiedadesForm;
