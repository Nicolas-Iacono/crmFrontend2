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
    fetchPropietarios();
  }, []);

  const fetchPropietarios = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/propietario/all`);;
      // Handle both array response and nested data object
      const propietariosArray = Array.isArray(response.data) ? response.data : 
                            (response.data && response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      console.log("Propietarios recibidos:", propietariosArray);
      setPropietarios({ data: propietariosArray });
    } catch (error) {
      console.error('Error fetching propietarios:', error);
    }
  };


  const initialValues = {
    direccion: '',
    localidad: '',
    partido: '',
    provincia: '',
    disponibilidad: false,
    tipo: "",
    inventario: "",
    id_propietario: 0,
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
        Nueva Propiedad
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={SchemaValidation.propiedadesValidation}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ values, handleChange, handleBlur }) => {
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
                />
                <ErrorMessage name="provincia" component="div" style={{ color: 'red' }} />
              </Box>

              <Grid2 sx={{display:"flex", width:"100%", justifyContent:"flex-start", gap:"2rem"}}> 
              <Box sx={{ marginTop: '.5rem',width:"45%"}}>
                    
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
                              form.setFieldValue("tipo", e.target.value);
                            }}
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
                  <Box sx={{marginTop:".5rem", width:"45%"}}>
                    <Typography variant="h6" sx={{ 
                      color: 'primary.main', 
                      fontWeight: 600, 
                      mb: 1,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }}>
                      Seleccionar Propietario
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Buscar Propietario"
                      variant="outlined"
                      value={searchTermPropietario}
                      onChange={(e) => setSearchTermPropietario(e.target.value)}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Buscar por nombre o apellido"
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel id="propietario-label">Propietario</InputLabel>
                      <Field
                        name="id_propietario"
                        as={Select}
                        labelId="propietario-label"
                        label="Propietario"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.id_propietario}
                      >
                       {propietarios.data ? 
                         (propietarios.data.length > 0 ? (
                           propietarios.data
                             .filter((propietario) => propietario.usuarioDtoSalida && propietario.usuarioDtoSalida.username === user.name)
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
                           <MenuItem disabled value="">
                             No hay propietarios disponibles
                           </MenuItem>
                         )
                       ) : (
                         <MenuItem disabled value="">
                           Cargando propietarios...
                         </MenuItem>
                       )}
                      </Field>
                    </FormControl>
                    <ErrorMessage name="id_propietario" component="div" style={{ color: 'red' }} />
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

                <Box sx={{ marginTop: "1rem" }}>
                  <Button type="submit" variant="contained" color="primary">
                    Enviar
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
