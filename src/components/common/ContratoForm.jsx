import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage} from 'formik';
import {
  Box,
  MenuItem,
  TextField,
  Divider,
  Button,
  Select,
  Typography,
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
import contratoApi from '../api/contratoApi';
import Swal from 'sweetalert2';
import { format } from 'date-fns'; 
import { useAuth } from '../context/GlobalAuth';
import PropietarioApi from '../api/propietarios';
import InquilinosApi from '../api/inquilinosApi';
import PropiedadApi from '../api/propiedades';
import GaranteApi from '../api/garanteApi';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const ContratoForm = () => {
  const [localUser, setLocalUser] = useState({
    name: '',
    authorities: '',
  });
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("username")) {
      const username = localStorage.getItem("username");
      const authorities = localStorage.getItem("authorities");
      setLocalUser({
        name: username,
        authorities: authorities,
      });
      setIsUserLoaded(true);
    }
  }, []);
  const {logout, user} = useAuth();

  console.log(localUser.name)
  const initialValues = {
    nombreContrato: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_propietario: "",
    id_inquilino: "",
    id_propiedad: "",
    garantesIds: [""],
    aguaEmpresa: '',
    aguaPorentaje: 100,
    gasEmpresa: '',
    gasPorcentaje: 100,
    luzEmpresa: '',
    luzPorcentaje: 50,
    municipalEmpresa: '',
    municipalPorcentaje: 25,
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

  const [inquilinos, setInquilinos] = useState([]);
  const [searchTermInquilino, setSearchTermInquilino] = useState('');
  const [garantes, setGarantes] = useState([]);
  const [searchTermGarante, setSearchTermGarante] = useState('');
  const [propiedades, setPropiedades] = useState([]);
  const [searchTermPropiedad, setSearchTermPropiedad] = useState('');
  const [propietarios, setPropietarios] = useState([]);
  const [isLoading, setIsLoading] = useState({
    propietarios: false,
    inquilinos: false,
    propiedades: false,
    garantes: false
  });

  // Obtener datos de la API solo después de que se haya cargado el usuario
  useEffect(() => {
    if (isUserLoaded && localUser.name) {
      console.log("Fetching data with username:", localUser.name);
      fetchPropietarios();
      fetchPropiedades();
      fetchInquilinos();
      fetchGarantes();
    }
  }, [isUserLoaded, localUser.name]);

  const fetchPropietarios = async () => {
    if (!localUser.name) {
      console.log("Username not available for fetchPropietarios");
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, propietarios: true }));
      // Use the known working endpoint pattern
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/propietario/all`);
      if (result && result.data) {
        // Handle both array response and nested data object
        const propietariosArray = Array.isArray(result.data) ? result.data : 
                              (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
        // Manually filter by username since we're using the /all endpoint
        const filteredPropietarios = propietariosArray.filter(propietario => {
          if (!propietario.usuarioDtoSalida) return false;
          return propietario.usuarioDtoSalida.username === localUser.name;
        });
        setPropietarios({ data: filteredPropietarios });
      }
    } catch (error) {
      console.error('Error fetching propietarios:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, propietarios: false }));
    }
  };


  const fetchInquilinos = async () => {
    if (!localUser.name) {
      console.log("Username not available for fetchInquilinos");
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, inquilinos: true }));
      // Use the known working endpoint pattern
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/inquilino/all`);
      if (result && result.data) {
        // Handle both array response and nested data object
        const inquilinosArray = Array.isArray(result.data) ? result.data : 
                              (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
        // Manually filter by username since we're using the /all endpoint
        const filteredInquilinos = inquilinosArray.filter(inquilino => {
          if (!inquilino.usuarioDtoSalida) return false;
          return inquilino.usuarioDtoSalida.username === localUser.name;
        });
        setInquilinos({ data: filteredInquilinos });
      }
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, inquilinos: false }));
    }
  };

  const fetchPropiedades = async () => {
    if (!localUser.name) {
      console.log("Username not available for fetchPropiedades");
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, propiedades: true }));
      // Use the known working endpoint pattern
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/propiedad/all`);
      if (result && result.data) {
        // Handle both array response and nested data object
        const propiedadesArray = Array.isArray(result.data) ? result.data : 
                              (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
        // Manually filter by username since we're using the /all endpoint
        const filteredPropiedades = propiedadesArray.filter(propiedad => {
          if (!propiedad.usuarioDtoSalida) return false;
          return propiedad.usuarioDtoSalida.username === localUser.name;
        });
        setPropiedades({ data: filteredPropiedades });
      }
    } catch (error) {
      console.error('Error fetching propiedades:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, propiedades: false }));
    }
  };

  const fetchGarantes = async () => {
    if (!localUser.name) {
      console.log("Username not available for fetchGarantes");
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, garantes: true }));
      // Use the known working endpoint pattern
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/garante/all`);
      if (result && result.data) {
        // Handle both array response and nested data object
        const garantesArray = Array.isArray(result.data) ? result.data : 
                              (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
        // Manually filter by username since we're using the /all endpoint
        const filteredGarantes = garantesArray.filter(garante => {
          if (!garante.usuarioDtoSalida) return false;
          return garante.usuarioDtoSalida.username === localUser.name;
        });
        setGarantes({ data: filteredGarantes });
      }
    } catch (error) {
      console.error('Error fetching garantes:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, garantes: false }));
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
    const formattedValues = {
      ...values,
      fecha_inicio: format(new Date(values.fecha_inicio), 'dd-MM-yyyy'),  
      fecha_fin: format(new Date(values.fecha_fin), 'dd-MM-yyyy'), 
    };

    try {
      await contratoApi.crearContrato(formattedValues);
      console.log(formattedValues)
      console.log('Contrato creado exitosamente');
      Swal.fire({
        title: '¡Éxito!',
        text: 'Contrato creado exitosamente',
        icon: 'success',
      })
    } catch (error) {
      console.error(`Error al crear el Contrato: ${error.message}`);
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el contrato',
        icon: "error",
      })
      console.log(values)
      console.log(`${error.message}`)
    } finally {
      setSubmitting(false);
    }
  };
  if (!isUserLoaded) return null;
  return (
    <Formik 
    initialValues={initialValues} 
    onSubmit={onSubmit}
    enableReinitialize >
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
                {propietarios && propietarios.data && propietarios.data.length > 0
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
        
           <Box sx={{ marginTop: '.5rem'}}>
            <Typography variant="h6" sx={{ 
              color: 'primary.main', 
              fontWeight: 600, 
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}>
              Seleccionar Inquilino
            </Typography>
            
            <TextField
              fullWidth
              label="Buscar Inquilino"
              variant="outlined"
              value={searchTermInquilino}
              onChange={(e) => setSearchTermInquilino(e.target.value)}
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
              placeholder="Buscar por nombre, apellido o DNI"
            />
            
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
                {inquilinos && inquilinos.data ? 
                  (inquilinos.data.length > 0 ? (
                    inquilinos.data.filter((inquilino) => {
                      if (searchTermInquilino === '') return true;
                      
                      const nombre = inquilino.nombre || "";
                      const apellido = inquilino.apellido || "";
                      const dni = inquilino.dni || "";
                      const email = inquilino.email || "";
                      const telefono = inquilino.telefono || "";
                      
                      const termino = searchTermInquilino.toLowerCase();
                      
                      return nombre.toLowerCase().includes(termino) ||
                            apellido.toLowerCase().includes(termino) ||
                            dni.toLowerCase().includes(termino) ||
                            email.toLowerCase().includes(termino) ||
                            telefono.toLowerCase().includes(termino);
                    }).map((inquilino) => (
                      <MenuItem key={inquilino.id} value={inquilino.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1">{`${inquilino.nombre} ${inquilino.apellido}`}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {inquilino.dni && `DNI: ${inquilino.dni}`} 
                            {inquilino.telefono && ` • Tel: ${inquilino.telefono}`}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No hay inquilinos disponibles
                    </MenuItem>
                  )
                ) : (
                  <MenuItem disabled value="">
                    Cargando inquilinos...
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

            {/* Select propiedad */}
            <Box sx={{ marginTop: '.5rem'}}>
            <Typography variant="h6" sx={{ 
              color: 'primary.main', 
              fontWeight: 600, 
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}>
              Seleccionar Propiedad
            </Typography>
            
            <TextField
              fullWidth
              label="Buscar Propiedad"
              variant="outlined"
              value={searchTermPropiedad}
              onChange={(e) => setSearchTermPropiedad(e.target.value)}
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
              placeholder="Buscar por dirección o localidad"
            />
            
            <FormControl fullWidth>
              <InputLabel id="Propiedad-label">Propiedad</InputLabel>
              <Field
                name="id_propiedad"
                as={Select}
                labelId="Propiedad-label"
                label="Propiedad"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.id_propiedad}
              >
                {propiedades && propiedades.data ? 
                  (propiedades.data.length > 0 ? (
                    propiedades.data.filter((propiedad) => {
                      if (searchTermPropiedad === '') return true;
                      
                      const direccion = propiedad.direccion || "";
                      const localidad = propiedad.localidad || "";
                      const partido = propiedad.partido || "";
                      const provincia = propiedad.provincia || "";
                      
                      const termino = searchTermPropiedad.toLowerCase();
                      
                      return direccion.toLowerCase().includes(termino) ||
                             localidad.toLowerCase().includes(termino) ||
                             partido.toLowerCase().includes(termino) ||
                             provincia.toLowerCase().includes(termino);
                    }).map((propiedad) => (
                      <MenuItem key={propiedad.id} value={propiedad.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1">{propiedad.direccion}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {propiedad.localidad && `${propiedad.localidad}`} 
                            {propiedad.partido && `, ${propiedad.partido}`}
                            {propiedad.provincia && `, ${propiedad.provincia}`}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No hay propiedades disponibles
                    </MenuItem>
                  )
                ) : (
                  <MenuItem disabled value="">
                    Cargando propiedades...
                  </MenuItem>
                )}
              </Field>
            </FormControl>
            <ErrorMessage name="id_propiedad" component="div" style={{ color: 'red' }} />
          </Box>

            {/* Select Garantes */}
            <Box sx={{ marginTop: '.5rem'}}>
              <Typography variant="h6" sx={{ 
                color: 'primary.main', 
                fontWeight: 600, 
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}>
                Seleccionar Garantes
              </Typography>
              
              <TextField
                fullWidth
                label="Buscar Garante"
                variant="outlined"
                value={searchTermGarante}
                onChange={(e) => setSearchTermGarante(e.target.value)}
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
                placeholder="Buscar por nombre, apellido o DNI"
              />
              
              <Grid2 id="inputsGarantes">
                {Array.from({ length: addGarante }, (_, index) => (
                  <Box key={index} sx={{ marginTop: ".5rem" }}>
                    <FormControl fullWidth>
                      <InputLabel id={`garante-label-${index}`}>Garantes</InputLabel>
                      <Field
                        name={`garantesIds[${index}]`}
                        as={Select}
                        labelId={`garante-label-${index}`}
                        label="Garante"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.garantesIds[index] || ""}
                      >
                        {garantes && garantes.data ? 
                          (garantes.data.length > 0 ? (
                            garantes.data
                              .filter((garante) => garante.usuarioDtoSalida && garante.usuarioDtoSalida.username === localUser.name)
                              .filter((garante) => {
                                if (searchTermGarante === '') return true;
                                
                                const nombre = garante.nombre || "";
                                const apellido = garante.apellido || "";
                                const dni = garante.dni || "";
                                const email = garante.email || "";
                                const telefono = garante.telefono || "";
                                
                                const termino = searchTermGarante.toLowerCase();
                                
                                return nombre.toLowerCase().includes(termino) ||
                                      apellido.toLowerCase().includes(termino) ||
                                      dni.toLowerCase().includes(termino) ||
                                      email.toLowerCase().includes(termino) ||
                                      telefono.toLowerCase().includes(termino);
                              })
                              .map((garante) => (
                                <MenuItem key={garante.id} value={garante.id}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="body1">{`${garante.nombre} ${garante.apellido}`}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {garante.dni && `DNI: ${garante.dni}`} 
                                      {garante.telefono && ` • Tel: ${garante.telefono}`}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled value="">
                              No hay garantes disponibles
                            </MenuItem>
                          )
                        ) : (
                          <MenuItem disabled value="">
                            Cargando garantes...
                          </MenuItem>
                        )}
                      </Field>
                    </FormControl>
                    <ErrorMessage name={`garantesIds[${index}]`} component="div" style={{ color: 'red' }} />
                  </Box>
                ))}

                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button 
                    onClick={clickAddGarante}
                    variant="outlined"
                    startIcon={<AddIcon />}
                    size="small"
                  >
                    Agregar garante
                  </Button>
                  <Button 
                    onClick={clickMinGarante}
                    variant="outlined"
                    color="error"
                    startIcon={<RemoveIcon />}
                    size="small"
                    disabled={addGarante <= 0}
                  >
                    Quitar garante
                  </Button>
                </Box>
              </Grid2>
            </Box>
           

        
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

export default ContratoForm;
