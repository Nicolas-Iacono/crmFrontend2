import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  Autocomplete,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import BedIcon from '@mui/icons-material/Bed';
import GarageIcon from '@mui/icons-material/Garage';
import YardIcon from '@mui/icons-material/Yard';
import GrassIcon from '@mui/icons-material/Grass';
import PoolIcon from '@mui/icons-material/Pool';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlaceIcon from '@mui/icons-material/Place';
import HomeIcon from '@mui/icons-material/Home';
import { showWarning } from '../alertas/showAlert';

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
  'OTROS',
];

const ProspectoForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  title,
  submitLabel,
  theme,
}) => {
  const [formData, setFormData] = useState({
    ...initialValues,
    zonaPreferencia: initialValues.zonaPreferencia || [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      ...initialValues,
      zonaPreferencia: initialValues.zonaPreferencia || [],
    });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleZonaChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      zonaPreferencia: newValue,
    }));
    
    if (errors.zonaPreferencia) {
      setErrors((prev) => ({
        ...prev,
        zonaPreferencia: '',
      }));
    }
  };

  const handleDeleteZona = (zonaToDelete) => {
    setFormData((prev) => ({
      ...prev,
      zonaPreferencia: prev.zonaPreferencia.filter((zona) => zona !== zonaToDelete),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    if (formData.cantidadPersonas && Number(formData.cantidadPersonas) <= 0) {
      newErrors.cantidadPersonas = 'La cantidad de personas debe ser mayor a 0';
    }
    if (formData.cantidadAmbientes && Number(formData.cantidadAmbientes) <= 0) {
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

    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      telefono: formData.telefono.trim() || null,
      email: formData.email.trim() || null,
      rangoPrecioMin: formData.rangoPrecioMin ? parseFloat(formData.rangoPrecioMin) : null,
      rangoPrecioMax: formData.rangoPrecioMax ? parseFloat(formData.rangoPrecioMax) : null,
      cantidadPersonas: formData.cantidadPersonas ? parseInt(formData.cantidadPersonas, 10) : null,
      zonaPreferencia: formData.zonaPreferencia && formData.zonaPreferencia.length > 0 ? formData.zonaPreferencia : [],
      cantidadAmbientes: formData.cantidadAmbientes ? parseInt(formData.cantidadAmbientes, 10) : null,
      cochera: Boolean(formData.cochera),
      patio: Boolean(formData.patio),
      jardin: Boolean(formData.jardin),
      pileta: Boolean(formData.pileta),
      visibilidadPublico: Boolean(formData.visibilidadPublico),
    };

    await onSubmit(payload);
  };

  const isDark = theme.palette.mode === 'dark';

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
      '&.Mui-focused': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#fff' },
    },
  };

  const sectionTitle = (icon, text) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: 1.5,
        bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 18, color: '#8b5cf6' } })}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {text}
      </Typography>
    </Box>
  );

  const switchCard = (checked, name, icon, label) => (
    <Paper
      elevation={0}
      sx={{
        p: 2, borderRadius: 2.5,
        border: `1px solid ${checked
          ? (isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)')
          : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
        }`,
        bgcolor: checked
          ? (isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.05)')
          : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={handleChange}
            name={name}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' },
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {React.cloneElement(icon, { sx: { fontSize: 20, color: checked ? '#8b5cf6' : 'text.secondary' } })}
            <Typography variant="body2" sx={{ fontWeight: checked ? 600 : 400 }}>
              {label}
            </Typography>
          </Box>
        }
      />
    </Paper>
  );

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: { xs: 2, sm: 3, md: 2 },
        pb: { xs: 14, sm: 12 },
        pl: { xs: 2, sm: 3, md: '2rem' },
        pr: { xs: 2, sm: 4, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ mt: { xs: '4rem', sm: 0 }, maxWidth: '100%', pl: { xs: 0, sm: 6, md: '16rem' }, pr: { xs: 0, sm: 1, md: 3 } }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          gap: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={onCancel}
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                <PeopleAltIcon sx={{ color: isDark ? '#a78bfa' : '#7c3aed', fontSize: { xs: 20, sm: 24 } }} />
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Completa los datos del prospecto
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Section: Info Básica */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              mb: 2.5,
            }}
          >
            {sectionTitle(<PersonIcon />, 'Información Personal')}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Nombre *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Apellido *"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  error={!!errors.apellido}
                  helperText={errors.apellido}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Cantidad de Personas"
                  name="cantidadPersonas"
                  type="number"
                  value={formData.cantidadPersonas}
                  onChange={handleChange}
                  error={!!errors.cantidadPersonas}
                  helperText={errors.cantidadPersonas}
                  inputProps={{ min: 1 }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Cantidad de Ambientes"
                  name="cantidadAmbientes"
                  type="number"
                  value={formData.cantidadAmbientes}
                  onChange={handleChange}
                  error={!!errors.cantidadAmbientes}
                  helperText={errors.cantidadAmbientes}
                  inputProps={{ min: 1 }}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section: Ubicación y Precio */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              mb: 2.5,
            }}
          >
            {sectionTitle(<PlaceIcon />, 'Ubicación y Presupuesto')}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={zonas}
                  value={formData.zonaPreferencia}
                  onChange={handleZonaChange}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        onDelete={() => handleDeleteZona(option)}
                        size="small"
                        sx={{
                          margin: '2px',
                          bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                          color: isDark ? '#a78bfa' : '#7c3aed',
                          '& .MuiChip-deleteIcon': { color: isDark ? '#a78bfa' : '#7c3aed' },
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      variant="outlined"
                      label="Zonas de preferencia"
                      placeholder="Ej: CENTRO, NORTE..."
                      helperText={errors.zonaPreferencia || "Selecciona o escribe zonas personalizadas"}
                      error={!!errors.zonaPreferencia}
                      sx={inputSx}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Precio Mínimo"
                  name="rangoPrecioMin"
                  type="number"
                  value={formData.rangoPrecioMin}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 1000 }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth size="small"
                  label="Precio Máximo"
                  name="rangoPrecioMax"
                  type="number"
                  value={formData.rangoPrecioMax}
                  onChange={handleChange}
                  error={!!errors.rangoPrecioMax}
                  helperText={errors.rangoPrecioMax}
                  inputProps={{ min: 0, step: 1000 }}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section: Características */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              mb: 2.5,
            }}
          >
            {sectionTitle(<HomeIcon />, 'Características Deseadas')}
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={6}>
                {switchCard(formData.cochera, 'cochera', <GarageIcon />, 'Cochera')}
              </Grid>
              <Grid item xs={6} sm={6}>
                {switchCard(formData.patio, 'patio', <YardIcon />, 'Patio')}
              </Grid>
              <Grid item xs={6} sm={6}>
                {switchCard(formData.jardin, 'jardin', <GrassIcon />, 'Jardín')}
              </Grid>
              <Grid item xs={6} sm={6}>
                {switchCard(formData.pileta, 'pileta', <PoolIcon />, 'Pileta')}
              </Grid>
            </Grid>
          </Paper>

          {/* Section: Visibilidad */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              mb: 3,
            }}
          >
            {sectionTitle(formData.visibilidadPublico ? <VisibilityIcon /> : <VisibilityOffIcon />, 'Visibilidad')}
            <Paper
              elevation={0}
              sx={{
                p: 2, borderRadius: 2.5,
                border: `1px solid ${formData.visibilidadPublico
                  ? (isDark ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)')
                  : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
                }`,
                bgcolor: formData.visibilidadPublico
                  ? (isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)')
                  : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.visibilidadPublico}
                    onChange={handleChange}
                    name="visibilidadPublico"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#22c55e' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#22c55e' },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formData.visibilidadPublico
                      ? <VisibilityIcon sx={{ fontSize: 20, color: '#22c55e' }} />
                      : <VisibilityOffIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    }
                    <Typography variant="body2" sx={{ fontWeight: formData.visibilidadPublico ? 600 : 400 }}>
                      {formData.visibilidadPublico ? 'Visible públicamente' : 'Solo visible para mí'}
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
              sx={{
                flex: { xs: 1, sm: 'none' },
                minWidth: { sm: 120 },
                borderRadius: 2.5,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                color: 'text.primary',
                '&:hover': { borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' },
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              sx={{
                flex: { xs: 1, sm: 'none' },
                minWidth: { sm: 160 },
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
                },
              }}
            >
              {isSubmitting ? 'Guardando...' : submitLabel}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ProspectoForm;
