import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Card,
  CardContent,
  Grid as Grid2,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Slide,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import OpacityIcon from '@mui/icons-material/Opacity';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import PropietarioForm from '../common/PropietarioForm';
import InquilinoForm from '../common/InquilinoForm';
import PropiedadesForm from '../common/PropiedadesForm';
import GaranteForm from '../common/GaranteForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import contratoApi from '../api/contratoApi';
import PropietarioApi from '../api/propietarios';
import InquilinosApi from '../api/inquilinosApi';
import PropiedadApi from '../api/propiedades';
import GaranteApi from '../api/garanteApi';
import Swal from 'sweetalert2';
import { useAuth } from '../context/GlobalAuth';

// Slide transition for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CrearContratoPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth(); // Usar el contexto de autenticación para obtener el usuario
  
  // User state
  const [userState, setUserState] = useState({
    name: '',
    authorities: '',
  });

  useEffect(() => {
    if (user) {
      setUserState({
        name: user.username,
        authorities: user.authorities,
      });
    }
  }, [user]);
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Seleccionar Propietario',
    'Seleccionar Inquilino',
    'Seleccionar Propiedad',
    'Agregar Garantes',
    'Detalles del Contrato'
  ];

  // Dialog states for creating new entities
  const [openPropietarioDialog, setOpenPropietarioDialog] = useState(false);
  const [openInquilinoDialog, setOpenInquilinoDialog] = useState(false);
  const [openPropiedadDialog, setOpenPropiedadDialog] = useState(false);
  const [openGaranteDialog, setOpenGaranteDialog] = useState(false);

  // Loading states
  const [loading, setLoading] = useState({
    propietarios: false,
    inquilinos: false,
    propiedades: false,
    garantes: false
  });

  // Error states
  const [error, setError] = useState({
    propietarios: null,
    inquilinos: null,
    propiedades: null,
    garantes: null
  });

  // Data states
  const [propietarios, setPropietarios] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [garantes, setGarantes] = useState([]);

  // Search states
  const [search, setSearch] = useState({
    propietario: '',
    inquilino: '',
    propiedad: '',
    garante: ''
  });

  // Estado y constantes para paginación
  const ITEMS_PER_PAGE = 4;
  
  const [pagination, setPagination] = useState({
    propietarios: 0,
    inquilinos: 0,
    propiedades: 0,
    garantes: 0
  });
  
  const handleNextPage = (type) => {
    setPagination(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };
  
  const handlePrevPage = (type) => {
    setPagination(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1)
    }));
  };

  // Form state for contract creation
  const [contratoForm, setContratoForm] = useState({
    nombreContrato: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_propietario: '',
    id_inquilino: '',
    id_propiedad: '',
    garantesIds: [],
    montoAlquiler: '',
    montoAlquilerLetras: '',
    duracion: '',
    multaXDia: '',
    actualizacion: '',
    indiceAjuste: '',
    destino: '',
    aguaEmpresa: '',
    aguaPorcentaje: 100,
    gasEmpresa: '',
    gasPorcentaje: 100,
    luzEmpresa: '',
    luzPorcentaje: 50,
    municipalEmpresa: '',
    municipalPorcentaje: 25,
    activo: true,
    nombreUsuario: userState.name
  });

  // Selected entities
  const [selectedPropietario, setSelectedPropietario] = useState(null);
  const [selectedInquilino, setSelectedInquilino] = useState(null);
  const [selectedPropiedad, setSelectedPropiedad] = useState(null);
  const [selectedGarantes, setSelectedGarantes] = useState([]);

  // Fetch data functions
  const fetchPropietarios = async () => {
    setLoading(prev => ({ ...prev, propietarios: true }));
    setError(prev => ({ ...prev, propietarios: null }));
    try {
      const result = await PropietarioApi.getPropietariosPerLocalUser(userState.name);
      if (result && result.data) {
        setPropietarios(result.data);
      }
    } catch (err) {
      console.error('Error fetching propietarios:', err);
      setError(prev => ({ ...prev, propietarios: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, propietarios: false }));
    }
  };

  const fetchInquilinos = async () => {
    setLoading(prev => ({ ...prev, inquilinos: true }));
    setError(prev => ({ ...prev, inquilinos: null }));
    try {
      const result = await InquilinosApi.getInquilinosPerLocalUser(userState.name);
      if (result && result.data) {
        setInquilinos(result.data);
      }
    } catch (err) {
      console.error('Error fetching inquilinos:', err);
      setError(prev => ({ ...prev, inquilinos: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, inquilinos: false }));
    }
  };

  const fetchPropiedades = async () => {
    setLoading(prev => ({ ...prev, propiedades: true }));
    setError(prev => ({ ...prev, propiedades: null }));
    try {
      const result = await PropiedadApi.getPropiedadesPerLocalUser(userState.name);
      if (result && result.data) {
        setPropiedades(result.data);
      }
    } catch (err) {
      console.error('Error fetching propiedades:', err);
      setError(prev => ({ ...prev, propiedades: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, propiedades: false }));
    }
  };

  const fetchGarantes = async () => {
    setLoading(prev => ({ ...prev, garantes: true }));
    setError(prev => ({ ...prev, garantes: null }));
    try {
      const result = await GaranteApi.getGarantesPerLocalUser(userState.name);
      if (result && result.data) {
        setGarantes(result.data);
      }
    } catch (err) {
      console.error('Error fetching garantes:', err);
      setError(prev => ({ ...prev, garantes: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, garantes: false }));
    }
  };

  // Load initial data
  useEffect(() => {
    if (userState.name) {
      fetchPropietarios();
      fetchInquilinos();
      fetchPropiedades();
      fetchGarantes();
    }
  }, [userState.name]);

  // Dialog handlers
  const handleClosePropietarioDialog = () => {
    setOpenPropietarioDialog(false);
    fetchPropietarios(); // Refresh the list after creating a new propietario
  };

  const handleCloseInquilinoDialog = () => {
    setOpenInquilinoDialog(false);
    fetchInquilinos(); // Refresh the list after creating a new inquilino
  };

  const handleClosePropiedadDialog = () => {
    setOpenPropiedadDialog(false);
    fetchPropiedades(); // Refresh the list after creating a new propiedad
  };

  const handleCloseGaranteDialog = () => {
    setOpenGaranteDialog(false);
    fetchGarantes(); // Refresh the list after creating a new garante
  };

  // Step handlers
  const handleNext = () => {
    // Validation before proceeding to next step
    if (activeStep === 0 && !selectedPropietario) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar un propietario para continuar'
      });
      return;
    }
    
    if (activeStep === 1 && !selectedInquilino) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar un inquilino para continuar'
      });
      return;
    }
    
    if (activeStep === 2 && !selectedPropiedad) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar una propiedad para continuar'
      });
      return;
    }
    
    if (activeStep === 3 && selectedGarantes.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar al menos un garante para continuar'
      });
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedPropietario(null);
    setSelectedInquilino(null);
    setSelectedPropiedad(null);
    setSelectedGarantes([]);
    setContratoForm({
      nombreContrato: '',
      fecha_inicio: '',
      fecha_fin: '',
      id_propietario: '',
      id_inquilino: '',
      id_propiedad: '',
      garantesIds: [],
      montoAlquiler: '',
      montoAlquilerLetras: '',
      duracion: '',
      multaXDia: '',
      actualizacion: '',
      indiceAjuste: '',
      destino: '',
      aguaEmpresa: '',
      aguaPorcentaje: 100,
      gasEmpresa: '',
      gasPorcentaje: 100,
      luzEmpresa: '',
      luzPorcentaje: 50,
      municipalEmpresa: '',
      municipalPorcentaje: 25,
      activo: true,
      nombreUsuario: userState.name
    });
  };

  // Selection handlers
  const handleSelectPropietario = (propietario) => {
    setSelectedPropietario(propietario);
    setContratoForm(prev => ({
      ...prev,
      id_propietario: propietario.id
    }));
  };

  const handleSelectInquilino = (inquilino) => {
    setSelectedInquilino(inquilino);
    setContratoForm(prev => ({
      ...prev,
      id_inquilino: inquilino.id
    }));
  };

  const handleSelectPropiedad = (propiedad) => {
    setSelectedPropiedad(propiedad);
    setContratoForm(prev => ({
      ...prev,
      id_propiedad: propiedad.id
    }));
  };

  const handleSelectGarante = (garante) => {
    const isSelected = selectedGarantes.some(g => g.id === garante.id);
    
    if (isSelected) {
      // Remove garante if already selected
      setSelectedGarantes(prev => prev.filter(g => g.id !== garante.id));
      setContratoForm(prev => ({
        ...prev,
        garantesIds: prev.garantesIds.filter(id => id !== garante.id)
      }));
    } else {
      // Add garante if not already selected
      setSelectedGarantes(prev => [...prev, garante]);
      setContratoForm(prev => ({
        ...prev,
        garantesIds: [...prev.garantesIds, garante.id]
      }));
    }
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContratoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar campos requeridos
      const requiredFields = [
        'nombreContrato', 
        'fecha_inicio', 
        'fecha_fin', 
        'montoAlquiler',
        'montoAlquilerLetras', 
        'duracion',
        'id_propietario',
        'id_propiedad',
        'id_inquilino'
      ];
      
      const missingFields = requiredFields.filter(field => !contratoForm[field]);
      
      if (missingFields.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Campos requeridos',
          text: `Por favor complete los siguientes campos: ${missingFields.join(', ')}`
        });
        return;
      }
      
      // Sanitizar datos antes de enviar
      const formData = { ...contratoForm };
      
      // Asegurar que el nombre de usuario esté establecido (requisito del backend)
      formData.nombreUsuario = userState.name;
      
      // Establecer campos faltantes con valores por defecto
      const defaultValues = {
        activo: true,
        destino: formData.destino || "Habitacional como vivienda unica",
        indiceAjuste: formData.indiceAjuste || "ipc"
      };
      
      // Aplicar valores por defecto
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (!formData[key]) {
          formData[key] = value;
        }
      });
      
      // Convertir fechas al formato dd-MM-yyyy que espera el backend
      if (formData.fecha_inicio) {
        // Convertir de yyyy-MM-dd a dd-MM-yyyy
        const [year, month, day] = formData.fecha_inicio.split('-');
        formData.fecha_inicio = `${day}-${month}-${year}`;
      }
      
      if (formData.fecha_fin) {
        // Convertir de yyyy-MM-dd a dd-MM-yyyy
        const [year, month, day] = formData.fecha_fin.split('-');
        formData.fecha_fin = `${day}-${month}-${year}`;
      }
      
      // Asegurar que los valores numéricos sean positivos y se envíen como números, no strings
      const numericFields = ['actualizacion', 'multaXDia', 'montoAlquiler', 'duracion'];
      
      numericFields.forEach(field => {
        if (formData[field]) {
          // Convertir a número y asegurar que sea positivo
          let value = parseFloat(formData[field]);
          formData[field] = isNaN(value) ? 0 : Math.abs(value);
        } else {
          // Establecer un valor predeterminado si está vacío
          formData[field] = 0;
        }
      });
      
      // Asegurarse de que los porcentajes se envíen como strings (según el formato esperado por el backend)
      const percentageFields = ['aguaPorcentaje', 'gasPorcentaje', 'luzPorcentaje', 'municipalPorcentaje'];
      percentageFields.forEach(field => {
        if (formData[field]) {
          // Asegurar que sean números positivos, pero enviados como strings
          let value = parseFloat(formData[field]);
          formData[field] = isNaN(value) ? "" : String(Math.abs(value));
        } else {
          // Si está vacío, enviar string vacío
          formData[field] = "";
        }
      });
      
      // Asegurar que los IDs sean números
      ['id_propietario', 'id_propiedad', 'id_inquilino'].forEach(field => {
        if (formData[field]) {
          formData[field] = parseInt(formData[field], 10);
        }
      });
      
      // Asegurar que los valores de texto vacíos sean strings vacíos en lugar de null o undefined
      const textFields = ['aguaEmpresa', 'gasEmpresa', 'luzEmpresa', 'municipalEmpresa', 'nombreUsuario'];
      textFields.forEach(field => {
        formData[field] = formData[field] || '';
      });
      
      // Asegurar que garantesIds sea un array válido
      if (!formData.garantesIds || !Array.isArray(formData.garantesIds) || formData.garantesIds.length === 0) {
        // Si no hay garantesIds, establecer un array vacío
        formData.garantesIds = [];
      } else {
        // Asegurar que todos los elementos sean números
        formData.garantesIds = formData.garantesIds.map(id => parseInt(id, 10));
      }
      
      console.log("Datos sanitizados antes de enviar:", formData);
      
      // Crear contrato
      const response = await contratoApi.crearContrato(formData);
      
      if (response && (response.id || response.status === 201)) {
        Swal.fire({
          icon: 'success',
          title: 'Contrato creado',
          text: 'El contrato ha sido creado exitosamente'
        }).then(() => {
          navigate('/contratos');
        });
      } else {
        throw new Error('Error al crear el contrato: Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      let errorMessage = 'Ocurrió un error al crear el contrato';
      
      // Mostrar detalles específicos del error si están disponibles
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    }
  };

  // Filtered data
  const filteredPropietarios = propietarios.filter(p => 
    p.nombre.toLowerCase().includes(search.propietario.toLowerCase()) ||
    p.apellido.toLowerCase().includes(search.propietario.toLowerCase()) ||
    p.email.toLowerCase().includes(search.propietario.toLowerCase())
  );

  const filteredInquilinos = inquilinos.filter(i => 
    i.nombre.toLowerCase().includes(search.inquilino.toLowerCase()) ||
    i.apellido.toLowerCase().includes(search.inquilino.toLowerCase()) ||
    i.email.toLowerCase().includes(search.inquilino.toLowerCase())
  );

  const filteredPropiedades = propiedades.filter(p => 
    p.direccion.toLowerCase().includes(search.propiedad.toLowerCase()) ||
    p.tipo.toLowerCase().includes(search.propiedad.toLowerCase()) ||
    p.barrio.toLowerCase().includes(search.propiedad.toLowerCase())
  );

  const filteredGarantes = garantes.filter(g => 
    g.nombre.toLowerCase().includes(search.garante.toLowerCase()) ||
    g.apellido.toLowerCase().includes(search.garante.toLowerCase()) ||
    g.email.toLowerCase().includes(search.garante.toLowerCase())
  );

  // Paginación
  const paginatedPropietarios = filteredPropietarios.slice(pagination.propietarios * ITEMS_PER_PAGE, (pagination.propietarios + 1) * ITEMS_PER_PAGE);
  const paginatedInquilinos = filteredInquilinos.slice(pagination.inquilinos * ITEMS_PER_PAGE, (pagination.inquilinos + 1) * ITEMS_PER_PAGE);
  const paginatedPropiedades = filteredPropiedades.slice(pagination.propiedades * ITEMS_PER_PAGE, (pagination.propiedades + 1) * ITEMS_PER_PAGE);
  const paginatedGarantes = filteredGarantes.slice(pagination.garantes * ITEMS_PER_PAGE, (pagination.garantes + 1) * ITEMS_PER_PAGE);

  // Destino options
  const destinos = [
    { value: 'Habitacional como vivienda unica', label: 'Habitacional' },
    { value: 'Comercial', label: 'Comercial' }
  ];

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f5f5'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        pb: 2
      }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2, color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          Crear Nuevo Contrato
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{ 
          mb: 4,
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            
          },
          '& .MuiStepIcon-root': {
            color: theme.palette.mode === 'dark' ? "#2E2C97" : '#2E2C97',
            '&.Mui-active': {
              color: theme.palette.mode === 'dark' ? "#C22961" : '#C22961',
            },
            '&.Mui-completed': {
              color: theme.palette.success.main,
              
            }
          }
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white'
        }}
      >
        {activeStep === steps.length ? (
          // Final step - show summary and submit button
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Todos los pasos completados
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              El contrato está listo para ser creado. Revise la información antes de continuar.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Resumen del Contrato
              </Typography>
              
              <Grid2 sx={{ gap: 2 }}>
                <Grid2 item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Nombre del Contrato:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.nombreContrato}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Propietario:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedPropietario?.nombre} {selectedPropietario?.apellido}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Inquilino:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedInquilino?.nombre} {selectedInquilino?.apellido}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Propiedad:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{selectedPropiedad?.direccion}</Typography>
                </Grid2>
                
                <Grid2 item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Monto de Alquiler:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>${contratoForm.montoAlquiler}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Duración:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.duracion} meses</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Fecha Inicio:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.fecha_inicio}</Typography>
                  
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Fecha Fin:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{contratoForm.fecha_fin}</Typography>
                </Grid2>
              </Grid2>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <Button onClick={handleReset} sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}>
                Comenzar de Nuevo
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                  color: theme.palette.mode === 'dark' ? 'white' : 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                  }
                }}
              >
                Crear Contrato
              </Button>
            </Box>
          </Box>
        ) : (
          // Steps 0-4
          <Box>
            {activeStep === 0 && (
              // Step 1: Select Propietario
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 1: Seleccionar Propietario</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1
                  }}>
                    <SearchIcon sx={{ 
                      mx: 1.5, 
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                    }} />
                    <TextField
                      fullWidth
                      placeholder="Buscar propietario..."
                      variant="standard"
                      value={search.propietario}
                      onChange={(e) => setSearch({ ...search, propietario: e.target.value })}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenPropietarioDialog(true)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                        },
                        borderRadius: '8px'
                      }}
                    >
                      Nuevo Propietario
                    </Button>
                  </Box>
                  
                  {loading.propietarios ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                    </Box>
                  ) : error.propietarios ? (
                    <Box sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#c62828', 
                      p: 2, 
                      borderRadius: 2,
                      textAlign: 'center' 
                    }}>
                      <Typography>Error: {error.propietarios}</Typography>
                    </Box>
                  ) : paginatedPropietarios.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1">No se encontraron propietarios</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      },
                      gap: 2
                    }}>
                      {paginatedPropietarios.map((propietario) => (
                        <Card 
                          key={propietario.id}
                          elevation={selectedPropietario?.id === propietario.id ? 3 : 1}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderLeft: selectedPropietario?.id === propietario.id ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e') : 'none',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            bgcolor: selectedPropietario?.id === propietario.id ? '#e8eaf6' : 'white'
                          }}
                          onClick={() => handleSelectPropietario(propietario)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" color="#1F2C61" sx={{ fontWeight: 600 }}>
                              {propietario.nombre} {propietario.apellido}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Email: {propietario.email}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Teléfono: {propietario.telefono || 'No disponible'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.propietarios === 0}
                    onClick={() => handlePrevPage('propietarios')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.propietarios + 1} / {Math.ceil(filteredPropietarios.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredPropietarios.length <= (pagination.propietarios + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('propietarios')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              // Step 2: Select Inquilino
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 2: Seleccionar Inquilino</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1
                  }}>
                    <SearchIcon sx={{ 
                      mx: 1.5, 
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                    }} />
                    <TextField
                      fullWidth
                      placeholder="Buscar inquilino..."
                      variant="standard"
                      value={search.inquilino}
                      onChange={(e) => setSearch({ ...search, inquilino: e.target.value })}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenInquilinoDialog(true)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                        },
                        borderRadius: '8px'
                      }}
                    >
                      Nuevo Inquilino
                    </Button>
                  </Box>
                  
                  {loading.inquilinos ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                    </Box>
                  ) : error.inquilinos ? (
                    <Box sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#c62828', 
                      p: 2, 
                      borderRadius: 2,
                      textAlign: 'center' 
                    }}>
                      <Typography>Error: {error.inquilinos}</Typography>
                    </Box>
                  ) : paginatedInquilinos.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1">No se encontraron inquilinos</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      },
                      gap: 2
                    }}>
                      {paginatedInquilinos.map((inquilino) => (
                        <Card 
                          key={inquilino.id}
                          elevation={selectedInquilino?.id === inquilino.id ? 3 : 1}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderLeft: selectedInquilino?.id === inquilino.id ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e') : 'none',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            bgcolor: selectedInquilino?.id === inquilino.id ? '#e8eaf6' : 'white'
                          }}
                          onClick={() => handleSelectInquilino(inquilino)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" color="#1F2C61" sx={{ fontWeight: 600 }}>
                              {inquilino.nombre} {inquilino.apellido}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Email: {inquilino.email}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Teléfono: {inquilino.telefono || 'No disponible'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.inquilinos === 0}
                    onClick={() => handlePrevPage('inquilinos')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.inquilinos + 1} / {Math.ceil(filteredInquilinos.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredInquilinos.length <= (pagination.inquilinos + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('inquilinos')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              // Step 3: Select Property
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 3: Seleccionar Propiedad</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1
                  }}>
                    <SearchIcon sx={{ 
                      mx: 1.5, 
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                    }} />
                    <TextField
                      fullWidth
                      placeholder="Buscar propiedad..."
                      variant="standard"
                      value={search.propiedad}
                      onChange={(e) => setSearch({ ...search, propiedad: e.target.value })}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenPropiedadDialog(true)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                        },
                        borderRadius: '8px'
                      }}
                    >
                      Nueva Propiedad
                    </Button>
                  </Box>
                  
                  {loading.propiedades ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                    </Box>
                  ) : error.propiedades ? (
                    <Box sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#c62828', 
                      p: 2, 
                      borderRadius: 2,
                      textAlign: 'center' 
                    }}>
                      <Typography>Error: {error.propiedades}</Typography>
                    </Box>
                  ) : paginatedPropiedades.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1">No se encontraron propiedades</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      },
                      gap: 2
                    }}>
                      {paginatedPropiedades.map((propiedad) => (
                        <Card 
                          key={propiedad.id}
                          elevation={selectedPropiedad?.id === propiedad.id ? 3 : 1}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderLeft: selectedPropiedad?.id === propiedad.id ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e') : 'none',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            },
                            bgcolor: selectedPropiedad?.id === propiedad.id ? '#e8eaf6' : 'white'
                          }}
                          onClick={() => handleSelectPropiedad(propiedad)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1"color="#1F2C61" sx={{ fontWeight: 600 }}>
                              {propiedad.direccion}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Tipo: {propiedad.tipo || 'No especificado'}
                            </Typography>
                            <Typography variant="body2" color="black">
                              Barrio: {propiedad.barrio || 'No especificado'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.propiedades === 0}
                    onClick={() => handlePrevPage('propiedades')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.propiedades + 1} / {Math.ceil(filteredPropiedades.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredPropiedades.length <= (pagination.propiedades + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('propiedades')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {activeStep === 3 && (
              // Step 4: Select Garantes
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Paso 4: Seleccionar Garantes</Typography>
                
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                  Seleccione uno o más garantes para el contrato.
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                    borderRadius: 2,
                    p: 1,
                    boxShadow: 1
                  }}>
                    <SearchIcon sx={{ 
                      mx: 1.5, 
                      color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit' 
                    }} />
                    <TextField
                      fullWidth
                      placeholder="Buscar garante..."
                      variant="standard"
                      value={search.garante}
                      onChange={(e) => setSearch({ ...search, garante: e.target.value })}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{ 
                        '& .MuiInputBase-input': {
                          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenGaranteDialog(true)}
                      sx={{
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
                        },
                        borderRadius: '8px'
                      }}
                    >
                      Nuevo Garante
                    </Button>
                  </Box>
                  
                  {loading.garantes ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e' }} />
                    </Box>
                  ) : error.garantes ? (
                    <Box sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#c62828', 
                      p: 2, 
                      borderRadius: 2,
                      textAlign: 'center' 
                    }}>
                      <Typography>Error: {error.garantes}</Typography>
                    </Box>
                  ) : paginatedGarantes.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      <Typography variant="body1">No se encontraron garantes</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)' 
                      },
                      gap: 2
                    }}>
                      {paginatedGarantes.map((garante) => {
                        const isSelected = selectedGarantes.some(g => g.id === garante.id);
                        
                        return (
                          <Card 
                            key={garante.id}
                            elevation={isSelected ? 3 : 1}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              borderLeft: isSelected ? '4px solid ' + (theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e') : 'none',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                              },
                              bgcolor: isSelected ? '#e8eaf6' : 'white'
                            }}
                            onClick={() => handleSelectGarante(garante)}
                          >
                            <CardContent>
                              <Typography variant="subtitle1" color="#1F2C61" sx={{ fontWeight: 600 }}>
                                {garante.nombre} {garante.apellido}
                              </Typography>
                              <Typography variant="body2" color="black">
                                Email: {garante.email}
                              </Typography>
                              <Typography variant="body2" color="black">
                                Teléfono: {garante.telefono || 'No disponible'}
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <IconButton
                    disabled={pagination.garantes === 0}
                    onClick={() => handlePrevPage('garantes')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <Typography sx={{ 
                    mx: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                  }}>
                    {pagination.garantes + 1} / {Math.ceil(filteredGarantes.length / ITEMS_PER_PAGE) || 1}
                  </Typography>
                  <IconButton
                    disabled={filteredGarantes.length <= (pagination.garantes + 1) * ITEMS_PER_PAGE}
                    onClick={() => handleNextPage('garantes')}
                    sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit' }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
                
                {selectedGarantes.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Garantes Seleccionados ({selectedGarantes.length})
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 2
                    }}>
                      {selectedGarantes.map(garante => (
                        <Chip
                          key={garante.id}
                          label={`${garante.nombre} ${garante.apellido}`}
                          onDelete={() => handleSelectGarante(garante)}
                          sx={{
                            bgcolor: '#1F2C61',
                            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white',
                            borderRadius: '16px',
                            '& .MuiChip-deleteIcon': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white',
                              '&:hover': {
                                color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#0d47a1'
                              }
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {activeStep === 4 && (
              // Step 5: Contract Details
              <Box>
                <Typography variant="h6" sx={{ mb: 3 }}>Paso 5: Detalles del Contrato</Typography>
                
                <Grid2 sx={{ gap: 3 }}>
                  <Grid2 item xs={12} sm={6}>
                    <TextField
                      label="Nombre del Contrato"
                      name="nombreContrato"
                      value={contratoForm.nombreContrato}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      label="Monto de Alquiler"
                      name="montoAlquiler"
                      type="number"
                      value={contratoForm.montoAlquiler}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                    
                    <TextField
                      label="Monto de Alquiler en Letras"
                      name="montoAlquilerLetras"
                      value={contratoForm.montoAlquilerLetras}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      label="Duración (en meses)"
                      name="duracion"
                      type="number"
                      value={contratoForm.duracion}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      label="Multa por Día"
                      name="multaXDia"
                      value={contratoForm.multaXDia}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      label="Actualización (%)"
                      name="actualizacion"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      onChange={handleFormChange}
                      value={contratoForm.actualizacion}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                  </Grid2>
                  
                  <Grid2 item xs={12} sm={6}>
                    <TextField
                      label="Fecha de Inicio"
                      name="fecha_inicio"
                      type="date"
                      value={contratoForm.fecha_inicio}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    
                    <TextField
                      label="Fecha de Fin"
                      name="fecha_fin"
                      type="date"
                      value={contratoForm.fecha_fin}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                    
                    <TextField
                      label="Índice de Ajuste"
                      name="indiceAjuste"
                      value={contratoForm.indiceAjuste}
                      onChange={handleFormChange}
                      fullWidth
                      required
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="destino-label">Destino</InputLabel>
                      <Select
                        labelId="destino-label"
                        name="destino"
                        value={contratoForm.destino}
                        onChange={handleFormChange}
                        fullWidth
                        required
                        label="Destino"
                      >
                        {destinos.map((destino) => (
                          <MenuItem key={destino.value} value={destino.value}>
                            {destino.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Servicios
                    </Typography>
                    
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f8fafc',
                        borderRadius: '8px',
                        mb: 2
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
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f0f7ff',
                          }
                        }}
                      >
                        <OpacityIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#2196f3', mr: 2 }} />
                        <TextField
                          name="aguaEmpresa"
                          label="Empresa de Agua"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.aguaEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
                        />
                        <TextField
                          name="aguaPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.aguaPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
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
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff7f0',
                          }
                        }}
                      >
                        <LocalFireDepartmentIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#ff9800', mr: 2 }} />
                        <TextField
                          name="gasEmpresa"
                          label="Empresa de Gas"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.gasEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
                        />
                        <TextField
                          name="gasPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.gasPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
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
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f9fce8',
                          }
                        }}
                      >
                        <BoltIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#ffc107', mr: 2 }} />
                        <TextField
                          name="luzEmpresa"
                          label="Empresa de Luz"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.luzEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
                        />
                        <TextField
                          name="luzPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.luzPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
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
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f0f5f0',
                          }
                        }}
                      >
                        <AccountBalanceIcon sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#4caf50', mr: 2 }} />
                        <TextField
                          name="municipalEmpresa"
                          label="Empresa Municipal"
                          fullWidth
                          margin="dense"
                          onChange={handleFormChange}
                          value={contratoForm.municipalEmpresa || ''}
                          sx={{ 
                            mr: 2,
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
                        />
                        <TextField
                          name="municipalPorcentaje"
                          label="Porcentaje (%)"
                          type="number"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          onChange={handleFormChange}
                          value={contratoForm.municipalPorcentaje || ''}
                          sx={{ 
                            width: '150px',
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'inherit'
                            },
                            '& .MuiInputLabel-root': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : 'inherit'
                            },
                            '& .MuiOutlinedInput-input': {
                              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit'
                            }
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid2>
                </Grid2>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Step navigation buttons */}
      {activeStep !== steps.length && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 , marginBottom: 6}}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit', mr: 1 }}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#1a237e',
              color: theme.palette.mode === 'dark' ? 'white' : 'white',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : '#0d1652',
              }
            }}
          >
            {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Box>
      )}

      {/* Dialog Modals */}
      <Dialog
        open={openPropietarioDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClosePropietarioDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nuevo Propietario</DialogTitle>
        <DialogContent dividers>
          <PropietarioForm onSuccess={handleClosePropietarioDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={openInquilinoDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseInquilinoDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nuevo Inquilino</DialogTitle>
        <DialogContent dividers>
          <InquilinoForm onSuccess={handleCloseInquilinoDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={openPropiedadDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClosePropiedadDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nueva Propiedad</DialogTitle>
        <DialogContent dividers>
          <PropiedadesForm onSuccess={handleClosePropiedadDialog} />
        </DialogContent>
      </Dialog>
      
      <Dialog
        open={openGaranteDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseGaranteDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Crear Nuevo Garante</DialogTitle>
        <DialogContent dividers>
          <GaranteForm onSuccess={handleCloseGaranteDialog} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CrearContratoPage;
