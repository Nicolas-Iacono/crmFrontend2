import React, { useEffect, useState } from 'react';
import GarantesApi from '../../api/garanteApi';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import SchemaValidation from '../../validation/SchemaValidation';
import { Grid2, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import Divider from '@mui/material/Divider';
import { format } from 'date-fns';
import contratoApi from '../../api/contratoApi';
import { showAlert, showError, showInfo, showSuccess } from '../../alertas/showAlert';
const GaranteFormMobile = ({ onSuccess }) => {
  const [contratos, setContratos] = useState({ data: [] });
  
  
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
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/contrato/all`);
      // Use consistent data structure with data property
      const contratosArray = Array.isArray(response.data) ? response.data : 
                         (response.data && response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setContratos({ data: contratosArray });
    } catch (error) {
      console.error('Error fetching contratos:', error);
    }
  };

  const initialValues = {
    pronombre: "",
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    dni: '',
    cuit: '',
    nacionalidad: '',
    direccionResidencial: '',
    estadoCivil: '',
    nombreEmpresa: '',
    legajo: '',
    cuitEmpresa: '',
    sectorActual: '',
    cargoActual: '',
    tipoGarantia: '',
    partidaInmobiliaria: '',
    direccion: '',
    infoCatastral: '',
    estadoOcupacion: '',
    tipoPropiedad: '',
    informeDominio: '',
    informeInhibicion: '',
    nombreUsuario: localUser.name
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

  const tipoGarantias = [
    { value: 'Recibo de Sueldo', label: 'Recibo de Sueldo' },
    { value: 'Garantía Propietaria', label: 'Garantía Propietaria' },
    { value: 'Seguro de caución', label: 'Seguro de caución' }
  ];
  
  const onSubmit = async (values, { setSubmitting }) => {
    try {
      // Ensure username is included and convert numeric fields to integers (sanitizing formatted inputs)
      const onlyDigits = (v) => (v == null ? '' : String(v).replace(/\D/g, ''));
      const formattedValues = {
        ...values,
        nombreUsuario: localUser.name,
        // Convert numeric fields that should be integers
        dni: values.dni ? parseInt(onlyDigits(values.dni), 10) : values.dni,
        telefono: values.telefono ? parseInt(onlyDigits(values.telefono), 10) : values.telefono,
        cuit: values.cuit ? parseInt(onlyDigits(values.cuit), 10) : values.cuit,
        legajo: values.legajo ? parseInt(onlyDigits(values.legajo), 10) : values.legajo,
        cuitEmpresa: values.cuitEmpresa ? parseInt(onlyDigits(values.cuitEmpresa), 10) : values.cuitEmpresa,
        partidaInmobiliaria: values.partidaInmobiliaria ? parseInt(onlyDigits(values.partidaInmobiliaria), 10) : values.partidaInmobiliaria,
      };
      
      
      await GarantesApi.crearGarante(formattedValues);
      showSuccess('Garante creado exitosamente');
      
      // Close modal if onSuccess callback is provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`Error al crear el garante:`, error);
      
      // Log more detailed error information 
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      
      showError(`Error al crear el garante: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  

  if (!isUserLoaded) return null;
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SchemaValidation.garanteValidation}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
        <Form>
          <Typography variant="h4" sx={{ textAlign: 'center', margin: '1rem 0' }}>
            Nuevo Garante
          </Typography>

          <Grid2 container spacing={2} sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: { xs: '92%', sm: '85%' }, maxWidth: 420, mx: 'auto' }}>
            <Grid2 item xs={12}>
              <Box sx={{ marginBottom: "1rem" }}>
                <FormControl fullWidth>
                  <InputLabel id="pronombre-label">Pronombre</InputLabel>
                  <Field
                    name="pronombre"
                    as={Select}
                    labelId="pronombre-label"
                    label="Pronombre"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.pronombre}
                    sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                  >
                    {pronombres.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
                <ErrorMessage name="pronombre" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="nombre"
                  as={TextField}
                  label="Nombre"
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 6,
                    '& fieldset': { borderRadius: 6 },
                    '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                  }}
                />
                <ErrorMessage name="nombre" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="apellido"
                  as={TextField}
                  label="Apellido"
                  variant="outlined"
                  fullWidth
   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}                />
                <ErrorMessage name="apellido" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="telefono"
                  as={TextField}
                  label="Teléfono"
                  variant="outlined"
                  fullWidth
 sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}                />
                <ErrorMessage name="telefono" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="email"
                  as={TextField}
                  label="Email"
                  variant="outlined"
                  fullWidth
 sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}                />
                <ErrorMessage name="email" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field name="dni">
                  {({ field, form }) => (
                    <TextField
                      {...field}
                      label="DNI"
                      variant="outlined"
                      fullWidth
                      value={field.value}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                        const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                        form.setFieldValue('dni', formatted);
                      }}
                      sx={{
                        borderRadius: 6,
                        '& fieldset': { borderRadius: 6 },
                        '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage name="dni" component="div" style={{ color: 'red' }} />
              </Box>
              
              <Box sx={{ marginBottom: "1rem" }}>
                <Field name="cuit">
                  {({ field, form }) => (
                    <TextField
                      {...field}
                      label="CUIT"
                      variant="outlined"
                      fullWidth
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
                        form.setFieldValue('cuit', formatted);
                      }}
                      sx={{
                        borderRadius: 6,
                        '& fieldset': { borderRadius: 6 },
                        '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage name="cuit" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="nacionalidad"
                  as={TextField}
                  label="Nacionalidad"
                  variant="outlined"
                  fullWidth
                   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                />
                <ErrorMessage name="nacionalidad" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="direccionResidencial"
                  as={TextField}
                  label="Dirección Residencial"
                  variant="outlined"
                  fullWidth
                   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                />
                <ErrorMessage name="direccionResidencial" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <FormControl fullWidth>
                  <InputLabel id="estadoCivil-label">Estado Civil</InputLabel>
                  <Field
                    name="estadoCivil"
                    as={Select}
                    labelId="estadoCivil-label"
                    label="Estado Civil"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.estadoCivil}
                     sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                  >
                    {estadosCiviles.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
                <ErrorMessage name="estadoCivil" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginBottom: "1rem" }}>
                <FormControl fullWidth>
                  <InputLabel id="tipoGarantia-label">Tipo de Garantía</InputLabel>
                  <Field
                    name="tipoGarantia"
                    as={Select}
                    labelId="tipoGarantia-label"
                    label="Tipo de Garantía"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.tipoGarantia} sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                  >
                    {tipoGarantias.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
                <ErrorMessage name="tipoGarantia" component="div" style={{ color: 'red' }} />
              </Box>
            </Grid2>
<Grid2>
    {values.tipoGarantia === 'Recibo de Sueldo' ? (
            <Grid2>
               <Box sx={{ marginBottom: "1rem", width:"90vw"}}>
                  <Typography variant="h6" sx={{ marginBottom: "1rem", width:"100%" }}>
                    Información Laboral
                  </Typography>
                  </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="nombreEmpresa"
                  as={TextField}
                  label="Nombre de Empresa"
                  variant="outlined"
                  fullWidth
                   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                />
                <ErrorMessage name="nombreEmpresa" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="legajo"
                  as={TextField}
                  label="Número de Legajo"
                  variant="outlined"
                  fullWidth
                   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                />
                <ErrorMessage name="legajo" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="cuitEmpresa"
                  as={TextField}
                  label="CUIT de Empresa"
                  variant="outlined"
                  fullWidth
                   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                />
                <ErrorMessage name="cuitEmpresa" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="sectorActual"
                  as={TextField}
                  label="Sector Actual"
                  variant="outlined"
                  fullWidth
                   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                />
                <ErrorMessage name="sectorActual" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="cargoActual"
                  as={TextField}
                  label="Cargo Actual"
                  variant="outlined"
                  fullWidth
                   sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                />
                <ErrorMessage name="cargoActual" component="div" style={{ color: 'red' }} />
              </Box>

            </Grid2>
              
              ) 
              : values.tipoGarantia === 'Garantía Propietaria' ? (

              
              
                <Grid2>
                  <Box sx={{ marginBottom: "1rem", width:"90vw"}}>
                  <Typography variant="h6" sx={{ marginBottom: "1rem", width:"100%" }}>
                    Información de la Propiedad en Garantía
                  </Typography>
                  </Box>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="partidaInmobiliaria"
                      as={TextField}
                      label="Partida Inmobiliaria"
                      variant="outlined"
                      fullWidth
                       sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                    />
                    <ErrorMessage name="partidaInmobiliaria" component="div" style={{ color: 'red' }} />
                  </Box>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="direccion"
                      as={TextField}
                      label="Dirección"
                      variant="outlined"
                      fullWidth
                       sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                    />
                    <ErrorMessage name="direccion" component="div" style={{ color: 'red' }} />
                  </Box>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="infoCatastral"
                      as={TextField}
                      label="Información Catastral"
                      variant="outlined"
                      fullWidth
                       sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                    />
                    <ErrorMessage name="infoCatastral" component="div" style={{ color: 'red' }} />
                  </Box>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="estadoOcupacion"
                      as={TextField}
                      label="Estado de Ocupación"
                      variant="outlined"
                      fullWidth
                       sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                    />
                    <ErrorMessage name="estadoOcupacion" component="div" style={{ color: 'red' }} />
                  </Box>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="tipoPropiedad"
                      as={TextField}
                      label="Tipo de Propiedad"
                      variant="outlined"
                      fullWidth
                       sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                    />
                    <ErrorMessage name="tipoPropiedad" component="div" style={{ color: 'red' }} />
                  </Box>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="informeDominio"
                      as={TextField}
                      label="Informe de Dominio"
                      variant="outlined"
                      fullWidth
                       sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                    />
                    <ErrorMessage name="informeDominio" component="div" style={{ color: 'red' }} />
                  </Box>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="informeInhibicion"
                      as={TextField}
                      label="Informe de Inhibición"
                      variant="outlined"
                      fullWidth
                       sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' }
                    }}
                    />
                    <ErrorMessage name="informeInhibicion" component="div" style={{ color: 'red' }} />
                  </Box>
                </Grid2>
              ) : (
                <Grid2>
                  <Box sx={{ marginBottom: "1rem", width:"90vw"}}>
                  <Typography variant="h6" sx={{ marginBottom: "1rem", width:"100%" }}>
                   Seguro de caución seleccionado
                  </Typography>
                  </Box>
                </Grid2>
              )}

            </Grid2>

            

            <Box sx={{ display: "flex", width: "100%", marginBottom: "2rem" }}>
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isSubmitting}
                 sx={{
                      borderRadius: 6,
                      '& fieldset': { borderRadius: 6 },
                    
                    }}
              >
                {isSubmitting ? "Creando garante..." : "Cargar Garante"}
              </Button>
            </Box>
            </Box>
          </Grid2>
        </Form>
      )}
    </Formik>
  );
};

export default GaranteFormMobile;