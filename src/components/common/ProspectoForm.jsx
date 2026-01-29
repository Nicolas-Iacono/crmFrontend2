import React, { useEffect, useState } from 'react';
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
  Paper,
  Divider,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
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
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialValues);
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
      zonaPreferencia: formData.zonaPreferencia.trim() || null,
      cantidadAmbientes: formData.cantidadAmbientes ? parseInt(formData.cantidadAmbientes, 10) : null,
      cochera: Boolean(formData.cochera),
      patio: Boolean(formData.patio),
      jardin: Boolean(formData.jardin),
      pileta: Boolean(formData.pileta),
      visibilidadPublico: Boolean(formData.visibilidadPublico),
    };

    await onSubmit(payload);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: { xs: 2, sm: 3 },
        pb: { xs: 8, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          maxWidth: { xs: '100%', md: '800px' },
          mx: 'auto',
          borderRadius: { xs: 2, md: 3 },
          boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <IconButton
              onClick={onCancel}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Información Básica
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido *"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  error={!!errors.apellido}
                  helperText={errors.apellido}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cantidad de Personas"
                  name="cantidadPersonas"
                  type="number"
                  value={formData.cantidadPersonas}
                  onChange={handleChange}
                  error={!!errors.cantidadPersonas}
                  helperText={errors.cantidadPersonas}
                  InputProps={{
                    startAdornment: <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cantidad de Ambientes"
                  name="cantidadAmbientes"
                  type="number"
                  value={formData.cantidadAmbientes}
                  onChange={handleChange}
                  error={!!errors.cantidadAmbientes}
                  helperText={errors.cantidadAmbientes}
                  InputProps={{
                    startAdornment: <BedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  inputProps={{ min: 1 }}
                />
              </Grid>

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
                    {zonas.map((zona) => (
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
                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                  Características Deseadas
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={formData.cochera} onChange={handleChange} name="cochera" color="primary" />}
                    label={(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GarageIcon />
                        <Typography>Cochera</Typography>
                      </Box>
                    )}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={formData.patio} onChange={handleChange} name="patio" color="primary" />}
                    label={(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <YardIcon />
                        <Typography>Patio</Typography>
                      </Box>
                    )}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={formData.jardin} onChange={handleChange} name="jardin" color="primary" />}
                    label={(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GrassIcon />
                        <Typography>Jardín</Typography>
                      </Box>
                    )}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={formData.pileta} onChange={handleChange} name="pileta" color="primary" />}
                    label={(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PoolIcon />
                        <Typography>Pileta</Typography>
                      </Box>
                    )}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: 'primary.main' }}>
                  Visibilidad
                </Typography>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={formData.visibilidadPublico} onChange={handleChange} name="visibilidadPublico" color="primary" />}
                    label={(
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {formData.visibilidadPublico ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        <Typography>{formData.visibilidadPublico ? 'Visible públicamente' : 'Solo visible para mí'}</Typography>
                      </Box>
                    )}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', sm: 'flex-end' }, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { sm: '120px' } }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { sm: '120px' } }}
                  >
                    {isSubmitting ? 'Guardando...' : submitLabel}
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

export default ProspectoForm;
