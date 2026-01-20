import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/GlobalAuth';
import { Box, Typography, Avatar, Paper, IconButton, Fab, Modal, Backdrop, Fade, TextField, Button, Divider, CircularProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ShareIcon from '@mui/icons-material/Share';
import QRCode from 'react-qr-code';
import Iframe from 'react-iframe';
import EditIcon from '@mui/icons-material/Edit';
import GoogleLoginButton from '../../common/BotonGoogle/GoogleLoginButton';
import useGoogleLink from '../../../hooks/useGoogleLink';
import { googleUserApi } from '../../api/googleUserApi';
import DeleteIcon from '@mui/icons-material/Delete';
import { usuarioApi } from '../../api/usuarioApi';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../../common/SubscriptionModal/SubscriptionModal';
import { showSuccess, showError, showWarning } from '../../alertas/showAlert';
const UserSettings = () => {
  const theme = useTheme();
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

  return (
    <>
    <Box sx={{ 
      width: { xs: '100%', md: '84vw' },
      bgcolor: theme.palette.background.default,
      display: 'flex', 
      justifyContent: 'start', 
      alignItems: 'flex-start', 
      pt: '6',
      height: '100vh',
      flexDirection: 'column',
      marginLeft: { xs:"0",md: '15rem' },
    }}>
      <Paper elevation={4} sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderRadius: "0 0 20px 20px",
          width:"100%",
          height:"30%",
          overflow: 'hidden',
         
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"center",
            pt:4,
            pb:4,
            gap:"2rem",
            }}>
        {/* Header azul y foto de perfil */}
 <Typography variant="h6" color="white">Cuenta</Typography>
   
        <Box position="relative" display="flex" justifyContent="center" alignItems="center">
    {isUploading && <CircularProgress size={98} sx={{ position: 'absolute', zIndex: 1, color: 'white' }} />}
  <Avatar
    src={profilePic}
    alt={nombreNegocio}
    sx={{ 
      width: 90, 
      height: 90, 
      border: '4px solid #fff', 
      opacity: isUploading ? 0.5 : 1,
      backgroundSize:"contain", 
      backgroundPosition:"center center", 
      backgroundRepeat:"no-repeat"
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
      color="primary"
      sx={{
        bgcolor: '#fff',
        boxShadow: 3,
        position: 'absolute',
        bottom: 0,
        right: 0,
      }}
    >
      <AddPhotoAlternateIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />
    </IconButton>
  </label>
  
</Box>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="white">{nombreNegocio}</Typography>
       
        </Box>

          </Paper>
        {/* Datos del usuario */}
        

        <Box px={3} pt={5} sx={{
    display: "flex",
    flexDirection: "column",
    width: { xs: '85%', md: '80%' },
    flex: 1, // importante: ocupa el resto del espacio disponible
    overflowY: "auto", // habilita el scroll
    paddingBottom: "100px", // espacio para el botón fijo
    justifyContent:"space-between",
    alignItems:"flex-start"
  }}
>

          <Typography variant="overline" color={theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main}>EMAIL</Typography>
          <Box  sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
            borderRadius: "5px", 
            display:"flex", 
            alignItems:"end", 
            justifyContent:"start",
            padding:"0 .5rem",
            width:"90%",
            borderBottom:`3px solid ${theme.palette.primary.main}`, 
            height:"40px"
          }}>
          <Typography variant="subtitle1" color={theme.palette.text.primary} >{email}</Typography>
          </Box>

          <Typography variant="overline"  color={theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main}>USUARIO</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
            borderRadius: "5px", 
            display:"flex", 
            alignItems:"end", 
            justifyContent:"start",
            padding:"0 .5rem",
            width:"90%",
            borderBottom:`3px solid ${theme.palette.primary.main}`, 
            height:"40px"
          }}>
          <Typography variant="subtitle1" color={theme.palette.text.primary} >{usuario}</Typography>
          </Box>

          <Typography variant="overline" color={theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main}>RAZÓN SOCIAL</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
            borderRadius: "5px", 
            display:"flex", 
            alignItems:"end", 
            justifyContent:"start",
            padding:"0 .5rem",
            width:"90%",
            borderBottom:`3px solid ${theme.palette.primary.main}`, 
            height:"40px"
          }}>
          <Typography variant="subtitle1" color={theme.palette.text.primary} sx={{fontSize:".9rem"}} >{`${razonSocial}, ${partido}, ${provincia}`}</Typography>
          </Box>

          <Typography variant="overline" color={theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main}>MATRÍCULA</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
            borderRadius: "5px", 
            display:"flex", 
            alignItems:"end", 
            justifyContent:"start",
            padding:"0 .5rem",
            width:"90%",
            borderBottom:`3px solid ${theme.palette.primary.main}`, 
            height:"40px"
          }}>
          <Typography variant="subtitle1" color={theme.palette.text.primary} >{`${matricula}`}</Typography>
          </Box>

          <Typography variant="overline" color={theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main}>TELÉFONO</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
            borderRadius: "5px", 
            display:"flex", 
            alignItems:"end", 
            justifyContent:"start",
            padding:"0 .5rem",
            width:"90%",
            borderBottom:`3px solid ${theme.palette.primary.main}`, 
            height:"40px"
          }}>
          <Typography variant="subtitle1" color={theme.palette.text.primary} >{`${telefono}`}</Typography>
          </Box>

          <Typography variant="overline" color={theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main}>CUIT</Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
            borderRadius: "5px", 
            display:"flex", 
            alignItems:"end", 
            justifyContent:"start",
            padding:"0 .5rem",
            width:"90%",
            borderBottom:`3px solid ${theme.palette.primary.main}`, 
            height:"40px"
          }}>
          <Typography variant="subtitle1" color={theme.palette.text.primary} >{`${cuit}`}</Typography>
          </Box>
            <Box sx={{width:"100%", height:"300px", display:"flex",
              alignItems:"center", justifyContent:"center", marginTop:"2rem"
            }}>
              <Iframe
                url={`https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`}
                width="100%"
                height="100%"
                frameBorder="1"
                style={{ border: 10 , marginTop:"4rem"}}
                allowFullScreen
              />
            </Box>
            <Box sx={{ 
              my: 4, 
              p: 2, 
              border: `1px solid ${theme.palette.divider}`, 
              borderRadius: '8px', 
              backgroundColor: theme.palette.background.paper 
            }}>
              <Typography variant="h6" gutterBottom color={theme.palette.mode === 'dark' ? 'white' : "black"}>Vinculación con Google</Typography>
              {isLoading ? (
                <CircularProgress />
              ) : isLinked && googleProfile ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width:"80%" }}>
                  <Avatar src={googleProfile.picture} alt={googleProfile.name} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold" color={theme.palette.mode === 'dark' ? 'white' : "black"}>{googleProfile.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{googleProfile.email}</Typography>
                  </Box>
                  <IconButton variant="outlined" color="error" onClick={handleUnlink} sx={{ ml: 'auto' }}>
                    
                    <DeleteIcon sx={{ mr: 1 }} />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Vincula tu cuenta de Google para un inicio de sesión más rápido y seguro.
                  </Typography>
                  <GoogleLoginButton onClick={handleLink} />
                </Box>
              )}
            </Box>

            {/* Sección de Estado de Suscripción */}
            <Box sx={{ 
              my: 4, 
              p: 3, 
              border: `2px solid ${plan?.status === 'CANCELED' ? theme.palette.error.main : theme.palette.primary.main}`, 
              borderRadius: '8px', 
              backgroundColor: plan?.status === 'CANCELED' 
                ? (theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)')
                : (theme.palette.mode === 'dark' ? 'rgba(26, 35, 126, 0.1)' : 'rgba(26, 35, 126, 0.05)')
            }}>
              <Typography variant="h6" gutterBottom 
                color={plan?.status === 'CANCELED' ? 'error' : 'primary'} 
                sx={{ fontWeight: 'bold' }}
              >
                Estado de Suscripción
              </Typography>
              
              {plan ? (
                <Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Plan Actual:
                      </Typography>
                      <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                        {plan.planName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Estado:
                      </Typography>
                      <Box sx={{ 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: '16px',
                        backgroundColor: plan.status === 'CANCELED' 
                          ? 'rgba(211, 47, 47, 0.2)' 
                          : plan.status === 'ACTIVE' 
                            ? 'rgba(76, 175, 80, 0.2)'
                            : 'rgba(255, 152, 0, 0.2)',
                        color: plan.status === 'CANCELED' 
                          ? theme.palette.error.main 
                          : plan.status === 'ACTIVE' 
                            ? '#4caf50'
                            : '#ff9800'
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          {plan.status === 'CANCELED' ? 'CANCELADO' : 
                           plan.status === 'ACTIVE' ? 'ACTIVO' : 
                           plan.status}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Límite de Contratos:
                      </Typography>
                      <Typography variant="body2">
                        {plan.contratosActivos || 0} / {plan.contractLimit}
                      </Typography>
                    </Box>
                    
                    {plan.currentPeriodEnd && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Vence:
                        </Typography>
                        <Typography variant="body2">
                          {new Date(plan.currentPeriodEnd).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    )}
                    
                    {plan.cancelAtPeriodEnd && (
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '8px', 
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        border: '1px solid #ff9800'
                      }}>
                        <Typography variant="body2" color="#ff9800" sx={{ fontWeight: 'bold' }}>
                          ⚠️ Tu suscripción se cancelará al final del período actual
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {plan.planName === 'Free' ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenSubscriptionModal}
                      sx={{
                        background: 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0d1652 0%, #283593 100%)',
                        }
                      }}
                    >
                      Deseo Suscribirme
                    </Button>
                  ) : plan.status !== 'CANCELED' && !plan.cancelAtPeriodEnd && (
                   <Button
  variant="outlined"
  color="error"
  onClick={handleCancelSubscription}
  sx={{
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
    },
  }}
>
  Cancelar Suscripción
</Button>
                  )}
                  
                  {(plan.status === 'CANCELED' || plan.cancelAtPeriodEnd) && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenSubscriptionModal}
                      sx={{
                        background: 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0d1652 0%, #283593 100%)',
                        }
                      }}
                    >
                      Reactivar Suscripción
                    </Button>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    No tienes una suscripción activa. Mejora tu experiencia con nuestros planes premium.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenSubscriptionModal}
                    sx={{
                      background: 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0d1652 0%, #283593 100%)',
                      }
                    }}
                  >
                    Ver Planes de Suscripción
                  </Button>
                </Box>
              )}
            </Box>

            {/* Zona de peligro - Eliminar cuenta */}
            <Box sx={{ 
              my: 4, 
              p: 3, 
              border: `2px solid ${theme.palette.error.main}`, 
              borderRadius: '8px', 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)'
            }}>
              <Typography variant="h6" gutterBottom color="error" sx={{ fontWeight: 'bold' }}>
                Zona de Peligro
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteAccount}
                sx={{
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(211, 47, 47, 0.1)'
                  }
                }}
              >
                Eliminar cuenta permanentemente
              </Button>
            </Box>
            
        </Box>
       
      {/* Botón para agregar imagen en la esquina inferior derecha */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1301 }}>
       
      </Box>
      
   
    </Box>

    <Fab
      color="primary"
      aria-label="share"
      onClick={handleOpenEditModal}
      sx={{
        width: 45,
        height: 45,
        position: 'fixed',
        top: {xs:15,md: 75},
        right: {xs:20,md: 20},
        bgcolor: 'rgb(229, 229, 229)',
        '&:hover': {
          bgcolor: 'rgb(155, 155, 155)',
        },
      }}
    >

      <EditIcon sx={{ color: 'rgb(41, 29, 110)' }} />
    </Fab>

    <Modal
      open={openQR}
      onClose={handleCloseQR}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={openQR}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 320,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography variant="h6" color="primary">Compartir Contacto</Typography>
          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '4px' }}>
            <QRCode value={qrData} size={256} />
          </Box>
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Escanea este código para guardar los datos del martillero.
          </Typography>
        </Box>
      </Fade>
    </Modal>

    <Modal
      open={editModalOpen}
      onClose={handleCloseEditModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={editModalOpen}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: '20px',
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <Typography variant="h6" color="primary" gutterBottom>Editar Información</Typography>
          <form onSubmit={handleFormSubmit}>
            <TextField name="nombreNegocio" label="Nombre del Negocio" value={formData.nombreNegocio || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="razonSocial" label="Razón Social / Dirección" value={formData.razonSocial || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="cuit" label="CUIT" value={formData.cuit || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="matricula" label="Matrícula" value={formData.matricula || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="telefono" label="Teléfono" value={formData.telefono || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="email" label="Email" value={formData.email || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="localidad" label="Localidad" value={formData.localidad || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="partido" label="Partido" value={formData.partido || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField name="provincia" label="Provincia" value={formData.provincia || ''} onChange={handleFormChange} fullWidth margin="normal" />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseEditModal} color="secondary">Cancelar</Button>
              <Button type="submit" variant="contained">Guardar Cambios</Button>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>

    {/* Dialog de confirmación para eliminar cuenta */}
    <Dialog
      open={deleteDialogOpen}
      onClose={handleCancelDelete}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="delete-dialog-title" sx={{ color: 'error.main', fontWeight: 'bold' }}>
        ¿Estás seguro que quieres eliminar tu cuenta?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente:
        </DialogContentText>
        <Box component="ul" sx={{ mt: 2, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            Todos tus datos personales y de negocio
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Todos los contratos, propiedades, inquilinos y propietarios
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Toda la información financiera y contable
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Las vinculaciones con servicios externos
          </Typography>
        </Box>
        <DialogContentText sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
          Esta acción NO se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleCancelDelete} 
          variant="outlined"
          disabled={isDeleting}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirmDelete} 
          color="error" 
          variant="contained"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
        >
          {isDeleting ? 'Eliminando...' : 'Sí, eliminar permanentemente'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Subscription Modal */}
    <SubscriptionModal
      open={subscriptionModalOpen}
      onClose={handleCloseSubscriptionModal}
      onSelectPlan={handleSelectPlan}
    />
    </>
  );
};

export default UserSettings;
