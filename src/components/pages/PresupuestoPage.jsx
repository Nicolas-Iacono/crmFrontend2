import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Modal,
  TextField,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as CopyIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../context/GlobalAuth';
import presupuestoApi from '../api/presupuestoApi';
import axios from 'axios';

const PresupuestoPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { usuarioFetch } = useAuth();
  const [idUser, setIdUser] = useState(null);
  // Estados
  const [presupuestos, setPresupuestos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [username, setUsername] = useState('');



  useEffect(() => {
    setIdUser(usuarioFetch?.id);
  }, [usuarioFetch]);
  // Estado del formulario
  const [formData, setFormData] = useState({
    usuarioId: idUser,
    titulo: '',
    monto: '',
    porcentajeContrato: '',
    porcentajeSello: '',
    duracion: '',
    gastosExtras: '',
  });

  // Setear username cuando llega el usuario (se mantiene para payload de creación)
  useEffect(() => {
    setFormData(prev => ({ ...prev, username: usuarioFetch?.username || '' }));
    setUsername(usuarioFetch?.username || '');
  }, [usuarioFetch]);

  // Cargar presupuestos desde nueva API por id de usuario con token
  useEffect(() => {
    if (!usuarioFetch?.id) return;
    fetchPresupuestos();
  }, [usuarioFetch?.id]);

  const fetchPresupuestos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/presupuestos/id-user/${usuarioFetch.id}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setPresupuestos(list);
    } catch (err) {
      console.error('Error fetching presupuestos:', err);
      setError(err.message || 'Error al cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const getPresupuestoTotal = (presupuesto) => {
    if (presupuesto.total) {
      return parseFloat(presupuesto.total);
    }
    const primerMes = parseFloat(presupuesto.primerMes || presupuesto.monto) || 0;
    const deposito = parseFloat(presupuesto.monto) || 0;
    const honorarios = parseFloat(presupuesto.honorarios) || 0;
    const sellado = parseFloat(presupuesto.sellado) || 0;
    const extras = parseFloat(presupuesto.gastosExtras) || 0;
    return primerMes + deposito + honorarios + sellado + extras;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuarioFetch?.id) {
      setError('No se pudo obtener el ID del usuario');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const presupuestoData = {
        usuarioId: idUser,
        titulo: formData.titulo,
        monto: parseFloat(formData.monto),
        porcentajeContrato: formData.porcentajeContrato,
        porcentajeSello: formData.porcentajeSello,
        duracion: parseInt(formData.duracion),
        gastosExtras: formData.gastosExtras ? parseFloat(formData.gastosExtras) : 0,
        deposito: parseFloat(formData.monto),
      };

      const validation = presupuestoApi.validatePresupuestoData(presupuestoData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      const { error } = await presupuestoApi.createPresupuesto(presupuestoData);
      if (!error) {
        setSuccess('Presupuesto creado exitosamente');
        setOpenModal(false);
        resetForm();
        fetchPresupuestos();
      } else {
        setError(error || 'Error al crear el presupuesto');
      }
    } catch (err) {
      console.error('Error creating presupuesto:', err);
      setError(err.message || 'Error al crear el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      usuarioId: idUser,
      titulo: '',
      monto: '',
      porcentajeContrato: '',
      porcentajeSello: '',
      duracion: '',
      gastosExtras: ''
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
    setError(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount ?? 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) return;

    try {
      setLoading(true);
      const { error } = await presupuestoApi.deletePresupuesto(id);
      if (!error) {
        setSuccess('Presupuesto eliminado exitosamente');
        fetchPresupuestos(username);
      } else {
        setError(error || 'Error al eliminar el presupuesto');
      }
    } catch (err) {
      console.error('Error deleting presupuesto:', err);
      setError(err.message || 'Error al eliminar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPresupuesto = (presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setOpenDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedPresupuesto(null);
  };

  const handleSharePresupuesto = async () => {
    if (!selectedPresupuesto) return;

    const whatsappMessage = `🏠 *PRESUPUESTO INMOBILIARIO*
    
📋 *${selectedPresupuesto.titulo}*
${usuarioFetch?.nombreNegocio || 'Inmobiliaria'}

💰 *DETALLE DE GASTOS:*
• Primer Mes: ${formatCurrency(selectedPresupuesto.primerMes || selectedPresupuesto.monto)}
• Depósito: ${formatCurrency(selectedPresupuesto.monto)}
• Honorarios: ${formatCurrency(selectedPresupuesto.honorarios)}
• Sellado: ${formatCurrency(selectedPresupuesto.sellado)}
${selectedPresupuesto.gastosExtras > 0 ? `• Gastos Extras: ${formatCurrency(selectedPresupuesto.gastosExtras)}` : ''}

💵 *TOTAL: ${formatCurrency(getPresupuestoTotal(selectedPresupuesto))}*

📅 Duración: ${selectedPresupuesto.duracion} meses
📞 Contactanos para más información`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `Presupuesto - ${selectedPresupuesto.titulo}`,
          text: whatsappMessage
        });
        return;
      } catch {
        // fallback
      }
    }
    window.open(whatsappUrl, '_blank');
    setSuccess('Abriendo WhatsApp para compartir...');
  };

  const handleCopyToClipboard = async () => {
    if (!selectedPresupuesto) return;

    const textMessage = `🏠 PRESUPUESTO INMOBILIARIO

📋 ${selectedPresupuesto.titulo}
${usuarioFetch?.nombreNegocio || 'Inmobiliaria'}

💰 DETALLE DE GASTOS:
• Primer Mes: ${formatCurrency(selectedPresupuesto.primerMes || selectedPresupuesto.monto)}
• Depósito: ${formatCurrency(selectedPresupuesto.monto)}
• Honorarios: ${formatCurrency(selectedPresupuesto.honorarios)}
• Sellado: ${formatCurrency(selectedPresupuesto.sellado)}
${selectedPresupuesto.gastosExtras > 0 ? `• Gastos Extras: ${formatCurrency(selectedPresupuesto.gastosExtras)}` : ''}

💵 TOTAL: ${formatCurrency(getPresupuestoTotal(selectedPresupuesto))}

📅 Duración: ${selectedPresupuesto.duracion} meses
📞 Contactanos para más información`;

    try {
      await navigator.clipboard.writeText(textMessage);
      setSuccess('Presupuesto copiado al portapapeles');
    } catch {
      setError('Error al copiar al portapapeles');
    }
  };

  const calculateFormPreview = (fd) => {
    const montoBase = parseFloat(fd.monto) || 0;
    const duracion = parseFloat(fd.duracion) || 0;
    const porcentajeContrato = parseFloat(fd.porcentajeContrato) || 0;
    const porcentajeSello = parseFloat(fd.porcentajeSello) || 0;
    const gastosExtras = parseFloat(fd.gastosExtras) || 0;

    const primerMes = montoBase;
    const deposito = montoBase;
    const comision = montoBase * duracion * (porcentajeContrato / 100);
    const sellado = montoBase * duracion * (porcentajeSello / 100);
    const total = primerMes + deposito + comision + sellado + gastosExtras;

    return { primerMes, deposito, comision, sellado, gastosExtras, total };
  };

  const formatMontoDisplay = (raw) => {
    if (raw == null || raw === '') return '';
    const str = String(raw);
    const [intPartRaw, fracPartRaw = ''] = str.split('.')
      .reduce((acc, part, idx) => {
        // keep only first decimal dot as separator
        if (idx === 0) return [part, ''];
        return [acc[0], acc[1] + part];
      }, ['', '']);
    const intDigits = intPartRaw.replace(/\D/g, '');
    if (!intDigits) return '';
    const intWithThousands = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const frac = fracPartRaw.replace(/\D/g, '');
    return frac ? `${intWithThousands},${frac}` : intWithThousands;
  };

  const normalizeMontoInput = (input) => {
    if (input == null) return '';
    const s = String(input);
    // Remove thousands separators and convert comma to dot for decimal
    const noThousands = s.replace(/\./g, '');
    const withDot = noThousands.replace(/,/g, '.');
    // Keep only digits and a single dot (decimal)
    const parts = withDot.split('.');
    const intDigits = parts[0].replace(/\D/g, '');
    const fracDigits = parts.slice(1).join('').replace(/\D/g, '');
    return fracDigits ? `${intDigits}.${fracDigits}` : intDigits;
  };

  const handleMontoChange = (e) => {
    const normalized = normalizeMontoInput(e.target.value);
    setFormData(prev => ({ ...prev, monto: normalized }));
  };

  return (
    <Container maxWidth={false} sx={{ 
      py: 4,
      width: { xs: '95%', sm: '100%', md: '84vw' },
      minHeight: '100vh',
      marginLeft: { md: '15rem' }
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 4 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main }}>
            Presupuestos
          </Typography>
        </Box>
        <IconButton
          color="primary"
          onClick={() => setOpenModal(true)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': { backgroundColor: theme.palette.primary.dark, transform: 'scale(1.05)' },
            transition: 'all 0.2s ease'
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Lista */}
      {loading && !openModal ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : presupuestos.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay presupuestos creados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea tu primer presupuesto haciendo clic en "Nuevo Presupuesto"
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {presupuestos.map((presupuesto) => (
            <Grid item xs={12} sm={6} md={4} key={presupuesto.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8], borderColor: theme.palette.primary.main },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
                onClick={() => handleViewPresupuesto(presupuesto)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon color="primary" />
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {presupuesto.titulo}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(presupuesto.id);
                      }}
                      disabled={loading}
                      sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Monto Base
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatCurrency(presupuesto.monto)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Honorarios:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(presupuesto.honorarios)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Sellado:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(presupuesto.sellado)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Duración:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{presupuesto.duracion} meses</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Total Estimado:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(getPresupuestoTotal(presupuesto))}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Chip icon={<VisibilityIcon />} label="Toca para ver detalles" size="small" variant="outlined" color="primary" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal para Nuevo Presupuesto */}
      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '95%' : '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 6,
            boxShadow: 24,
            p: 0
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              borderBottom: 1,
              borderColor: 'divider',
               background: 'linear-gradient(135deg,rgb(53, 74, 168) 0%,rgb(122, 15, 228) 100%)',
              color: 'white',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 400 }}>
              Nuevo Presupuesto
            </Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título del Presupuesto"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& fieldset': { borderRadius: 3 } }}
                    InputProps={{ startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monto Base"
                    name="monto"
                    type="text"
                    value={formatMontoDisplay(formData.monto)}
                    onChange={handleMontoChange}
                    required
                    inputProps={{ inputMode: 'decimal' }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& fieldset': { borderRadius: 3 } }}
                    InputProps={{ startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duración (meses)"
                    name="duracion"
                    type="number"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& fieldset': { borderRadius: 3 } }}
                    InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="% Comisión Contrato"
                    name="porcentajeContrato"
                    value={formData.porcentajeContrato}
                    onChange={handleInputChange}
                    required
                    placeholder="ej: 3.5"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& fieldset': { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="% Sello"
                    name="porcentajeSello"
                    value={formData.porcentajeSello}
                    onChange={handleInputChange}
                    required
                    placeholder="ej: 1.2"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& fieldset': { borderRadius: 3 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Gastos Extras (opcional)"
                    name="gastosExtras"
                    type="number"
                    value={formData.gastosExtras}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& fieldset': { borderRadius: 3 } }}
                  />
                </Grid>

                {formData.monto && formData.porcentajeContrato && formData.porcentajeSello && formData.duracion && (
                  <Grid item xs={12}>
                    <Card sx={{ backgroundColor: theme.palette.primary.light, color: 'white' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Total Estimado: {formatCurrency(calculateFormPreview(formData).total)}
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2, listStyle: 'none' }}>
                          <Box component="li" sx={{ mb: 0.5 }}>
                            <Typography variant="body2">
                              • Primer Mes: {formatCurrency(calculateFormPreview(formData).primerMes)}
                            </Typography>
                          </Box>
                          <Box component="li" sx={{ mb: 0.5 }}>
                            <Typography variant="body2">
                              • Depósito: {formatCurrency(calculateFormPreview(formData).deposito)}
                            </Typography>
                          </Box>
                          <Box component="li" sx={{ mb: 0.5 }}>
                            <Typography variant="body2">
                              • Honorarios: {formatCurrency(calculateFormPreview(formData).comision)}
                            </Typography>
                          </Box>
                          <Box component="li" sx={{ mb: 0.5 }}>
                            <Typography variant="body2">
                              • Sellado: {formatCurrency(calculateFormPreview(formData).sellado)}
                            </Typography>
                          </Box>
                          {formData.gastosExtras && (
                            <Box component="li" sx={{ mb: 0.5 }}>
                              <Typography variant="body2">
                                • Extras: {formatCurrency(calculateFormPreview(formData).gastosExtras)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleCloseModal} disabled={loading} sx={{ borderRadius: 4 }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: 4, background: 'linear-gradient(135deg,rgb(53, 74, 168) 0%,rgb(122, 15, 228) 100%)'}} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}>
                  {loading ? 'Guardando...' : 'Guardar Presupuesto'}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>

      {/* Modal de Detalles del Presupuesto */}
      <Modal open={openDetailModal} onClose={handleCloseDetailModal} aria-labelledby="detail-modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '95%' : '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 0
          }}
        >
          {selectedPresupuesto && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  borderRadius: '12px 12px 0 0',
                  position: 'relative'
                }}
              >
                <IconButton
                  onClick={handleCloseDetailModal}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <CloseIcon />
                </IconButton>

                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: theme.shadows[4]
                  }}
                >
                  {usuarioFetch?.logo ? (
                    <img src={usuarioFetch.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                  ) : (
                    <BusinessIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  )}
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>
                  {usuarioFetch?.nombreNegocio || 'Inmobiliaria'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'center' }}>
                  Presupuesto Profesional
                </Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    {selectedPresupuesto.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detalle de gastos para ingresar en la propiedad
                  </Typography>
                </Box>

                <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Desglose de Costos
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">Primer Mes:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {formatCurrency(selectedPresupuesto.primerMes || selectedPresupuesto.monto)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">Depósito:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(selectedPresupuesto.monto)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">Honorarios:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(selectedPresupuesto.honorarios)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">Sellado:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatCurrency(selectedPresupuesto.sellado)}
                        </Typography>
                      </Box>

                      {selectedPresupuesto.gastosExtras > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1">Gastos Extras:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(selectedPresupuesto.gastosExtras)}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          Duración del contrato: {selectedPresupuesto.duracion} meses
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    mb: 3,
                    background: `linear-gradient(135deg, rgba(131, 32, 189, 0.92)  0%, rgb(89, 58, 175) 100%)`,
                    color: 'white'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Total del Presupuesto
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(getPresupuestoTotal(selectedPresupuesto))}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      Precio final incluye todos los conceptos
                    </Typography>
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<WhatsAppIcon />}
                    onClick={handleSharePresupuesto}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      textTransform: 'none',
                      backgroundColor: '#25D366',
                      color: 'white',
                      '&:hover': { backgroundColor: '#128C7E' }
                    }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CopyIcon />}
                    onClick={handleCopyToClipboard}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      textTransform: 'none',
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': { backgroundColor: theme.palette.primary.light, borderColor: theme.palette.primary.dark }
                    }}
                  >
                    Copiar
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default PresupuestoPage;
