import React, { useEffect, useState } from 'react';
import GarantesApi from '../api/garanteApi';
import { Formik, Form, Field, ErrorMessage,FieldArray  } from 'formik';
import SchemaValidation from '../validation/SchemaValidation';
import { Grid2, Box, TextField,FormControl, InputLabel,Select, MenuItem,Button, Typography, Switch } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import Divider from '@mui/material/Divider';
import { CollectionsOutlined } from '@mui/icons-material';
import ContratoApi from '../api/contratoApi';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const GaranteForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [contratos, setContratos] = useState([]);
  const [tipoGarantia, setTipoGarantia] = useState(false);
  
  const [localUser, setLocalUser] = useState({
    name: '',
    authorities: '',
  });
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  console.log('localUser', localUser.name)
  console.log("-------------------------------")
  console.log('localStorage :', localStorage.getItem('username'))


  useEffect(() => {
    if (localStorage.getItem("username")) {
      setLocalUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
      setIsUserLoaded(true);
    }
  }, []);
  // Obtener el usuario de localStorage solo una vez al montar el componente
  useEffect(() => {
    const username = localStorage.getItem("username");
    const authorities = localStorage.getItem("authorities");

    if (username) {
      setLocalUser({
        name: username,
        authorities,
      });
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
      contratos.data.forEach((contrato) => {
        console.log(contrato);
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

  const tipoGarantias = [
    { value: 1 , label: 'Garantia Propietaria' },
    { value: 2, label: 'Recibo de sueldo'}
  ]
  const onSubmit = async (values, { setSubmitting }) => {

    try {
      await GarantesApi.crearGarante(values);
      console.log('Garante creado exitosamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Garante creado exitosamente',
        icon: 'success',
      })
    } catch (error) {
      console.log(values)
      console.error(`Error al crear el garante: ${error.message}`);
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el garante',
        icon: "error",
      })
      console.log(`${error.message}`)
    } finally {
      setSubmitting(false);
    }
  };
  const cambioGarantia = () =>{
    setTipoGarantia(!tipoGarantia)
    if(tipoGarantia == false){
      initialValues.tipoGarantia = "Garantia Propietaria"
    }else{
      initialValues.tipoGarantia = "Recibos de Sueldo"
    }
  } 

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
        Nuevo Garante
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={SchemaValidation.garanteValidation}
        onSubmit={onSubmit}
        enableReinitialize >
    

        {({ values, handleChange, handleBlur}) => (
          <Form>

            <Grid2 sx={{width:"100%"}}>

            <Grid2 sx={{ display: 'flex', width: '100%', padding:".5rem",justifyContent:"space-evenly"}}>
              
              <Grid2 sx={{display:"flex" , gap:"3rem", width:"50%"}}>
                <Grid2 sx={{ width: '50%', padding:".5rem"}}>
                <Typography>
                  Datos personales
                </Typography>
                
                  <Box sx={{ marginTop: '.5rem'}}>
                
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
                </Box>
                <Box sx={{ marginTop: '.5rem'}}>
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
                  <ErrorMessage name="nombre" component="div" style={{ color: 'red' }} />
                </Box>
                <Box sx={{ marginTop: '.5rem' }}>
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
                  <ErrorMessage name="apellido" component="div" style={{ color: 'red' }} />
                </Box>
                <Box sx={{ marginTop: '.5rem' }}>
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
                  <ErrorMessage name="telefono" component="div" style={{ color: 'red' }} />
                </Box>
                <Box sx={{ marginTop: '.5rem' }}>
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
                  <ErrorMessage name="email" component="div" style={{ color: 'red' }} />
                </Box>
                <Box sx={{ marginTop: '.5rem' }}>
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
                  <ErrorMessage name="dni" component="div" style={{ color: 'red' }} />
                </Box>
                <Box sx={{ marginTop: '.5rem' }}>
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
                  <ErrorMessage name="dni" component="div" style={{ color: 'red' }} />
                </Box>
                <Box sx={{ marginTop: '.5rem' }}>
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
                  <ErrorMessage name="direccionResidencial" component="div" style={{ color: 'red' }} />
                </Box>
              </Grid2> 
              <Grid2 sx={{ width: '50%', padding:".5rem", marginTop:"1.5rem"}}>
              <Box sx={{ marginTop: '.5rem'}}>
                
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
        
              <Box sx={{ marginTop: '.5rem' }}>
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
                <ErrorMessage name="nacionalidad" component="div" style={{ color: 'red' }} />
              </Box>
              </Grid2>
            </Grid2>

            {/* Sección para subir imágenes */}
            <Divider orientation="vertical" flexItem variant="middle"/>
           <Grid2 >

            <Grid2 sx={{display:"flex", alignItems:"center", marginBottom:".5rem"}}>
            <Typography>Recibo de Sueldo</Typography>
            <Switch onClick={cambioGarantia}/>
            <Typography>Garantia Propietaria</Typography>
            </Grid2>
           
            
            {tipoGarantia ? 
            (<Grid2 sx={{padding:".5rem", display:"flex", flexDirection:"column", justifyContent:"start", }}>
              
              <Typography>
               Garantia Propietaria
              </Typography>
            

              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="partidaInmobiliaria"
                  as={TextField}
                  label="Partida Inmobiliaria"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.partidaInmobiliaria}
                />

                <ErrorMessage name="partidaInmobiliaria" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="direccion"
                  as={TextField}
                  label="Direccion completa"
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
                  name="infoCatastral"
                  as={TextField}
                  label="Informacion Catastral"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.infoCatastral}
                />

                <ErrorMessage name="infoCatastral" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="estadoOcupacion"
                  as={TextField}
                  label="Estado de Ocupacion"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.estadoOcupacion}
                />

                <ErrorMessage name="estadoOcupacion" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="tipoPropiedad"
                  as={TextField}
                  label="Tipo de Propiedad"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.tipoPropiedad}
                />

                <ErrorMessage name="tipoPropiedad" component="div" style={{ color: 'red' }} />
              </Box>
              
          

             

            
            </Grid2>)
            :
            (<Grid2 sx={{ padding:".5rem", display:"flex", flexDirection:"column", justifyContent:"start"}}>
              
              <Typography>
                Datos Laborales
              </Typography>
            

              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="nombreEmpresa"
                  as={TextField}
                  label="Empresa"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.nombreEmpresa}
                />

                <ErrorMessage name="empresa" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="legajo"
                  as={TextField}
                  label="Legajo"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.legajo}
                />

                <ErrorMessage name="legajo" component="div" style={{ color: 'red' }} />
              </Box>

              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="cuitEmpresa"
                  as={TextField}
                  label="CUIT .Emp"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.cuitEmpresa}
                />

                <ErrorMessage name="sectorActual" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="sectorActual"
                  as={TextField}
                  label="Sector"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.sectorActual}
                />

                <ErrorMessage name="sectorActual" component="div" style={{ color: 'red' }} />
              </Box>
              <Box sx={{ marginTop: '.5rem' }}>
                <Field
                  name="cargoActual"
                  as={TextField}
                  label="Cargo"
                  variant="outlined"
                  fullWidth
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.cargoActual}
                />

                <ErrorMessage name="sectorActual" component="div" style={{ color: 'red' }} />
              </Box>
     

           
             

            
            </Grid2>)}

            
            </Grid2>

            
              
          </Grid2>

  
          <Box sx={{display:"flex", width:"100%", justifyContent:"flex-end"}}>
        <Button  type="submit" variant="contained" color="primary">
            cargar garante
        </Button>
        </Box>
          </Grid2>
          
        </Form>
      )}
    </Formik>
    </Box>
  );
};

export default GaranteForm;
