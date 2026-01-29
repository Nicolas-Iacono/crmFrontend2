import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NoteIcon from '@mui/icons-material/Note';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import BedIcon from '@mui/icons-material/Bed';
import GarageIcon from '@mui/icons-material/Garage';
import YardIcon from '@mui/icons-material/Yard';
import GrassIcon from '@mui/icons-material/Grass';
import PoolIcon from '@mui/icons-material/Pool';
import http from '../../api/http';
import { showSuccess, showError, showWarning } from '../../alertas/showAlert';

const NuevoProspecto = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nombreUsuario: '',
    rangoPrecioMin: '',
    rangoPrecioMax: '',
    cantidadPersonas: '',
    zonaPreferencia: '',
    cantidadAmbientes: '',
    cochera: false,
    patio: false,
    jardin: false,
    pileta: false
  });

  const zonas = [
    'CENTRO',
    'NORTE',
    'SUR',
    'ESTE',
    'OESTE',
    'ZONA INDUSTRIAL',
    'ZONA RESIDENCIAL',
    'COUNTRY',
    'BARRIO CERRADO',
    'OTROS'
  ];

  useEffect(() => {
    // Puedes cargar datos iniciales aquí si es necesario
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombreUsuario.trim()) {
      newErrors.nombreUsuario = 'El nombre de usuario es requerido';
    }
    
    if (!formData.cantidadPersonas || formData.cantidadPersonas <= 0) {
      newErrors.cantidadPersonas = 'La cantidad de personas debe ser mayor a 0';
    }
    
    if (!formData.cantidadAmbientes || formData.cantidadAmbientes <= 0) {
      newErrors.cantidadAmbientes = 'La cantidad de ambientes debe ser mayor a 0';
    }
    
    if (formData.rangoPrecioMin && formData.rangoPrecioMax) {
      const min = parseFloat(formData.rangoPrecioMin);
      const max = parseFloat(formData.rangoPrecioMax);
      if (min >= max) {
        newErrors.rangoPrecioMax = 'El precio máximo debe ser mayor al precio mínimo';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showWarning('Por favor, complete los campos requeridos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const prospectoData = {
        nombreUsuario: formData.nombreUsuario.trim(),
        rangoPrecioMin: formData.rangoPrecioMin ? parseFloat(formData.rangoPrecioMin) : null,
        rangoPrecioMax: formData.rangoPrecioMax ? parseFloat(formData.rangoPrecioMax) : null,
        cantidadPersonas: parseInt(formData.cantidadPersonas),
        zonaPreferencia: formData.zonaPreferencia.trim(),
        cantidadAmbientes: parseInt(formData.cantidadAmbientes),
        cochera: formData.cochera,
        patio: formData.patio,
        jardin: formData.jardin,
        pileta: formData.pileta
      };
      
      await http.post(`${import.meta.env.VITE_API_URL}/prospectos`, prospectoData);
      
      showSuccess('Prospecto creado exitosamente', '¡Éxito!');
      navigate('/prospectos');
      
    } catch (error) {
      console.error('Error al crear prospecto:', error);
      const errorMessage = error.response?.data?.message || 'No se pudo crear el prospecto';
      showError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/prospectos');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: { xs: 2, sm: 3 },
      pb: { xs: 8, sm: 4 },
      px: { xs: 2, sm: 3 }
    }}>
      <Card sx={{ 
        maxWidth: { xs: '100%', md: '800px' },
        mx: 'auto',
        borderRadius: { xs: 2, md: 3 },
        boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            gap: 2
          }}>
            <IconButton 
              onClick={handleCancel}
              sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Nuevo Prospecto
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Información Básica */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Información Básica
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de Usuario *"
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  error={!!errors.nombreUsuario}
                  helperText={errors.nombreUsuario}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cantidad de Personas *"
                  name="cantidadPersonas"
                  type="number"
                  value={formData.cantidadPersonas}
                  onChange={handleChange}
                  error={!!errors.cantidadPersonas}
                  helperText={errors.cantidadPersonas}
                  InputProps={{
                    startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cantidad de Ambientes *"
                  name="cantidadAmbientes"
                  type="number"
                  value={formData.cantidadAmbientes}
                  onChange={handleChange}
                  error={!!errors.cantidadAmbientes}
                  helperText={errors.cantidadAmbientes}
                  InputProps={{
                    startAdornment: <BedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Preferencias de Ubicación y Precio */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                  Preferencias de Ubicación y Precio
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Zona de Preferencia</InputLabel>
                  <Select
                    name="zonaPreferencia"
                    value={formData.zonaPreferencia}
                    onChange={handleChange}
                    label="Zona de Preferencia"
                  >
                    {zonas.map(zona => (
                      <MenuItem key={zona} value={zona}>
                        {zona}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio Mínimo"
                  name="rangoPrecioMin"
                  type="number"
                  value={formData.rangoPrecioMin}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Precio Máximo"
                  name="rangoPrecioMax"
                  type="number"
                  value={formData.rangoPrecioMax}
                  onChange={handleChange}
                  error={!!errors.rangoPrecioMax}
                  helperText={errors.rangoPrecioMax}
                  InputProps={{
                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Grid>

              {/* Características Deseadas */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                  Características Deseadas
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.cochera}
                        onChange={handleChange}
                        name="cochera"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GarageIcon />
                        <Typography>Cochera</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.patio}
                        onChange={handleChange}
                        name="patio"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <YardIcon />
                        <Typography>Patio</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.jardin}
                        onChange={handleChange}
                        name="jardin"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GrassIcon />
                        <Typography>Jardín</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.pileta}
                        onChange={handleChange}
                        name="pileta"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PoolIcon />
                        <Typography>Pileta</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </Grid>

              {/* Botones */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: { xs: 'stretch', sm: 'flex-end' },
                  mt: 3
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isLoading}
                    sx={{ 
                      flex: { xs: 1, sm: 'none' },
                      minWidth: { sm: '120px' }
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{ 
                      flex: { xs: 1, sm: 'none' },
                      minWidth: { sm: '120px' }
                    }}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Prospecto'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NuevoProspecto;
