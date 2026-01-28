import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const NuevoContratoForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contratoId = searchParams.get('contratoId');
  const [loading, setLoading] = useState(false);
  const [loadingContract, setLoadingContract] = useState(false);
  const [error, setError] = useState('');
  const [garantes, setGarantes] = useState([]);
  const [garantesDelContrato, setGarantesDelContrato] = useState([]);
  const [isRenewal, setIsRenewal] = useState(false);
  const [existingContract, setExistingContract] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    idContrato:contratoId,
    nuevaFechaInicio: null,
    nuevaFechaFin: null,
    duracion: '',
    montoAlquiler: '',
    actualizacion: '',
    montoAlquilerLetras: '',
    tipoGarantia: '',
    garantesIds: []
  });

  // Opciones para selects
  const tiposGarantia = [
    'Propiedad inmueble',
    'Aval bancario',
    'Seguro de caución',
    'Recibos de sueldo',
    'Otro'
  ];

  const indicesAjuste = [
    'IPC',
    'ICL',
    'CVS',
    'IS',
    'Otros'
  ];

  const empresasServicios = [
    'AySA',
    'Edesur',
    'Edenor',
    'Metrogas',
    'Gas Natural Fenosa',
    'Aguas Argentinas',
    'Otra'
  ];

  // Cargar garantes

  // Función para cargar todos los garantes disponibles
  const fetchGarantes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/garante/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      // soporta array directo o {data: []}
      const lista = Array.isArray(data) ? data : (data.data ?? []);
      setGarantes(lista);
    } catch (e) {
      console.error('Error al cargar garantes:', e);
      setGarantes([]);
    }
  };

  // Cargar garantes
  useEffect(() => {
    fetchGarantes();
  }, [contratoId]);

  // Cargar datos del contrato existente si es una renovación
  useEffect(() => {
    if (contratoId) {
      setIsRenewal(true);
      fetchExistingContract(contratoId);
    }
  }, [contratoId]);

  // Función para cargar datos del contrato existente
  const fetchExistingContract = async (id) => {
    setLoadingContract(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contrato/buscar/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.message.includes('encontrado') && result.data) {
          const contract = result.data;
          setExistingContract(contract);
          
          // Manejar garantes del contrato
          let garantesIds = [];
          let garantesContrato = [];
          
          if (contract.garantes && contract.garantes.length > 0) {
            // Cargar detalles de cada garante individualmente
            garantesContrato = await Promise.all(
              contract.garantes.map(async (garante) => {
                try {
                  const garanteResponse = await fetch(`${import.meta.env.VITE_API_URL}/garante/buscar/${garante.id}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  if (garanteResponse.ok) {
                    const garanteData = await garanteResponse.json();
                    return garanteData.data || garante;
                  }
                  return garante;
                } catch (error) {
                  console.error(`Error al cargar garante ${garante.id}:`, error);
                  return garante;
                }
              })
            );
            
           garantesIds = garantesContrato.map(g => Number(g.id));

            setGarantesDelContrato(garantesContrato);
          } else {
            // Contrato sin garantes
            setGarantesDelContrato([]);
          }
          
          // Precargar el formulario con los datos del contrato existente
          setFormData({
            nuevaFechaFin: null, // Se debe definir nueva fecha de inicio
            nuevaFechaInicio: null,     // Se debe definir nueva fecha de fin
            duracion: contract.duracion?.toString() || '',
            montoAlquiler: contract.montoAlquiler?.toString() || '',
            actualizacion: contract.actualizacion?.toString() || '',
            indiceAjuste: contract.indiceAjuste || '',
            montoAlquilerLetras: contract.montoAlquilerLetras || '',
            multaXDia: contract.multaXDia?.toString() || '',
            tipoGarantia: contract.tipoGarantia || '',
            garantesIds: garantesIds,
           
          });
        }
      } else {
        setError('No se pudo cargar el contrato existente');
      }
    } catch (error) {
      console.error('Error al cargar contrato:', error);
      setError('Error de conexión al cargar el contrato');
    } finally {
      setLoadingContract(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

const handleGarantesChange = (event) => {
  const value = event.target.value;
  const ids = (typeof value === 'string' ? value.split(',') : value).map(Number);

  setFormData(prev => ({
    ...prev,
    garantesIds: ids,
  }));
};


  // Calcular duración automáticamente cuando cambian las fechas
  useEffect(() => {
    if (formData.fechaInicio && formData.fechaFin) {
      const dias = formData.fechaFin.diff(formData.fechaInicio, 'day');
      const meses = Math.floor(dias / 30);
      setFormData(prev => ({
        ...prev,
        duracion: meses.toString()
      }));
    }
  }, [formData.fechaInicio, formData.fechaFin]);

  // Validar formulario
  const validateForm = () => {
    if (!formData.fechaInicio) {
      setError('Debe seleccionar una fecha de inicio');
      return false;
    }
    if (!formData.fechaFin) {
      setError('Debe seleccionar una fecha de fin');
      return false;
    }
    if (!formData.montoAlquiler) {
      setError('Debe ingresar el monto de alquiler');
      return false;
    }
    if (!formData.destino) {
      setError('Debe especificar el destino del inmueble');
      return false;
    }
    if (!formData.tipoGarantia) {
      setError('Debe seleccionar un tipo de garantía');
      return false;
    }
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Preparar datos para enviar
      const contractData = {
        idContrato: contratoId,
        nuevaFechaInicio: formData.fechaInicio.format('YYYY-MM-DD'),
        nuevaFechaFin: formData.fechaFin.format('YYYY-MM-DD'),
        duracionMeses: parseInt(formData.duracion) || 0,
        montoAlquiler: parseFloat(formData.montoAlquiler) || 0,
        actualizacion: parseInt(formData.actualizacion) || 0,
        indiceAjuste: formData.indiceAjuste || '',
        montoAlquilerLetras: formData.montoAlquilerLetras || '',
        garantesIds: formData.garantesIds,
      };

      // Determinar endpoint según si es renovación o nuevo contrato
      const endpoint = isRenewal 
        ? `${import.meta.env.VITE_API_URL}/contrato/renovar`
        : `${import.meta.env.VITE_API_URL}/contrato`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contractData)
      });

      if (response.ok) {
        const result = await response.json();
        
        Swal.fire({
          icon: 'success',
          title: isRenewal ? 'Contrato Renovado' : 'Contrato Creado',
          text: isRenewal 
            ? 'El contrato se ha renovado exitosamente'
            : 'El contrato se ha creado exitosamente',
          confirmButtonColor: '#3085d6',
          timer: 2000
        });

        navigate('/contratos');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear el contrato');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        p: 2, 
        minHeight: '100vh',
        backgroundColor: theme => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5'
      }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            onClick={() => navigate(-1)}
            sx={{ 
              minWidth: 'auto', 
              p: 1,
              borderRadius: '25px'
            }}
          >
            ←
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isRenewal ? 'Renovar Contrato' : 'Nuevo Contrato'}
            </Typography>
            {isRenewal && existingContract && (
              <Typography variant="body2" color="text.secondary">
                Renovando: {existingContract.nombreContrato}
              </Typography>
            )}
          </Box>
        </Box>

        {loadingContract && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Cargando datos del contrato...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, borderRadius: '20px' }}>
          {!loadingContract && (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
              {/* Fechas y Duración */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Período del Contrato
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Fecha de Inicio"
                  value={formData.fechaInicio}
                  onChange={handleDateChange('fechaInicio')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Fecha de Fin"
                  value={formData.fechaFin}
                  onChange={handleDateChange('fechaFin')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Duración (meses)"
                  value={formData.duracion}
                  onChange={handleChange('duracion')}
                  InputProps={{ readOnly: true }}
                  helperText="Calculado automáticamente"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Datos Económicos */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Datos Económicos
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monto de Alquiler"
                  type="number"
                  value={formData.montoAlquiler}
                  onChange={handleChange('montoAlquiler')}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monto en Letras"
                  value={formData.montoAlquilerLetras}
                  onChange={handleChange('montoAlquilerLetras')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Actualización (meses)"
                  type="number"
                  value={formData.actualizacion}
                  onChange={handleChange('actualizacion')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Índice de Ajuste</InputLabel>
                  <Select
                    value={formData.indiceAjuste}
                    onChange={handleChange('indiceAjuste')}
                    label="Índice de Ajuste"
                  >
                    {indicesAjuste.map((indice) => (
                      <MenuItem key={indice} value={indice}>
                        {indice}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Multa por Día"
                  type="number"
                  value={formData.multaXDia}
                  onChange={handleChange('multaXDia')}
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destino del Inmueble"
                  value={formData.destino}
                  onChange={handleChange('destino')}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Garantía */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Garantía
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Garantía</InputLabel>
                  <Select
                    value={formData.tipoGarantia}
                    onChange={handleChange('tipoGarantia')}
                    label="Tipo de Garantía"
                  >
                    {tiposGarantia.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Garantes</InputLabel>
                  <Select
                    multiple
                    value={formData.garantesIds}
                    onChange={handleGarantesChange}
                  renderValue={(selected) =>
                  selected
                    .map((id) => {
                      const garante = [...garantes, ...garantesDelContrato].find(g => Number(g.id) === Number(id));
                      return garante ? `${garante.nombre} ${garante.apellido}` : '';
                    })
                    .filter(Boolean)
                    .join(', ')

                    }
                  >
                    {/* Mostrar garantes del contrato existente si es renovación */}
                    {isRenewal && garantesDelContrato.length > 0 && (
                      <>
                        <MenuItem disabled value="">
                          <Typography variant="body2" color="text.secondary">
                            Garantes del contrato actual:
                          </Typography>
                        </MenuItem>
                        {garantesDelContrato.map((garante) => (
                          <MenuItem key={garante.id} value={garante.id}>
                            <Checkbox checked={formData.garantesIds.indexOf(garante.id) > -1} />
                            <ListItemText primary={`${garante.nombre} ${garante.apellido}`} />
                          </MenuItem>
                        ))}
                        <MenuItem disabled value="">
                          <Typography variant="body2" color="text.secondary">
                            Elegir nuevos garantes:
                          </Typography>
                        </MenuItem>
                      </>
                    )}
                    
                    {/* Mostrar opción para contrato sin garantes si es renovación */}
                    {isRenewal && garantesDelContrato.length === 0 && (
                      <MenuItem disabled value="">
                        <Typography variant="body2" color="text.secondary">
                          Contrato sin garantes
                        </Typography>
                      </MenuItem>
                    )}
                    
                    {/* Mostrar todos los garantes disponibles */}
                    {garantes.map((garante) => (
                      <MenuItem key={garante.id} value={garante.id}>
                        <Checkbox checked={formData.garantesIds.indexOf(garante.id) > -1} />
                        <ListItemText primary={`${garante.nombre} ${garante.apellido}`} />
                      </MenuItem>
                    ))}
                    
                    {/* Botón para cargar más garantes si es renovación */}
                    {isRenewal && garantes.length === 0 && (
                      <MenuItem 
                        onClick={fetchGarantes}
                        sx={{ color: 'primary.main' }}
                      >
                        <ListItemText primary="Cargar garantes disponibles..." />
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Servicios */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Distribución de Servicios
                </Typography>
              </Grid>
              
              {/* Agua */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Empresa de Agua</InputLabel>
                  <Select
                    value={formData.aguaEmpresa}
                    onChange={handleChange('aguaEmpresa')}
                    label="Empresa de Agua"
                  >
                    {empresasServicios.map((empresa) => (
                      <MenuItem key={empresa} value={empresa}>
                        {empresa}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje Agua"
                  type="number"
                  value={formData.aguaPorcentaje}
                  onChange={handleChange('aguaPorcentaje')}
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>
              
              {/* Luz */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Empresa de Luz</InputLabel>
                  <Select
                    value={formData.luzEmpresa}
                    onChange={handleChange('luzEmpresa')}
                    label="Empresa de Luz"
                  >
                    {empresasServicios.map((empresa) => (
                      <MenuItem key={empresa} value={empresa}>
                        {empresa}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje Luz"
                  type="number"
                  value={formData.luzPorcentaje}
                  onChange={handleChange('luzPorcentaje')}
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>
              
              {/* Gas */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Empresa de Gas</InputLabel>
                  <Select
                    value={formData.gasEmpresa}
                    onChange={handleChange('gasEmpresa')}
                    label="Empresa de Gas"
                  >
                    {empresasServicios.map((empresa) => (
                      <MenuItem key={empresa} value={empresa}>
                        {empresa}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje Gas"
                  type="number"
                  value={formData.gasPorcentaje}
                  onChange={handleChange('gasPorcentaje')}
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>
              
              {/* Municipal */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Empresa Municipal</InputLabel>
                  <Select
                    value={formData.municipalEmpresa}
                    onChange={handleChange('municipalEmpresa')}
                    label="Empresa Municipal"
                  >
                    {empresasServicios.map((empresa) => (
                      <MenuItem key={empresa} value={empresa}>
                        {empresa}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentaje Municipal"
                  type="number"
                  value={formData.municipalPorcentaje}
                  onChange={handleChange('municipalPorcentaje')}
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Comisiones */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                  Comisiones
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Comisión Contrato (%)"
                  type="number"
                  value={formData.comisionContratoPorc}
                  onChange={handleChange('comisionContratoPorc')}
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Comisión Mensual (%)"
                  type="number"
                  value={formData.comisionMensualPor}
                  onChange={handleChange('comisionMensualPor')}
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>

              {/* Botones */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ 
                      flex: 1,
                      borderRadius: '25px',
                      py: 1.5
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      flex: 1,
                      borderRadius: '25px',
                      py: 1.5
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Renovar contrato'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default NuevoContratoForm;
