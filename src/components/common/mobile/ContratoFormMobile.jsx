import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage} from 'formik';
import {
  TextField,
  Button,
  Stack,
  Container,
  Box,
  MenuItem,
  Select,
  Typography,
  Card,
  Grid2,
  FormControl,
  InputLabel,
  Paper,
  InputAdornment
} from '@mui/material';
import OpacityIcon from '@mui/icons-material/Opacity';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axios from 'axios';
import contratoApi from '../../api/contratoApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns'; 
import { useAuth } from '../../context/GlobalAuth';

const ContratoFormMobile = () => {
  const [localUser, setLocalUser] = useState({
    name: '',
    authorities: '',
  });
  useEffect(() => {
    if (localStorage.getItem("username")) {
      setLocalUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);
  const {logout, user} = useAuth();

  
  const initialValues = {
    nombreContrato: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_propietario: "",
    id_inquilino: "",
    id_propiedad: "",
    garantesIds: [""],
    aguaEmpresa: '',
    aguaPorentaje: 0,
    gasEmpresa: '',
    gasPorcentaje: 0,
    luzEmpresa: '',
    luzPorcentaje: 0,
    municipalEmpresa: '',
    municipalPorcentaje: 0,
    montoAlquilerLetras:'',
    multaXDia:'',
    actualizacion: 0,
    montoAlquiler: 0,
    duracion: 0,
    indiceAjuste:"",
    destino:"",
    activo: true,
    nombreUsuario:localUser.name
  };

  const destinos = [
    { value: 'Habitacional como vivienda unica', label: 'Habitacional' },
    { value: 'Comercial', label: 'Comercial' },
  
  ];

  const [inquilinos, setInquilinos] = useState({ data: [] });
  const [garantes, setGarantes] = useState({ data: [] });
  const [propiedades, setPropiedades] = useState({ data: [] });
  const [propietarios, setPropietarios] = useState({ data: [] });
  const [aguas, setServicioAgua] = useState([]);
  const [gases, setServicioGas] = useState([]);
  const [luces, setServicioLuz] = useState([]);
  const [munis, setServicioMunicipal] = useState([]);
  // Obtener datos de la API
  useEffect(() => {
    fetchPropietarios()
    fetchPropiedades()
    fetchInquilinos()
    fetchGarantes()
    fetchAgua()
    fetchGas()
    fetchLuz()
    fetchMunicipal()
  }, []);

  const fetchPropietarios = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/propietario/all`);
      const propietariosArray = Array.isArray(response.data) ? response.data : 
                           (response.data && response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setPropietarios({ data: propietariosArray });
    } catch (error) {
      console.error('Error fetching propietarios:', error);
    }
  };

  const fetchInquilinos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/inquilino/all`);
      const inquilinosArray = Array.isArray(response.data) ? response.data : 
                           (response.data && response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setInquilinos({ data: inquilinosArray });
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
    }
  };
  
  // Add this useEffect to log when inquilinos state changes
  useEffect(() => {
    if (inquilinos && inquilinos.data) {
      console.log("Updated inquilinos data:", inquilinos.data);
    }
  }, [inquilinos]);
  
  const fetchPropiedades = async () => {
    try { 
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/propiedad/all`);
      const propiedadesArray = Array.isArray(response.data) ? response.data : 
                           (response.data && response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setPropiedades({ data: propiedadesArray });
    } catch (error) {
      console.error('Error fetching propiedades:', error);
    }
  };

  const fetchGarantes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/garante/all`);
      const garantesArray = Array.isArray(response.data) ? response.data : 
                           (response.data && response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      setGarantes({ data: garantesArray });
    } catch (error) {
      console.error('Error fetching garantes:', error);
    }
  };

  const fetchAgua = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/impuesto/agua/all`);
      setServicioAgua(response.data)
  }catch (error) {
    console.error('Error fetching servicios de agua:', error);
  }
};

const fetchGas = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/impuesto/gas/all`);
    setServicioGas(response.data)
}catch (error) {
  console.error('Error fetching servicios de gas:', error);
}
};

const fetchLuz = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/impuesto/luz/all`);
    setServicioLuz(response.data)
  }catch (error) {
    console.error('Error fetching servicios de Luz:', error);
  }
};

const fetchMunicipal = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/impuesto/municipal/all`);
    setServicioMunicipal(response.data)
  }catch (error) {
    console.error('Error fetching servicios de Luz:', error);
  }
};

  const [addGarante, setAddGarante] = useState(0)
 
  const clickAddGarante = () => {
    setAddGarante(addGarante+1)
  }
  const clickMinGarante = () => {
    if(addGarante >= 1  ){
      setAddGarante(addGarante-1)
    }else{
    console.log("no se puede - 0 garantes")
    }
  }



  const onSubmit = async (values, { setSubmitting }) => {
    try {
      // Ensure all numeric fields are properly formatted as numbers
      const formattedValues = {
        ...values,
        fecha_inicio: format(new Date(values.fecha_inicio), 'dd-MM-yyyy'),  
        fecha_fin: format(new Date(values.fecha_fin), 'dd-MM-yyyy'),
        // Convert string values to numbers where needed
        montoAlquiler: Number(values.montoAlquiler) || 0,
        duracion: Number(values.duracion) || 0,
        actualizacion: Number(values.actualizacion) || 0,
        aguaPorentaje: Number(values.aguaPorentaje) || 0,
        gasPorcentaje: Number(values.gasPorcentaje) || 0,
        luzPorcentaje: Number(values.luzPorcentaje) || 0,
        municipalPorcentaje: Number(values.municipalPorcentaje) || 0,
        nombreUsuario: localUser.name, // Ensure this is set correctly
        // Filter out empty values from garantesIds, safely handling non-string values
        garantesIds: values.garantesIds
          .filter(id => id !== null && id !== undefined) // Filter out null/undefined
          .filter(id => typeof id === 'string' ? id.trim() !== "" : true) // Only trim strings
          .map(id => typeof id === 'string' ? (Number(id) || 0) : id) // Convert to numbers safely
      };

      // If garantesIds is empty, set it to an empty array instead of an array with empty strings
      if (formattedValues.garantesIds.length === 0) {
        formattedValues.garantesIds = [];
      }

      console.log("Sending contract data:", formattedValues);
      const response = await contratoApi.crearContrato(formattedValues);
      console.log("Server response:", response);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Contrato creado exitosamente',
        icon: 'success',
      });
    } catch (error) {
      console.error(`Error al crear el Contrato:`, error);
      
      // Log more detailed error information 
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
      }
      
      Swal.fire({
        title: 'Error',
        text: `Error al crear el contrato: ${error.response?.data?.message || error.message || 'Error desconocido'}`,
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik 
    initialValues={initialValues} 
    onSubmit={onSubmit}>
      {({ values, handleChange, handleBlur }) => (
        <Form>
          <Typography variant="h4" gutterBottom>
            Crear Contrato
          </Typography>
          <Grid2 container spacing={2} sx={{ display:"flex", flexDirection:"column"}}>
            <Grid2 item xs={12}>
              <Field
                name="nombreContrato"
                label="Nombre del Contrato"
                as={TextField}
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.nombreContrato}
              />
            </Grid2>
          <Grid2 sx={{display:"flex", justifyContent:"space-evenly"}}>

            <Grid2 item xs={12} sm={6} sx={{width:"50%", padding:".2rem"}}>
              <Field
                name="fecha_inicio"
                label="Fecha de Inicio"
                as={TextField}
                type="date"
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.fecha_inicio}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>
            <Grid2 item xs={12} sm={6} sx={{width:"50%", padding:".2rem"}}>
              <Field
                name="fecha_fin"
                label="Fecha de Fin"
                as={TextField}
                type="date"
                fullWidth
                margin="normal"
                onChange={handleChange}    
                value={values.fecha_fin}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>
            </Grid2>

            {/* Select Propietario */}
            <Box sx={{marginTop:".5rem"}}>
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
                {propietarios.data && propietarios.data.length > 0
        ? propietarios.data
            .filter((propietario) => propietario.usuarioDtoSalida && propietario.usuarioDtoSalida.username === localUser.name)
            .map((propietario) => (
              <MenuItem key={propietario.id} value={propietario.id}>
                {`${propietario.nombre} ${propietario.apellido}`}
              </MenuItem>
            ))
        : (
          <MenuItem disabled value="">
            No hay propietarios disponibles
          </MenuItem>
        )}
              </Field>
            </FormControl>
            <ErrorMessage name="id_propietario" component="div" style={{ color: 'red' }} />
           </Box> 
        
           <Grid2 id="inputsGarantes">
  {Array.from({ length: addGarante }, (_, index) => (
    <Box key={index} sx={{ marginTop: ".5rem" }}>
      <FormControl fullWidth>
        <InputLabel id={`garante-label-${index}`}>Garantes</InputLabel>
        <Field
          name={`garantesIds[${index}]`} // Nombre dinámico para cada garante
          as={Select}
          labelId={`garante-label-${index}`}
          label="Garante"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.garantesIds[index] || ""}
        >
            {garantes.data && garantes.data.length > 0
        ? garantes.data
            .filter((garante) => garante.usuarioDtoSalida && garante.usuarioDtoSalida.username === localUser.name)
            .map((garante) => (
              <MenuItem key={garante.id} value={garante.id}>
                {`${garante.nombre} ${garante.apellido}`}
              </MenuItem>
            ))
        : (  
          <MenuItem disabled value="">
            No hay garantes disponibles
          </MenuItem>
        )}
        </Field>
      </FormControl>
      <ErrorMessage name={`garantesIds[${index}]`} component="div" style={{ color: 'red' }} />
    </Box>
  ))}

  <Button onClick={clickAddGarante}>+ garante</Button>
  <Button onClick={clickMinGarante}>- garante</Button>
</Grid2>
           

        
            {/* Select propiedad */}
            <Box sx={{marginTop:".5rem"}}>
            <FormControl fullWidth>
              <InputLabel id="propiedad-label">Propiedad</InputLabel>
              <Field
                name="id_propiedad"
                as={Select}
                labelId="propiedad-label"
                label="Propiedad"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.id_propiedad}
              >
                {propiedades.data && propiedades.data.length > 0 ?(
                  propiedades.data.map((propiedad) => (
              
                    <MenuItem key={propiedad.id} value={propiedad.id}>
                    {`${propiedad.direccion}`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No hay propiedades disponibles
                  </MenuItem>
                )}
              </Field>
            </FormControl>
            <ErrorMessage name="id_propiedad" component="div" style={{ color: 'red' }} />


          </Box>

          <Box sx={{marginTop:".5rem"}}>
            <FormControl fullWidth>
              <InputLabel id="inquilino-label">Inquilino</InputLabel>
              <Field
                name="id_inquilino"
                as={Select}
                labelId="inquilino-label"
                label="Inquilino"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.id_inquilino}
              >
                {inquilinos.data && inquilinos.data.length > 0 ?(
                  inquilinos.data.map((inquilino) => (
              
                    <MenuItem key={inquilino.id} value={inquilino.id}>
                    {`${inquilino.nombre} ${inquilino.apellido}`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No hay propiedades disponibles
                  </MenuItem>
                )}
              </Field>
            </FormControl>
            <ErrorMessage name="id_inquilino" component="div" style={{ color: 'red' }} />


          </Box>
          <Box sx={{ marginTop: '.5rem'}}>
                
                <Field name="destino">
                  {({ field, form }) => (
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="destino-label">Destino</InputLabel>
                      <Select
                        labelId="destino-label"
                        label="Destino"
                        {...field}
                        value={form.values.destino}
                        onChange={(e) => {
                          form.setFieldValue("destino", e.target.value);
                        }}
                      >
                        {destinos.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    )}
                  </Field>
                </Box>
            {/* Select Garantes */}
            

           
            <Grid2 item xs={12}>
              <Field
                name="montoAlquiler"
                label="Valor alquiler en pesos"
                as={TextField}
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.montoAlquiler}
              />
            </Grid2>
            <Grid2 item xs={12}>
              <Field
                name="montoAlquilerLetras"
                label="Valor alquiler en letras"
                as={TextField}
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.montoAlquilerLetras}
              />
            </Grid2>
            <Grid2 item xs={12}>
              <Field
                name="actualizacion"
                label="Periodo de actualizacion"
                as={TextField}
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.actualizacion}
              />
            </Grid2>
            <Grid2 item xs={12}>
              <Field
                name="duracion"
                label="Duración (meses)"
                as={TextField}
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.duracion}
              />
            </Grid2>
            <Grid2 item xs={12}>
              <Field
                name="indiceAjuste"
                label="Indice de Ajuste"
                as={TextField}
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.indiceAjuste}
              />
            </Grid2>

            <Grid2 item xs={12}>
              <Field
                name="multaXDia"
                label="multa por dia de atraso"
                as={TextField}
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={values.multaXDia}
              />
            </Grid2>
            <Grid2>
            <Grid2 item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Servicios
              </Typography>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                }}
              >
                {/* Agua */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#f0f7ff',
                    }
                  }}
                >
                  <OpacityIcon sx={{ color: '#2196f3', mr: 2 }} />
                  <TextField
                    name="aguaEmpresa"
                    label="Empresa de Agua"
                    fullWidth
                    margin="dense"
                    onChange={handleChange}
                    value={values.aguaEmpresa}
                    sx={{ mr: 2 }}
                  />
                  <TextField
                    name="aguaPorentaje"
                    label="Porcentaje (%)"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    onChange={handleChange}
                    value={values.aguaPorentaje}
                    sx={{ width: '150px' }}
                  />
                </Box>

                {/* Gas */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#fff7f0',
                    }
                  }}
                >
                  <LocalFireDepartmentIcon sx={{ color: '#ff9800', mr: 2 }} />
                  <TextField
                    name="gasEmpresa"
                    label="Empresa de Gas"
                    fullWidth
                    margin="dense"
                    onChange={handleChange}
                    value={values.gasEmpresa}
                    sx={{ mr: 2 }}
                  />
                  <TextField
                    name="gasPorcentaje"
                    label="Porcentaje (%)"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    onChange={handleChange}
                    value={values.gasPorcentaje}
                    sx={{ width: '150px' }}
                  />
                </Box>

                {/* Luz */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#f9fce8',
                    }
                  }}
                >
                  <BoltIcon sx={{ color: '#ffc107', mr: 2 }} />
                  <TextField
                    name="luzEmpresa"
                    label="Empresa de Luz"
                    fullWidth
                    margin="dense"
                    onChange={handleChange}
                    value={values.luzEmpresa}
                    sx={{ mr: 2 }}
                  />
                  <TextField
                    name="luzPorcentaje"
                    label="Porcentaje (%)"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    onChange={handleChange}
                    value={values.luzPorcentaje}
                    sx={{ width: '150px' }}
                  />
                </Box>

                {/* Municipal */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 1,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#f0f5f0',
                    }
                  }}
                >
                  <AccountBalanceIcon sx={{ color: '#4caf50', mr: 2 }} />
                  <TextField
                    name="municipalEmpresa"
                    label="Empresa Municipal"
                    fullWidth
                    margin="dense"
                    onChange={handleChange}
                    value={values.municipalEmpresa}
                    sx={{ mr: 2 }}
                  />
                  <TextField
                    name="municipalPorcentaje"
                    label="Porcentaje (%)"
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    onChange={handleChange}
                    value={values.municipalPorcentaje}
                    sx={{ width: '150px' }}
                  />
                </Box>
              </Paper>
            </Grid2>
            </Grid2>
            <Grid2 item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Enviar
              </Button>
            </Grid2>
          </Grid2>
        </Form>
      )}
    </Formik>
  );
};

export default ContratoFormMobile;
