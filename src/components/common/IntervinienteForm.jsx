import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import { Button, TextField, Box, Grid2, Typography,FormControl,InputLabel, Select,MenuItem, Radio, FormControlLabel, Switch, Divider} from '@mui/material';
import InquilinosApi from '../api/inquilinosApi';
import {SchemaValidation} from '../validation/SchemaValidation'
import Swal from 'sweetalert2';
import { useAuth } from '../context/GlobalAuth';
import ContratoApi from '../api/contratoApi';
import PropietarioApi from '../api/propietarios';


const IntervinienteForm = () => {

  const {logout, user} = useAuth();
  const [contratos, setContratos] = useState([]);

  const [selectedValue, setSelectedValue] = React.useState('');
  const [garanteSelected, setGaranteSelected] = React.useState(false);
  const [propietarioSelected, setPropietarioSelected] = React.useState(false);
  const [propietarios, setPropietarios] = useState([]);
  const [tipoGarantia, setTipoGarantia] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (selectedValue === "garante") {
      setGaranteSelected(true);
      setPropietarioSelected(false);
    } else if (selectedValue === "propietario") {
      setGaranteSelected(false);
      setPropietarioSelected(true);
    } else {
      setGaranteSelected(false);
      setPropietarioSelected(false);
    }
  }, [selectedValue]);



  useEffect(() => {
    fetchPropietarios();
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
  const fetchPropietarios = async () => {
    try {
      const response = await PropietarioApi.getPropietarios();
      setPropietarios(response.data);
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
      
    }
  };


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
    nombreUsuario:user.username
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

    
    const cambioGarantia = () =>{
      setTipoGarantia(!tipoGarantia)
      if(tipoGarantia == false){
        initialValues.tipoGarantia = "Garantia Propietaria"
      }else{
        initialValues.tipoGarantia = "Recibos de Sueldo"
      }
    } 
  // Función para obtener los propietarios desde la API



  // useEffect para cargar los propietarios cuando se monta el componente


  // Función para manejar el envío del formulario
  const onSubmit = async (values, { setSubmitting }) => {
    try {
      await InquilinosApi.crearInquilino(values);
      console.log('Inquilino creado exitosamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Inquilino creado exitosamente',
        icon: 'success',
      })
      // Aquí puedes agregar una acción para redirigir o mostrar un mensaje de éxito
    } catch (error) {
      console.error(`Error al crear el inquilino: ${error.message}` );
      // Muestra el error en el frontend si es necesario
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el inquilino',
        icon: "error",
      })
    } finally {
      setSubmitting(false); // Desactiva el estado de "submitting"
    }
  };
    const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const controlProps = (item) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    name: 'color-radio-button-demo',
    inputProps: { 'aria-label': item },
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SchemaValidation.inquilinoValidation}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur }) => (
        <Form>
          <Grid2 sx={{display:"flex" ,  flexDirection:"column", width:"80vw", justifyContent:"flex-start"}}>
              <Grid2 sx={{ width: '100%', padding:".5rem",height:"30rem", display:"flex", flexDirection:"column", justifyContent:"space-around"
              }}>
              <Box>
                    <Typography>
                    A continuacion ingrese los datos del interventor
                    </Typography>
                  </Box>
              {/* FILA 1 */}
              <Grid2 sx={{display:"flex",justifyContent:"flex-start", gap:"3rem"}}>
              <Box sx={{ marginTop: '.5rem', width:"13.8rem"}}>
                
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
                
                
                </Grid2>
                <Grid2 sx={{display:"flex",flexDirection:"flex-start", gap:"3rem"}}>
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
               
               
               <Grid2 sx={{width:"13.8rem"}}>
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
                <Box sx={{ marginTop: '2rem',width:"13.8rem"}}>
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

               </Grid2>
               <Box sx={{display:"flex",justifyContent:"flex-start", gap:"3rem", width:"100%" }}>
              <Box sx={{ marginTop: '.5rem', width:"13.8rem"}}>
                
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
              </Box>
            </Grid2>
            <Box sx={{ width: "100%", height: "3rem" }}>
            <FormControlLabel
              control={
                <Radio
                  {...controlProps('propietario')}
                  sx={{
                    color: "#6D6D6D",
                    '&.Mui-checked': {
                      color: "#91C6FF",
                    },
                  }}
                />
              }
              label="Propietario"
              labelPlacement="end"
            />

            <FormControlLabel
              control={
                <Radio
                  {...controlProps('inquilino')}
                  sx={{
                    color: "#6D6D6D",
                    '&.Mui-checked': {
                      color: "#C1FF91",
                    },
                  }}
                />
              }
              label="Inquilino"
              labelPlacement="end"
            />

            <FormControlLabel
              control={
                <Radio
                  {...controlProps('garante')}
                  sx={{
                    color: "#6D6D6D",
                    '&.Mui-checked': {
                      color: "#FF91C8",
                    },
                  }}
                />
              }
              label="Garante"
              labelPlacement="end"
            />
          </Box>
          {garanteSelected ? (
            <Grid2>
 <Grid2 dis>

<Grid2 sx={{display:"flex", alignItems:"center",  marginBottom:".5rem"}}>
<Typography>Recibo de Sueldo</Typography>
<Switch onClick={cambioGarantia}/>
<Typography>Garantia Propietaria</Typography>
</Grid2>


{tipoGarantia ? 
(<Grid2 sx={{padding:".5rem", display:"flex", flexDirection:"column"}}>


  <Grid2 sx={{display:"flex", flexDirection:"row", gap:".5rem" }}>
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
  
</Grid2>

<Box sx={{marginTop:"1rem", width:"12rem"}}>
<FormControl fullWidth>
  <InputLabel id="contrato-label">Asignar a contrato</InputLabel>
  <Field
    name="id_contrato"
    as={Select}
    labelId="contrato-label"
    label="Contrato"
    onChange={handleChange}
    onBlur={handleBlur}
    value={values.id_contrato}
  >
    {contratos.data && contratos.data.length > 0 ?
    contratos.data
    .filter((contrato) => contrato.usuarioDtoSalida && contrato.usuarioDtoSalida.username === localUser.name)
    .map((contrato) => (
     
        <MenuItem key={contrato.id} value={contrato.id}>
          {`${contrato.nombreContrato}`}
        </MenuItem>
      ))
     : (
      <MenuItem disabled value="">
        No hay copntratos disponibles
      </MenuItem>
    )}
  </Field>
</FormControl>
<ErrorMessage name="id_contrato" component="div" style={{ color: 'red' }} />
</Box>
 


</Grid2>)
:
(

<Grid2 sx={{ padding:".5rem", display:"flex",flexDirection:"column"}}>
  
  
  <Grid2 sx={{display:"flex",flexDirection:"row", gap:".5rem"}}>



  <Box sx={{ marginTop: '.5rem'}}>
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
  <Box sx={{ marginTop: '.5rem'}}>
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
</Grid2>
  

<Box sx={{width:"12rem", marginTop:"1rem"}}>
<FormControl fullWidth>
  <InputLabel id="contrato-label">Asignar a contrato</InputLabel>
  <Field
    name="id_contrato"
    as={Select}
    labelId="contrato-label"
    label="Contrato"
    onChange={handleChange}
    onBlur={handleBlur}
    value={values.id_contrato}
  >
    {contratos.data && contratos.data.length > 0 ?(
      contratos.data.map((contrato) => (
  
        <MenuItem key={contrato.id} value={contrato.id}>
          {`${contrato.nombreContrato}`}
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled value="">
        No hay copntratos disponibles
      </MenuItem>
    )}
  </Field>
</FormControl>
<ErrorMessage name="id_contrato" component="div" style={{ color: 'red' }} />
</Box>
 


</Grid2>)}


</Grid2>


  
</Grid2>


            



          ):(<></>)}
              </Grid2> 
              
          
         
            <Box sx={{marginTop:"1rem", width:"90%",display:"flex", justifyContent:"flex-end", padding:"1rem"}}>
       
            {garanteSelected ? (
        <Button type="submit" variant="contained" color="primary">
          Nuevo garante
        </Button>
      ) : propietarioSelected ? (
        <Button type="submit" variant="contained" color="primary">
          Nuevo propietario
        </Button>
      ) : (
        <Button type="submit" variant="contained" color="primary">
          Nuevo inquilino
        </Button>
      )}
        
        </Box>
          
        </Form>
      )}
    </Formik>
  );
};


export default IntervinienteForm