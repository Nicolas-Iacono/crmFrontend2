import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/GlobalAuth';
import { Box, Typography, Avatar, Paper, IconButton, Fab, Modal, Backdrop, Fade, TextField, Button, Divider, CircularProgress, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ShareIcon from '@mui/icons-material/Share';
import QRCode from 'react-qr-code';
import Iframe from 'react-iframe';
import EditIcon from '@mui/icons-material/Edit';
import GoogleLoginButton from '../../common/BotonGoogle/GoogleLoginButton';
import useGoogleLink from '../../../hooks/useGoogleLink';
import { googleUserApi } from '../../api/googleUserApi';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import { usuarioApi } from '../../api/usuarioApi';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../../common/SubscriptionModal/SubscriptionModal';
import ConfigurarPagosModal from '../../common/ConfigurarPagosModal';
import { showSuccess, showError, showWarning } from '../../alertas/showAlert';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeIcon from '@mui/icons-material/QrCode';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CloseIcon from '@mui/icons-material/Close';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LinkIcon from '@mui/icons-material/Link';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
const UserSettings = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isLinked, isLoading, googleProfile, handleLink, handleUnlink } = useGoogleLink();
  const { user, isLogged, updateUserProfile, logoTimestamp, logout, plan, usuarioFetch, isLoading: authLoading } = useAuth();
  const [openQR, setOpenQR] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [mercadoPagoStatus, setMercadoPagoStatus] = useState(null);
  const [loadingMercadoPagoStatus, setLoadingMercadoPagoStatus] = useState(false);
  const [configurarPagosModalOpen, setConfigurarPagosModalOpen] = useState(false);
    const handleOpenQR = () => setOpenQR(true);
  const handleCloseQR = () => setOpenQR(false);

  const handleOpenEditModal = () => {
    setFormData({
      cuit: usuarioFetch?.cuit || '',
      email: usuarioFetch?.email || '',
      localidad: usuarioFetch?.localidad || '',
      matricula: usuarioFetch?.matricula || '',
      nombreNegocio: usuarioFetch?.nombreNegocio || '',
      partido: usuarioFetch?.partido || '',
      provincia: usuarioFetch?.provincia || '',
      razonSocial: usuarioFetch?.razonSocial || '',
      telefono: usuarioFetch?.telefono || '',
      username: usuarioFetch?.username || '',
    });
    setEditModalOpen(true);
  };

 

  const handleCloseEditModal = () => setEditModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'cuit') {
      const digits = (value || '').replace(/\D/g, '').slice(0, 11);
      if (digits.length > 2 && digits.length <= 10) {
        next = `${digits.slice(0, 2)}-${digits.slice(2)}`;
      } else if (digits.length > 10) {
        next = `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
      } else {
        next = digits;
      }
    }
    setFormData(prev => ({ ...prev, [name]: next }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioFetch?.id) return;

    try {
      const onlyDigits = (v) => (v == null ? '' : String(v).replace(/\D/g, ''));
      const processed = {
        ...formData,
        cuit: formData.cuit ? onlyDigits(formData.cuit) : formData.cuit,
        telefono: formData.telefono ? onlyDigits(formData.telefono) : formData.telefono,
      };
      await axios.put(
        `${import.meta.env.VITE_API_URL}/usuario/${usuarioFetch.id}`,
        processed,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Refetch normalized user to avoid backend entity serialization issues (e.g., logo object)
      const refreshed = await axios.get(`${import.meta.env.VITE_API_URL}/usuario/nombre-negocio/${usuarioFetch.nombreNegocio}`);
      updateUserProfile(refreshed.data);
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating user data:', error.response?.data || error.message);
      // You can add a user-facing error message here
    }
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
  };


const handleCancelSubscription = async () => {
  try {
    // Confirmar intención
    const result = await Swal.fire({
      title: '¿Cancelar suscripción?',
      text: 'Tu suscripción se cancelará inmediatamente y volverás al plan gratuito.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#1976d2',
      confirmButtonText: 'Sí, cancelar ahora',
      cancelButtonText: 'No, mantener',
    });

    if (!result.isConfirmed) return;

    // Mostrar spinner mientras se procesa
    Swal.fire({
      title: 'Cancelando...',
      text: 'Por favor, espera unos segundos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Llamar al backend
    await axios.post(
      `${import.meta.env.VITE_API_URL}/subscriptions/cancel`,
      {},
      {
        withCredentials: true, // por si usás cookies httpOnly
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    Swal.close();
    showSuccess('Tu suscripción ha sido cancelada correctamente');
    
    // Actualizar UI (refrescar el estado del plan)
    setTimeout(() => window.location.reload(), 1500);

  } catch (error) {
    console.error('Error al cancelar la suscripción:', error);
    Swal.close();
    showError('No se pudo cancelar la suscripción. Intenta nuevamente.');
  }
};

const handleConfirmDelete = async () => {
  if (!usuarioFetch?.nombreNegocio) return;  // 👈 ya no username

  setIsDeleting(true);
  try {
    await usuarioApi.eliminarCuenta(usuarioFetch.nombreNegocio); // 👈 le pasás el nombre_negocio
    
    showSuccess('Cuenta eliminada exitosamente');

    localStorage.clear();
    logout();
    navigate('/login');
  } catch (error) {
    console.error('Error deleting account:', error);
    showError('No se pudo eliminar la cuenta. Inténtalo de nuevo.');
  } finally {
    setIsDeleting(false);
    setDeleteDialogOpen(false);
  }
};

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleOpenSubscriptionModal = () => {
    setSubscriptionModalOpen(true);
  };

  const handleCloseSubscriptionModal = () => {
    setSubscriptionModalOpen(false);
  };

  const handleSelectPlan = (plan) => {
    showSuccess(`Plan ${plan.name} seleccionado`);
    setSubscriptionModalOpen(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ok') === '1') {
      showSuccess('Cuenta de Mercado Pago conectada exitosamente.');
    }
  }, []);



  // Carga inicial robusta: espera a que tengamos username desde usuarioFetch o user, y trae datos con token
  useEffect(() => {
    if (!isLogged) {
      setInitialLoading(false);
      return;
    }
    const username = usuarioFetch?.nombreNegocio || user?.nombreNegocio;
    if (!username) return; // Espera a que el contexto provea el username
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/usuario/nombre-negocio/${username}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!cancelled) updateUserProfile(res.data);
      } catch (err) {
        console.error('Error fetching usuario (initial):', err.response?.data || err.message);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [isLogged, usuarioFetch?.username, user?.username]);

  // Refresco cuando cambia usuarioFetch.username (mantiene sincronía si se edita desde otro lugar)
  useEffect(() => {
    if (!usuarioFetch?.username) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/usuario/nombre-negocio/${usuarioFetch.nombreNegocio}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => updateUserProfile(res.data))
      .catch((err) => {
        console.error('Error fetching usuario (sync):', err);
      });
  }, [usuarioFetch?.username]);



  const subirLogo = async (idUsuario, archivo) => {
    const formData = new FormData();
    formData.append('file', archivo);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/usuario/${idUsuario}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` // ← acá está la magia
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al subir el logo:', error.response?.data || error.message);
      throw error;
    }
  };

  // Placeholders en caso de que no existan los datos
  const nombreNegocio = usuarioFetch?.nombreNegocio || 'Nombre de usuario';
  const email = usuarioFetch?.email || 'usuario@email.com';
  const usuario = usuarioFetch?.username || 'Ciudad, País';
  const profilePic = usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : googleProfile?.picture || ''; // Cache-busting
  const razonSocial = usuarioFetch?.razonSocial || 'Ciudad, País';
  const cuit = usuarioFetch?.cuit || 'Ciudad, País';
  const telefono = usuarioFetch?.telefono || 'Ciudad, País';
  const direccion = usuarioFetch?.direccion || 'Ciudad, País';
  const localidad = usuarioFetch?.localidad || 'Ciudad, País';
  const partido = usuarioFetch?.partido || 'Ciudad, País';
  const provincia = usuarioFetch?.provincia || 'Ciudad, País';
  const codigoPostal = usuarioFetch?.codigoPostal || 'Ciudad, País';
  const pais = usuarioFetch?.pais || 'Ciudad, País';
  const matricula = usuarioFetch?.matricula || '000000';

  const apiRoot = `${import.meta.env.VITE_API_URL}${String(import.meta.env.VITE_API_URL || '').includes('/api') ? '' : '/api'}`;
  const isMercadoPagoConnected = Boolean(
    usuarioFetch?.mpConnected || usuarioFetch?.mpUserId || usuarioFetch?.mpAccessToken
  );

  // Función para conectar con Mercado Pago
  const handleMercadoPagoConnect = async () => {
    try {
      const response = await axios.get(`${apiRoot}/mercadopago/connect-url`);
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error al obtener URL de conexión con Mercado Pago:', error);
      showError('Error al conectar con Mercado Pago. Intente nuevamente.');
    }
  };

  // Función para verificar el status de Mercado Pago
  const fetchMercadoPagoStatus = async () => {
    try {
      setLoadingMercadoPagoStatus(true);
      const token = localStorage.getItem("token") || localStorage.getItem("propietario_token") || localStorage.getItem("admin_token");
      const response = await axios.get(`${apiRoot}/mercadopago/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMercadoPagoStatus(response.data);
    } catch (error) {
      console.error('Error al verificar status de Mercado Pago:', error);
      setMercadoPagoStatus({ connected: false });
    } finally {
      setLoadingMercadoPagoStatus(false);
    }
  };

  // Función para desconectar Mercado Pago
  const handleMercadoPagoDisconnect = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Se desconectará tu cuenta de Mercado Pago y ya no podrás recibir pagos automáticos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, desconectar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token") || localStorage.getItem("propietario_token") || localStorage.getItem("admin_token");
        await axios.post(`${apiRoot}/mercadopago/disconnect`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Actualizar el status local
        setMercadoPagoStatus({ connected: false });
        
        showSuccess('Cuenta de Mercado Pago desconectada exitosamente.');
      }
    } catch (error) {
      console.error('Error al desconectar Mercado Pago:', error);
      showError('Error al desconectar Mercado Pago. Intente nuevamente.');
    }
  };

  // Efecto para cargar el status de Mercado Pago
  useEffect(() => {
    if (isLogged && usuarioFetch) {
      fetchMercadoPagoStatus();
    }
  }, [isLogged, usuarioFetch]);


  const qrData = usuarioFetch
    ? `BEGIN:VCARD
VERSION:3.0
FN:${nombreNegocio}
TEL;TYPE=WORK,VOICE:${telefono || ''}
ADR;TYPE=WORK:;;${razonSocial || ''};${localidad || ''};${provincia || ''}.
EMAIL:${email}
NOTE:Matricula: ${matricula} / CUIT: ${cuit || ''}
END:VCARD`
    : '';

  const direccionCompleta = `${razonSocial}, ${localidad}, ${partido}, ${provincia}`;
  if (!isLogged) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <Typography variant="h6" color="error">Debes iniciar sesión para ver esta página.</Typography>
      </Box>
    );
  }

  if (authLoading || initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );
  }

  const infoFields = [
    { label: 'Email', value: email, icon: <EmailOutlinedIcon />, color: '#8b5cf6' },
    { label: 'Usuario', value: usuario, icon: <PersonOutlineIcon />, color: '#3b82f6' },
    { label: 'Razón Social', value: `${razonSocial}, ${partido}, ${provincia}`, icon: <BusinessOutlinedIcon />, color: '#6366f1' },
    { label: 'Matrícula', value: matricula, icon: <BadgeOutlinedIcon />, color: '#8b5cf6' },
    { label: 'Teléfono', value: telefono, icon: <PhoneOutlinedIcon />, color: '#22c55e' },
    { label: 'CUIT', value: cuit, icon: <FingerprintIcon />, color: '#f59e0b' },
  ];

  return (
    <>
    <Box sx={{ 
      width: { xs: '100%', md: '84vw' },
      bgcolor: isDark ? '#0a0a12' : '#f5f3ff',
      display: 'flex', 
      justifyContent: 'start', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      marginLeft: { xs: '0', md: '15rem' },
      overflowY: 'auto',
      pb: 10,
    }}>
      {/* Header with gradient */}
      <Box sx={{
        width: '100%',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)',
        position: 'relative',
        overflow: 'hidden',
        pb: { xs: 8, md: 10 },
        pt: { xs: 3, md: 4 },
        px: { xs: 2, md: 4 },
      }}>
        {/* Decorative shapes */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '30%', width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
        <Box sx={{ position: 'absolute', top: 20, left: -30, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />

        {/* Top bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 8.5 }}>
  
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon sx={{ color: '#fbbf24', fontSize: 22 }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: -0.5 }}>
                Ajustes
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleOpenQR} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <QrCodeIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={handleOpenEditModal} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Profile Card - overlaps header */}
      <Paper elevation={0} sx={{
        width: { xs: '90%', md: '70%', lg: '60%' },
        maxWidth: 700,
        mt: { xs: -6, md: -7 },
        mx: 'auto',
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.1)'}`,
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(139,92,246,0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, pb: 3, px: 3 }}>
          {/* Avatar */}
          <Box position="relative" sx={{ mb: 2 }}>
            {isUploading && <CircularProgress size={108} sx={{ position: 'absolute', top: -4, left: -4, zIndex: 2, color: '#8b5cf6' }} />}
            <Avatar
              src={profilePic}
              alt={nombreNegocio}
              sx={{ 
                width: 100, height: 100, 
                border: `4px solid ${isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.2)'}`,
                boxShadow: '0 4px 20px rgba(139,92,246,0.2)',
                opacity: isUploading ? 0.5 : 1,
                fontSize: '2rem',
              }}
            />
            <label htmlFor="upload-logo">
              <input
                id="upload-logo"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file && usuarioFetch?.id) {
                    setIsUploading(true);
                    try {
                      await subirLogo(usuarioFetch.id, file);
                      const response = await axios.get(`${import.meta.env.VITE_API_URL}/usuario/nombre-negocio/${user.nombreNegocio}`);
                      const updatedUserData = response.data;
                      updateUserProfile(updatedUserData);
                    } catch (error) {
                      console.error('Error during logo upload process:', error);
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }}
              />
              <IconButton
                component="span"
                size="small"
                sx={{
                  position: 'absolute', bottom: 2, right: 2,
                  bgcolor: '#8b5cf6', color: '#fff',
                  boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
                  width: 32, height: 32,
                  '&:hover': { bgcolor: '#7c3aed' },
                }}
              >
                <CameraAltIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </label>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{nombreNegocio}</Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary', mb: 1 }}>{email}</Typography>
          {plan && (
            <Chip
              icon={<WorkspacePremiumIcon sx={{ fontSize: 16 }} />}
              label={plan.planName || 'Free'}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.7rem',
                '& .MuiChip-icon': { color: '#fbbf24' },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Content area */}
      <Box sx={{
        width: { xs: '90%', md: '70%', lg: '60%' },
        maxWidth: 700,
        mx: 'auto',
        mt: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}>
        {/* Info Fields Card */}
        <Paper elevation={0} sx={{
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.75rem', letterSpacing: 0.5 }}>
              INFORMACIÓN DE LA CUENTA
            </Typography>
          </Box>
          {infoFields.map((field, index) => (
            <Box key={field.label} sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              px: 2.5, py: 1.8,
              borderBottom: index < infoFields.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
              transition: 'background 0.2s',
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(139,92,246,0.03)' },
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                bgcolor: `${field.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: field.color,
                '& .MuiSvgIcon-root': { fontSize: 18 },
              }}>
                {field.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', fontSize: '0.65rem', letterSpacing: 0.3, textTransform: 'uppercase' }}>
                  {field.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {field.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Map Section */}
        <Paper elevation={0} sx={{
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#3b82f615', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <MapOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              Ubicación
            </Typography>
          </Box>
          <Box sx={{ height: 220, width: '100%' }}>
            <Iframe
              url={`https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
            />
          </Box>
        </Paper>
        {/* Google Link Section */}
        <Paper elevation={0} sx={{
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#ea443515', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea4435' }}>
              <LinkIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              Vinculación con Google
            </Typography>
            {isLinked && (
              <Chip label="Vinculado" size="small" sx={{ ml: 'auto', bgcolor: '#22c55e18', color: '#22c55e', fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
            )}
          </Box>
          <Box sx={{ p: 2.5 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} sx={{ color: '#8b5cf6' }} /></Box>
            ) : isLinked && googleProfile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={googleProfile.picture} alt={googleProfile.name} sx={{ width: 40, height: 40, border: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{googleProfile.name}</Typography>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>{googleProfile.email}</Typography>
                </Box>
                <IconButton onClick={handleUnlink} size="small" sx={{ color: '#ef4444', bgcolor: '#ef444410', '&:hover': { bgcolor: '#ef444420' } }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" sx={{ mb: 2, color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontSize: '0.8rem' }}>
                  Vincula tu cuenta de Google para un inicio de sesión más rápido y seguro.
                </Typography>
                <GoogleLoginButton onClick={handleLink} />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Mercado Pago Section */}
        {/* <Paper elevation={0} sx={{
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, background: 'linear-gradient(135deg, #00B5E2 0%, #0055A4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.6rem' }}>MP</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Mercado Pago</Typography>
            </Box>
            {mercadoPagoStatus?.connected && (
              <Chip label="Conectado" size="small" icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', ml: 1 }} />}
                sx={{ bgcolor: '#22c55e18', color: '#22c55e', fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
            )}
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ mb: 2, color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontSize: '0.8rem' }}>
              {mercadoPagoStatus?.connected
                ? 'Tu cuenta está lista para recibir pagos automáticos desde los recibos.'
                : 'Conectá tu cuenta de Mercado Pago para habilitar el cobro automático a inquilinos.'}
            </Typography>
            {mercadoPagoStatus?.connected && mercadoPagoStatus.mpAccountEmail && (
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,181,226,0.05)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,181,226,0.15)'}`, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Cuenta: {mercadoPagoStatus.mpAccountEmail}</Typography>
                {mercadoPagoStatus.tokenExpiresAt && (
                  <Typography variant="caption" display="block" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', mt: 0.5 }}>
                    Expira: {new Date(mercadoPagoStatus.tokenExpiresAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            )}
            <Button
              fullWidth
              onClick={mercadoPagoStatus?.connected ? handleMercadoPagoDisconnect : handleMercadoPagoConnect}
              disabled={loadingMercadoPagoStatus}
              sx={{
                py: 1.2, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                background: mercadoPagoStatus?.connected ? 'transparent' : 'linear-gradient(135deg, #00B5E2 0%, #0055A4 100%)',
                color: mercadoPagoStatus?.connected ? '#ef4444' : '#fff',
                border: mercadoPagoStatus?.connected ? '1.5px solid #ef444450' : 'none',
                boxShadow: mercadoPagoStatus?.connected ? 'none' : '0 4px 12px rgba(0,85,164,0.25)',
                '&:hover': {
                  background: mercadoPagoStatus?.connected ? '#ef444410' : 'linear-gradient(135deg, #0099CC 0%, #004488 100%)',
                  boxShadow: mercadoPagoStatus?.connected ? 'none' : '0 6px 20px rgba(0,85,164,0.35)',
                },
              }}
              startIcon={mercadoPagoStatus?.connected ? <DeleteIcon sx={{ fontSize: 18 }} /> : <LinkIcon sx={{ fontSize: 18 }} />}
            >
              {loadingMercadoPagoStatus ? 'Verificando...' : mercadoPagoStatus?.connected ? 'Desconectar' : 'Conectar Mercado Pago'}
            </Button>
          </Box>
        </Paper> */}

        {/* Configuración de Pagos Section */}
        <Paper elevation={0} sx={{
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PaymentIcon sx={{ fontSize: 18, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Configuración de Pagos</Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary' }}>Datos bancarios para cobros</Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ mb: 2, color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontSize: '0.8rem' }}>
              Configura tus datos bancarios para poder recibir pagos de alquileres de forma automática y segura.
            </Typography>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)', border: `1px solid ${isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.12)'}`, mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>¿Qué necesitas configurar?</Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary', lineHeight: 1.6 }}>
                Alias · CBU · Titular · CUIT del titular · Banco
              </Typography>
            </Box>
            <Button
              fullWidth
              onClick={() => setConfigurarPagosModalOpen(true)}
              sx={{
                py: 1.2, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(34,197,94,0.25)',
                '&:hover': { boxShadow: '0 6px 20px rgba(34,197,94,0.35)' },
              }}
              startIcon={<PaymentIcon sx={{ fontSize: 18 }} />}
            >
              Configurar Pagos para Cobros
            </Button>
          </Box>
        </Paper>

        {/* Subscription Status Section */}
        <Paper elevation={0} sx={{
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WorkspacePremiumIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Suscripción</Typography>
            </Box>
            {plan && (
              <Chip
                label={plan.status === 'CANCELED' ? 'Cancelado' : plan.status === 'ACTIVE' ? 'Activo' : plan.status}
                size="small"
                sx={{
                  bgcolor: plan.status === 'CANCELED' ? '#ef444418' : plan.status === 'ACTIVE' ? '#22c55e18' : '#f59e0b18',
                  color: plan.status === 'CANCELED' ? '#ef4444' : plan.status === 'ACTIVE' ? '#22c55e' : '#f59e0b',
                  fontWeight: 600, fontSize: '0.65rem', height: 22,
                }}
              />
            )}
          </Box>
          <Box sx={{ p: 2.5 }}>
            {plan ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>Plan Actual</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{plan.planName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>Contratos</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{plan.contratosActivos || 0} / {plan.contractLimit}</Typography>
                  </Box>
                  {plan.currentPeriodEnd && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>Vence</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{new Date(plan.currentPeriodEnd).toLocaleDateString('es-ES')}</Typography>
                    </Box>
                  )}
                </Box>
                {plan.cancelAtPeriodEnd && (
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f59e0b10', border: '1px solid #f59e0b30', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                      Tu suscripción se cancelará al final del período actual
                    </Typography>
                  </Box>
                )}
                {plan.planName === 'Free' ? (
                  <Button fullWidth onClick={handleOpenSubscriptionModal} sx={{
                    py: 1.2, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff',
                    boxShadow: '0 4px 12px rgba(139,92,246,0.25)',
                    '&:hover': { boxShadow: '0 6px 20px rgba(139,92,246,0.35)' },
                  }}>
                    Mejorar Plan
                  </Button>
                ) : plan.status !== 'CANCELED' && !plan.cancelAtPeriodEnd ? (
                  <Button fullWidth onClick={handleCancelSubscription} sx={{
                    py: 1, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                    color: '#ef4444', border: '1.5px solid #ef444440', bgcolor: 'transparent',
                    '&:hover': { bgcolor: '#ef444410' },
                  }}>
                    Cancelar Suscripción
                  </Button>
                ) : null}
                {(plan.status === 'CANCELED' || plan.cancelAtPeriodEnd) && (
                  <Button fullWidth onClick={handleOpenSubscriptionModal} sx={{
                    py: 1.2, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff',
                    boxShadow: '0 4px 12px rgba(139,92,246,0.25)',
                    '&:hover': { boxShadow: '0 6px 20px rgba(139,92,246,0.35)' },
                  }}>
                    Reactivar Suscripción
                  </Button>
                )}
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2, color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', fontSize: '0.8rem' }}>
                  No tienes una suscripción activa. Mejora tu experiencia con nuestros planes premium.
                </Typography>
                <Button fullWidth onClick={handleOpenSubscriptionModal} sx={{
                  py: 1.2, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.25)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(139,92,246,0.35)' },
                }}>
                  Ver Planes de Suscripción
                </Button>
              </>
            )}
          </Box>
        </Paper>

        {/* Danger Zone */}
        <Paper elevation={0} sx={{
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.03)',
          border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)'}`,
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#ef444418', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <WarningAmberIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444' }}>
              Zona de Peligro
            </Typography>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ mb: 2, color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary', fontSize: '0.8rem' }}>
              Una vez que elimines tu cuenta, no hay vuelta atrás. Todos tus datos serán eliminados permanentemente.
            </Typography>
            <Button
              fullWidth
              onClick={handleDeleteAccount}
              startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
              sx={{
                py: 1, borderRadius: 2.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                color: '#ef4444', border: '1.5px solid #ef444440', bgcolor: 'transparent',
                '&:hover': { bgcolor: '#ef444410', borderColor: '#ef4444' },
              }}
            >
              Eliminar cuenta permanentemente
            </Button>
          </Box>
        </Paper>

      </Box>
    </Box>

    {/* QR Modal */}
    <Modal
      open={openQR}
      onClose={handleCloseQR}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500, sx: { bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' } } }}
    >
      <Fade in={openQR}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 340, maxWidth: '90%',
          bgcolor: isDark ? '#111118' : '#fff',
          borderRadius: 4,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          <Box sx={{ height: 4, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }} />
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCodeIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Compartir Contacto</Typography>
              </Box>
              <IconButton onClick={handleCloseQR} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <QRCode value={qrData} size={220} />
            </Box>
            <Typography variant="caption" align="center" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>
              Escaneá este código para guardar los datos del martillero.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>

    {/* Edit Modal */}
    <Modal
      open={editModalOpen}
      onClose={handleCloseEditModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500, sx: { bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' } } }}
    >
      <Fade in={editModalOpen}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '85%', maxWidth: 500,
          bgcolor: isDark ? '#111118' : '#fff',
          borderRadius: 4,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
          overflow: 'hidden',
        }}>
          <Box sx={{ height: 4, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }} />
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Editar Información</Typography>
              </Box>
              <IconButton onClick={handleCloseEditModal} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <form onSubmit={handleFormSubmit}>
              {[
                { name: 'nombreNegocio', label: 'Nombre del Negocio' },
                { name: 'razonSocial', label: 'Razón Social / Dirección' },
                { name: 'cuit', label: 'CUIT' },
                { name: 'matricula', label: 'Matrícula' },
                { name: 'telefono', label: 'Teléfono' },
                { name: 'email', label: 'Email' },
                { name: 'localidad', label: 'Localidad' },
                { name: 'partido', label: 'Partido' },
                { name: 'provincia', label: 'Provincia' },
              ].map((field) => (
                <TextField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={handleFormChange}
                  fullWidth
                  size="small"
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' },
                  }}
                />
              ))}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button onClick={handleCloseEditModal} sx={{ borderRadius: 2.5, color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', textTransform: 'none' }}>
                  Cancelar
                </Button>
                <Button type="submit" sx={{
                  borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 3,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.25)',
                  '&:hover': { boxShadow: '0 6px 16px rgba(139,92,246,0.35)' },
                }}>
                  Guardar Cambios
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Fade>
    </Modal>

    {/* Delete Dialog */}
    <Dialog
      open={deleteDialogOpen}
      onClose={handleCancelDelete}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      <Box sx={{ height: 4, bgcolor: '#ef4444' }} />
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, pt: 2.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: '#ef444418', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
          <WarningAmberIcon sx={{ fontSize: 20 }} />
        </Box>
        ¿Eliminar tu cuenta?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', mb: 2 }}>
          Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {['Datos personales y de negocio', 'Contratos, propiedades, inquilinos y propietarios', 'Información financiera y contable', 'Vinculaciones con servicios externos'].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>{item}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleCancelDelete} disabled={isDeleting} sx={{ borderRadius: 2.5, textTransform: 'none', color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmDelete}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 3,
            bgcolor: '#ef4444', color: '#fff',
            '&:hover': { bgcolor: '#dc2626' },
          }}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar permanentemente'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Subscription Modal */}
    <SubscriptionModal
      open={subscriptionModalOpen}
      onClose={handleCloseSubscriptionModal}
      onSelectPlan={handleSelectPlan}
    />

    {/* Configurar Pagos Modal */}
    <ConfigurarPagosModal
      open={configurarPagosModalOpen}
      onClose={() => setConfigurarPagosModalOpen(false)}
    />
    </>
  );
};

export default UserSettings;
