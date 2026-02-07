import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Paper,
  Tooltip,
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
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../context/GlobalAuth';
import { useNavigate } from 'react-router-dom';
import presupuestoApi from '../api/presupuestoApi';
import axios from 'axios';

const PresupuestoPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
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

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
      '&.Mui-focused': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#fff' },
    },
  };

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: { xs: 2, sm: 3, md: 2 },
      pb: { xs: 14, sm: 12 },
      pl: { xs: 2, sm: 3, md: '16rem' },
      pr: { xs: 2, sm: 4, md: 3 },
      boxSizing: 'border-box',
    }}>
      <Box sx={{ mt: { xs: '4rem', sm: 0 }, maxWidth: 1100, mx: 'auto' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => navigate(-1)}
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
                <ReceiptIcon sx={{ color: isDark ? '#a78bfa' : '#7c3aed', fontSize: { xs: 20, sm: 24 } }} />
                Presupuestos
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Crea y gestiona presupuestos para tus clientes
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Nuevo presupuesto">
            <IconButton
              onClick={() => setOpenModal(true)}
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Lista */}
        {loading && !openModal ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#8b5cf6' }} />
          </Box>
        ) : presupuestos.length === 0 ? (
          <Paper elevation={0} sx={{
            textAlign: 'center', py: 8, px: 3, borderRadius: 3,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
              bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ReceiptIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              No hay presupuestos creados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primer presupuesto haciendo clic en el botón +
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
              sx={{
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: 'none', fontWeight: 600, textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' },
              }}
            >
              Nuevo Presupuesto
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {presupuestos.map((presupuesto) => (
              <Grid item xs={12} sm={6} md={4} key={presupuesto.id}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.1)',
                      borderColor: '#8b5cf6',
                    },
                  }}
                  onClick={() => handleViewPresupuesto(presupuesto)}
                >
                  {/* Card header accent */}
                  <Box sx={{
                    height: 4,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  }} />

                  <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                        <Box sx={{
                          width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                          bgcolor: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <ReceiptIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {presupuesto.titulo}
                        </Typography>
                      </Box>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(presupuesto.id);
                          }}
                          disabled={loading}
                          sx={{
                            ml: 0.5,
                            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                            '&:hover': { color: '#ef4444', bgcolor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)' },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Monto Base
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#a78bfa' : '#7c3aed' }}>
                        {formatCurrency(presupuesto.monto)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
                      {[
                        { label: 'Honorarios', value: formatCurrency(presupuesto.honorarios) },
                        { label: 'Sellado', value: formatCurrency(presupuesto.sellado) },
                      ].map((item) => (
                        <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{item.label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{item.value}</Typography>
                        </Box>
                      ))}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Duración</Typography>
                        <Chip
                          icon={<CalendarIcon sx={{ fontSize: '14px !important' }} />}
                          label={`${presupuesto.duracion} meses`}
                          size="small"
                          sx={{
                            height: 22, fontSize: '0.7rem',
                            bgcolor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)',
                            color: isDark ? '#a78bfa' : '#7c3aed',
                            '& .MuiChip-icon': { color: isDark ? '#a78bfa' : '#7c3aed' },
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{
                      mt: 'auto', pt: 1.5,
                      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Total</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e', fontSize: '1.1rem' }}>
                          {formatCurrency(getPresupuestoTotal(presupuesto))}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Modal para Nuevo Presupuesto */}
        <Modal open={openModal} onClose={handleCloseModal}>
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
              borderRadius: 3,
              boxShadow: 24,
              p: 0
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2.5,
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon sx={{ fontSize: 22 }} />
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  Nuevo Presupuesto
                </Typography>
              </Box>
              <IconButton onClick={handleCloseModal} sx={{ color: 'white' }} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ p: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small"
                      label="Título del Presupuesto"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      required
                      sx={inputSx}
                      InputProps={{ startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small"
                      label="Monto Base"
                      name="monto"
                      type="text"
                      value={formatMontoDisplay(formData.monto)}
                      onChange={handleMontoChange}
                      required
                      inputProps={{ inputMode: 'decimal' }}
                      sx={inputSx}
                      InputProps={{ startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small"
                      label="Duración (meses)"
                      name="duracion"
                      type="number"
                      value={formData.duracion}
                      onChange={handleInputChange}
                      required
                      inputProps={{ min: 1 }}
                      sx={inputSx}
                      InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small"
                      label="% Comisión Contrato"
                      name="porcentajeContrato"
                      value={formData.porcentajeContrato}
                      onChange={handleInputChange}
                      required
                      placeholder="ej: 3.5"
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small"
                      label="% Sello"
                      name="porcentajeSello"
                      value={formData.porcentajeSello}
                      onChange={handleInputChange}
                      required
                      placeholder="ej: 1.2"
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth size="small"
                      label="Gastos Extras (opcional)"
                      name="gastosExtras"
                      type="number"
                      value={formData.gastosExtras}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={inputSx}
                    />
                  </Grid>

                  {formData.monto && formData.porcentajeContrato && formData.porcentajeSello && formData.duracion && (
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{
                        p: 2.5, borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white',
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                          Total Estimado: {formatCurrency(calculateFormPreview(formData).total)}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {[
                            { label: 'Primer Mes', value: calculateFormPreview(formData).primerMes },
                            { label: 'Depósito', value: calculateFormPreview(formData).deposito },
                            { label: 'Honorarios', value: calculateFormPreview(formData).comision },
                            { label: 'Sellado', value: calculateFormPreview(formData).sellado },
                          ].map((item) => (
                            <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ opacity: 0.85 }}>• {item.label}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(item.value)}</Typography>
                            </Box>
                          ))}
                          {formData.gastosExtras && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ opacity: 0.85 }}>• Extras</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(calculateFormPreview(formData).gastosExtras)}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseModal}
                    disabled={loading}
                    sx={{
                      borderRadius: 2.5,
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: 'text.primary',
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    sx={{
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      boxShadow: 'none', fontWeight: 600,
                      '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' },
                    }}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </Box>
              </form>
            </Box>
          </Box>
        </Modal>

        {/* Modal de Detalles del Presupuesto */}
        <Modal open={openDetailModal} onClose={handleCloseDetailModal}>
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
                    p: 3.5,
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
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
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' }
                    }}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>

                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      overflow: 'hidden',
                    }}
                  >
                    {usuarioFetch?.logo ? (
                      <img src={usuarioFetch.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <BusinessIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5, fontSize: '1.1rem' }}>
                    {usuarioFetch?.nombreNegocio || 'Inmobiliaria'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, textAlign: 'center' }}>
                    Presupuesto Profesional
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: isDark ? '#a78bfa' : '#7c3aed', mb: 0.5 }}>
                      {selectedPresupuesto.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Detalle de gastos para ingresar en la propiedad
                    </Typography>
                  </Box>

                  <Paper elevation={0} sx={{
                    mb: 2.5, p: 2.5, borderRadius: 2.5,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                      Desglose de Costos
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[
                        { label: 'Primer Mes', value: selectedPresupuesto.primerMes || selectedPresupuesto.monto, bold: true },
                        { label: 'Depósito', value: selectedPresupuesto.monto },
                        { label: 'Honorarios', value: selectedPresupuesto.honorarios },
                        { label: 'Sellado', value: selectedPresupuesto.sellado },
                      ].map((item) => (
                        <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                          <Typography variant={item.bold ? 'subtitle1' : 'body2'} sx={{ fontWeight: item.bold ? 700 : 500 }}>
                            {formatCurrency(item.value)}
                          </Typography>
                        </Box>
                      ))}

                      {selectedPresupuesto.gastosExtras > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Gastos Extras</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(selectedPresupuesto.gastosExtras)}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Duración: <strong>{selectedPresupuesto.duracion} meses</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      mb: 2.5, p: 2.5, borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      color: 'white', textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
                      Total del Presupuesto
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {formatCurrency(getPresupuestoTotal(selectedPresupuesto))}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Precio final incluye todos los conceptos
                    </Typography>
                  </Paper>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<WhatsAppIcon />}
                      onClick={handleSharePresupuesto}
                      sx={{
                        borderRadius: 2.5, px: 3, fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: '#25D366',
                        color: 'white',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#128C7E', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }
                      }}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={handleCopyToClipboard}
                      sx={{
                        borderRadius: 2.5, px: 3, fontWeight: 600,
                        textTransform: 'none',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: 'text.primary',
                        '&:hover': { borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' },
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

      </Box>
    </Box>
  );
};

export default PresupuestoPage;
