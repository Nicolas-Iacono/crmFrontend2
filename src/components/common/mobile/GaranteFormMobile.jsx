import React, { useEffect, useState } from 'react';
import GarantesApi from '../../api/garanteApi';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import SchemaValidation from '../../validation/SchemaValidation';
import { Grid2, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography, Switch } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import Divider from '@mui/material/Divider';
import { format } from 'date-fns';
import contratoApi from '../../api/contratoApi';

const GaranteFormMobile = () => {
  const [contratos, setContratos] = useState({ data: [] });
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
    { value: 1, label: 'Garantia Propietaria' },
    { value: 2, label: 'Recibo de sueldo' }
  ];
  
  const onSubmit = async (values, { setSubmitting }) => {
    try {
      // Ensure username is included
      const formattedValues = {
        ...values,
        nombreUsuario: localUser.name
      };
      
      await GarantesApi.crearGarante(formattedValues);
      console.log('Garante creado exitosamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Garante creado exitosamente',
        icon: 'success',
      });
    } catch (error) {
      console.error(`Error al crear el garante:`, error);
      
      // Log more detailed error information 
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      
      Swal.fire({
        title: 'Error',
        text: `Error al crear el garante: ${error.response?.data?.message || error.message || 'Error desconocido'}`,
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const cambioGarantia = () => {
    setTipoGarantia(!tipoGarantia);
    if (tipoGarantia === false) {
      initialValues.tipoGarantia = "Garantia Propietaria";
    } else {
      initialValues.tipoGarantia = "Recibos de Sueldo";
    }
  };

  if (!isUserLoaded) return null;
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SchemaValidation.garanteValidation}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <Typography variant="h4" sx={{ textAlign: 'center', margin: '1rem 0' }}>
            Nuevo Garante
          </Typography>

          <Grid2 container spacing={2} sx={{ display: "flex", flexDirection: "column" }}>
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
                />
                <ErrorMessage name="apellido" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="telefono"
                  as={TextField}
                  label="Teléfono"
                  variant="outlined"
                  fullWidth
                />
                <ErrorMessage name="telefono" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="email"
                  as={TextField}
                  label="Email"
                  variant="outlined"
                  fullWidth
                />
                <ErrorMessage name="email" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="dni"
                  as={TextField}
                  label="DNI"
                  variant="outlined"
                  fullWidth
                />
                <ErrorMessage name="dni" component="div" style={{ color: 'red' }} />
              </Box>
              
              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="cuit"
                  as={TextField}
                  label="CUIT"
                  variant="outlined"
                  fullWidth
                />
                <ErrorMessage name="cuit" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="nacionalidad"
                  as={TextField}
                  label="Nacionalidad"
                  variant="outlined"
                  fullWidth
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

              <Divider sx={{ margin: "1rem 0" }} />

              <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
                Información Laboral
              </Typography>

              <Box sx={{ marginBottom: "1rem" }}>
                <Field
                  name="nombreEmpresa"
                  as={TextField}
                  label="Nombre de Empresa"
                  variant="outlined"
                  fullWidth
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
                />
                <ErrorMessage name="cargoActual" component="div" style={{ color: 'red' }} />
              </Box>
              
              <Divider sx={{ margin: "1rem 0" }} />
              
              {tipoGarantia && (
                <Grid2>
                  <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
                    Información de la Propiedad en Garantía
                  </Typography>

                  <Box sx={{ marginBottom: "1rem" }}>
                    <Field
                      name="partidaInmobiliaria"
                      as={TextField}
                      label="Partida Inmobiliaria"
                      variant="outlined"
                      fullWidth
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
                    />
                    <ErrorMessage name="informeInhibicion" component="div" style={{ color: 'red' }} />
                  </Box>
                </Grid2>
              )}
            </Grid2>

            <Box sx={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
              <Typography>Recibo de Sueldo</Typography>
              <Switch
                checked={!tipoGarantia}
                onChange={cambioGarantia}
                name="tipoGarantia"
              />
              <Typography>Garantía Propietaria</Typography>
            </Box>

            <Box sx={{ display: "flex", width: "100%", marginBottom: "2rem" }}>
              <Button fullWidth type="submit" variant="contained" color="primary">
                Cargar Garante
              </Button>
            </Box>
          </Grid2>
        </Form>
      )}
    </Formik>
  );
};

export default GaranteFormMobile;