import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Box,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  Typography,
  ListItemButton,
  Badge,
  Button,
  Fab,
  Tooltip
} from '@mui/material';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/GlobalAuth';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CalculateIcon from '@mui/icons-material/Calculate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaidIcon from '@mui/icons-material/Paid';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import Modal from '@mui/material/Modal';
import QRCode from 'react-qr-code';
import DesktopMenu from './DesktopMenu';
import ChatModal from '../common/Chat/ChatModal';
import useGoogleLink from '../../hooks/useGoogleLink';
import SubscriptionModal from '../common/SubscriptionModal/SubscriptionModal';
import NotificationDetailModal from '../common/NotificationDetailModal';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import WarningIcon from '@mui/icons-material/Warning';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import playstoreLogo from '../../assets/playstore.png';
export const Header = ({ toggleTheme, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { usuarioFetch, authUser, user, isLogged, hasCalendarEvents, logout, logoTimestamp, plan} = useAuth();
  const { isLinked, isLoading, googleProfile, handleLink, handleUnlink } = useGoogleLink();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldShowToast, setShouldShowToast] = useState(false);
  const [visible, setVisible] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false);
  const [newAlertCount, setNewAlertCount] = useState(0);
  // Datos de notificaciones desde el backend
  const [notifications, setNotifications] = useState([]);
   const lastAlertIdsRef = useRef(new Set());
  const initialAlertsLoadedRef = useRef(false);
  const lastScrollY = useRef(0);
  const hideTimer = useRef(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenChat = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setChatOpen(true);
    }, 300);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const handleOpenQR = () => setOpenQR(true);
  const handleCloseQR = () => setOpenQR(false);

  const handleOpenSubscriptionModal = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSubscriptionModalOpen(true);
    }, 300);
  };

  const handleCloseSubscriptionModal = () => {
    setSubscriptionModalOpen(false);
  };

  const handleSelectPlan = (plan) => {
    // Aquí puedes agregar la lógica para manejar la selección del plan
    setSubscriptionModalOpen(false);
  };

  const handleNotificationsClick = () => {
    // Cerrar el sidebar menu en mobile si está abierto
    if (isMobile && drawerOpen) {
      setDrawerOpen(false);
    }

    // Abrir/cerrar el panel, pero SIN tocar el flag del toast
    const willOpen = !notificationsOpen;
    setNotificationsOpen(willOpen);

    if (willOpen) {
      // Solo refrescás la lista, sin habilitar el toast
        fetchVencimientoAlertas({ showToast: false });
    }
  };

  const handleCloseNotifications = () => {
    setIsClosing(true);
    setTimeout(() => {
      setNotificationsOpen(false);
      setIsClosing(false);
    }, 600); // Tiempo igual a la duración de la animación
  };

  // Funciones para manejar el modal de detalles
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setNotificationDetailOpen(true);
    setShouldShowToast(false); // No mostrar toast al hacer click en notificación
    // Cerrar el panel de notificaciones con animación
    setIsClosing(true);
    setTimeout(() => {
      setNotificationsOpen(false);
      setIsClosing(false);
    }, 600);
    // Marcar como leída (sin volver a fetch)
    markAsRead(notification.id);
  };

  const handleCloseNotificationDetail = () => {
    setNotificationDetailOpen(false);
    setSelectedNotification(null);
  };

  // Función para mapear alertas del backend al formato de notificaciones
  const mapAlertasToNotifications = (alertas) => {
    const now = new Date();

    return alertas.map((a) => {
      const vencido = a.vencido === true;
      const dias = a.diasRestantes ?? 0;

      const type = vencido ? "expired" : dias <= 7 ? "warning" : "contract";

      const title = vencido
        ? "Contrato vencido"
        : dias <= 7
          ? "Contrato por vencer"
          : "Alerta de vencimiento";

      const message = vencido
        ? `El contrato "${a.nombreContrato}" venció el ${a.fechaFin}.` 
        : `El contrato "${a.nombreContrato}" vence el ${a.fechaFin} (faltan ${dias} días).`;

      return {
        id: a.id,                 // ID de la alerta
        contratoId: a.contratoId, // te sirve para navegar
        title,
        message,
        time: now.toLocaleString(),
        read: false,              // tu backend maneja visto/noMostrar; acá arrancás como no leída
        type,
        source: "alerta",
        raw: a,                   // opcional: guardás el original
      };
    });
  };

  const mapPushToNotification = (payload) => {
    const now = new Date();
    const pushType = payload?.data?.type;
    const isTransfer = pushType === "TRANSFERENCIA_PENDIENTE";
    const title = payload?.title || (isTransfer ? "Transferencia notificada" : "Nueva notificación");
    const message = payload?.body || "Tienes una nueva notificación.";
    const type = isTransfer ? "payment" : "contract";

    return {
      id: `push-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      contratoId: payload?.data?.contratoId ?? null,
      title,
      message,
      time: now.toLocaleString(),
      read: false,
      type,
      source: "push",
      raw: payload?.data ?? null,
    };
  };

  // Función para obtener alertas de vencimiento desde el backend
 const fetchVencimientoAlertas = async ({ showToast = false } = {}) => {
    setLoadingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contrato/alertas-vencimiento`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const alertas = result?.data ?? [];
        const mappedNotifications = mapAlertasToNotifications(alertas);
        const incomingIds = new Set(mappedNotifications.map((notification) => notification.id));
        const newAlerts = mappedNotifications.filter(
          (notification) => !lastAlertIdsRef.current.has(notification.id)
        );

        setNotifications((prev) => {
          const nonAlertNotifications = prev.filter((notification) => notification.source !== "alerta");
          const combined = [...mappedNotifications, ...nonAlertNotifications];
          const unreadCount = combined.filter((notification) => !notification.read).length;
          setNotificationCount(unreadCount);
          return combined;
        });

        lastAlertIdsRef.current = incomingIds;

        if (showToast && newAlerts.length > 0 && initialAlertsLoadedRef.current) {
          setNewAlertCount(newAlerts.length);
          setShouldShowToast(true);
        }

        if (!initialAlertsLoadedRef.current) {
          initialAlertsLoadedRef.current = true;
        }
      } else {
        console.error('Error al obtener alertas de vencimiento:', response.statusText);

      }
    } catch (error) {
      console.error('Error en fetchVencimientoAlertas:', error);
     
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      );
      const unreadCount = updated.filter(n => !n.read).length;
      setNotificationCount(unreadCount);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setNotificationCount(0);
  };

  // Cargar alertas de vencimiento al montar el componente
  useEffect(() => {
    if (isLogged) {
      fetchVencimientoAlertas({ showToast: false });
    }
  }, [isLogged]);

  useEffect(() => {
    if (!isLogged) return;
    if (!("serviceWorker" in navigator)) return;

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type !== "PUSH_NOTIFICATION") return;
      const payload = event.data?.payload;
      const notification = mapPushToNotification(payload);

      setNotifications((prev) => {
        const updated = [notification, ...prev];
        const unreadCount = updated.filter((item) => !item.read).length;
        setNotificationCount(unreadCount);
        return updated;
      });

      if (Swal) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: notification.title,
          text: notification.message,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          customClass: {
            popup: "compact-toast",
            title: "compact-toast-title",
            htmlContainer: "compact-toast-content",
            timerProgressBar: "compact-toast-progress",
          },
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [isLogged]);


   useEffect(() => {
    if (!isLogged)return;

    const intervalId = setInterval(() => {
      fetchVencimientoAlertas({ showToast: true });
    }, 60000);

    return () => clearInterval(intervalId);
  },[isLogged]);


  // Mostrar notificación toast cuando hay alertas nuevas
  useEffect(() => {
  if (newAlertCount > 0 && !loadingNotifications && shouldShowToast && Swal) {
      // Mostrar toast con SweetAlert (ya se usa en el proyecto)
      Swal.fire({
        toast: true,
        position: "top-end",
         icon: "warning",
  iconColor: "#fac023",
        title: "Alertas de vencimiento",
        text: `${newAlertCount} contrato${newAlertCount > 1 ? 's' : ''} por vencer`,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
       customClass: {
    popup: "compact-toast",
    title: "compact-toast-title",
    htmlContainer: "compact-toast-content",
    timerProgressBar: "compact-toast-progress"
  },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      // Resetear la bandera después de mostrar el toast
      setShouldShowToast(false);
      setNewAlertCount(0);
    }
  }, [newAlertCount, loadingNotifications, shouldShowToast]);
  useEffect(() => {
    const handleScroll = () => {
      if (!isMobile) return;

      const currentScrollY = window.scrollY;
      
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setVisible(false);
      } else {
        setVisible(true);
        // No auto-hide on specific pages
        if (
          location.pathname !== '/contabilidad' &&
          location.pathname !== '/' &&
          !location.pathname.startsWith('/recibos-page')
        ) {
          hideTimer.current = setTimeout(() => {
            setVisible(false);
          }, 4000);
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [isMobile]);

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
  };

  const handleNavigate = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function stringAvatar(name) {
    if (!name) return {};
    const initials = name.split(' ').map(n => n[0]).join('');
    return {
      sx: { bgcolor: stringToColor(name) },
      children: initials,
    };
  }
const authorities = localStorage.getItem('authorities');
  const drawerContent = (
    <Box
      sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.mode === 'dark' ? 'rgb(35, 35, 35)' : '#fff', borderRadius:"0px 15px 0px 0px", position:"relative"}}
      role="presentation"
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : googleProfile?.picture || ''}
          {...(!usuarioFetch?.logo && { ...stringAvatar((usuarioFetch?.username || '').toUpperCase()) })}
          sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
        />
        <Typography variant="body1">{usuarioFetch?.nombreNegocio}</Typography>
       
<Typography variant="body2" color="text.secondary">
  {authorities?.includes('ROLE_SUPER_ADMIN')
    ? 'Super Admin'
    : authorities?.includes('ROLE_ADMIN')
    ? 'Administrador'
    : authorities?.includes('ROLE_USER')
    ? 'Usuario'
    : 'Usuario'}
</Typography>
      {authorities?.includes('ROLE_SUPER_ADMIN') ? (
  // 🟡 Plan ilimitado para Super Admin
  <Box
    sx={{
      background: "linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #FF69B4 50%, #FFB6C1 75%, #8B0000 100%)",
      boxShadow: "0 4px 15px rgba(243, 153, 171, 0.29), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      width: "100%",
      borderRadius: 3,
      height: "1.7rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Typography variant="body1" sx={{ color: "rgb(250, 250, 250)", fontWeight: "bold" }}>
      Unlimited Version
    </Typography>


     {/* Icon button de notificaciones para mobile */}
          <Box sx={{
            position: 'absolute',
            top: 16,
            left: 190,
            zIndex: 1200,
            transition: 'transform 0.3s ease-in-out',
            transform: (visible || location.pathname === '/ajustes' || location.pathname === '/calendario' || location.pathname === '/' || location.pathname.startsWith('/recibos-page')) ? 'translateX(0)' : 'translateX(100px)',
          }}>
            <Tooltip title="Notificaciones">
              <IconButton
                onClick={handleNotificationsClick}
                sx={{ 
                  p: 1.5,
                  boxShadow: 3, 
                  bgcolor: 'background.paper', 
                  '&:hover': { bgcolor: 'background.paper' },
                  color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.secondary'
                }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
  </Box>
  
) : plan?.status === "ACTIVE" && 
   (plan?.planName === "pro+" || plan?.planName === "Pro" || plan?.planName === "Superior") ? (
  // 🟡 Plan Pro o Superior activo
  <Box
    sx={{
      background: "linear-gradient(135deg, #B8860B 0%, #FFD700 15%, #FFF8DC 30%, #FFD700 45%, #DAA520 60%, #FFF8DC 75%, #FFD700 90%, #B8860B 100%)",
      boxShadow: "inset 0 2px 8px rgba(255, 215, 0, 0.3), inset 0 -2px 8px rgba(184, 134, 11, 0.4), 0 4px 12px rgba(255, 215, 0, 0.2)",
      width: "100%",
      borderRadius: 3,
      height: "1.7rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Typography variant="body1" sx={{ color: "rgb(49,49,49)" }}>
      {plan?.planName}
    </Typography>
  </Box>
) : (
  // 🟣 Plan Free
  <Box
    sx={{
      background: "linear-gradient(135deg, #4B0082 0%, #8A2BE2 15%, #DDA0DD 30%, #9370DB 45%, #6A5ACD 60%, #E6E6FA 75%, #8A2BE2 90%, #4B0082 100%)",
      boxShadow: "inset 0 2px 8px rgba(138, 43, 226, 0.3), inset 0 -2px 8px rgba(75, 0, 130, 0.4), 0 4px 12px rgba(138, 43, 226, 0.2)",
      width: "100%",
      borderRadius: 3,
      height: "1.7rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Typography variant="body1" sx={{ color: "rgb(255,255,254)" }}>
      Plan Free
    </Typography>
  </Box>
)}

         
      </Box>
      <Divider sx={{ my: 1 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-calculadora" onClick={() => handleNavigate('/calculadora-de-alquileres')}>
            <ListItemIcon><CalculateIcon /></ListItemIcon>
            <ListItemText primary="Calculadora" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-calendario" onClick={() => handleNavigate('/calendario')}>
            <ListItemIcon>
              <Badge color="error" variant="dot" invisible={!hasCalendarEvents}>
                <CalendarMonthIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Calendario" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-presupuestos" onClick={() => handleNavigate('/presupuestos')}>
            <ListItemIcon><ReceiptIcon /></ListItemIcon>
            <ListItemText primary="Presupuestos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/contabilidad')}>
            <ListItemIcon><PaidIcon /></ListItemIcon>
            <ListItemText primary="Ingresos" />
          </ListItemButton>
        </ListItem>
      
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-compartir" onClick={() => { setDrawerOpen(false); handleOpenQR(); }}>
            <ListItemIcon><QrCode2Icon  /></ListItemIcon>
            <ListItemText primary="Compartir Contacto" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-suscripcion" onClick={handleOpenSubscriptionModal}>
            <ListItemIcon><WorkspacePremiumIcon sx={{ color: '#FF9800' }} /></ListItemIcon>
            <ListItemText primary="Planes Premium" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton data-tour="drawer-ajustes" onClick={() => handleNavigate('/ajustes')}>
            <ListItemIcon><SettingsIcon  /></ListItemIcon>
            <ListItemText primary="Ajustes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/prospectos')}>
            <ListItemIcon><ContactMailIcon /></ListItemIcon>
            <ListItemText primary="Prospectos" />
          </ListItemButton>
        </ListItem>
        {isMobile && (
          <ListItem>
            <ListItemIcon>{darkMode ? <DarkModeIcon /> : <LightModeIcon />}</ListItemIcon>
            <ListItemText primary="Tema Oscuro" />
            <Switch edge="end" data-tour="toggle-tema" onChange={toggleTheme} checked={darkMode} />
          </ListItem>
        )}
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ color: 'error' }} />
          </ListItemButton>
        </ListItem>
        {/* <Box sx={{ p: 2, mt: 'auto' }}>
        <Button
          data-tour="open-chat"
          variant="contained"
          fullWidth
          startIcon={<AutoAwesomeIcon />}
          onClick={handleOpenChat}
          sx={{
            color: 'white',
            backgroundColor: '#6e42ca',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 'bold',
            py: 1.5,
            transition: 'background 0.3s ease, transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.03)',
              background: 'linear-gradient(45deg, #F871B8 0%, #6E42CA 50%, #3B82F6 100%)',
            },
          }}
        >
          tuinmoIA
        </Button>
        </Box> */}
       
      </List>
    </Box>
  );

  const qrModal = (
    <Modal open={openQR} onClose={handleCloseQR}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, color: theme.palette.mode === 'dark' ? 'white' : 'black'}}>
        <Typography variant="h6" component="h2" textAlign="center" mb={2}>Compartir Contacto</Typography>
        <QRCode value={usuarioFetch ? `BEGIN:VCARD\nVERSION:3.0\nFN:${usuarioFetch.nombreNegocio || ''}\nTEL;TYPE=WORK,VOICE:${usuarioFetch.telefono || ''}\nEMAIL:${usuarioFetch.email || ''}\nEND:VCARD` : ''} />
      </Box>
    </Modal>
  );

  const notificationsModal = (
    <Modal 
      open={notificationsOpen} 
      onClose={handleCloseNotifications}
      BackdropProps={{
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.3)' }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        maxHeight: '70vh',
        bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        animation: isClosing ? 'slideUp 0.8s ease-in' : 'slideDown 0.3s ease-out',
        '@keyframes slideDown': {
          from: {
            transform: 'translateY(-100%)',
          },
          to: {
            transform: 'translateY(0)',
          },
        },
        '@keyframes slideUp': {
          from: {
            transform: 'translateY(0)',
          },
          to: {
            transform: 'translateY(-100%)',
          },
        }
      }}>
        {/* Header del modal */}
        <Box sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
            Notificaciones
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {notificationCount > 0 && (
              <IconButton 
                size="small" 
                onClick={markAllAsRead}
                sx={{ 
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                }}
                title="Marcar todas como leídas"
              >
                <ClearAllIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton 
              size="small" 
              onClick={handleCloseNotifications}
              sx={{ 
                color: theme.palette.mode === 'dark' ? 'white' : 'black',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
            >
              ×
            </IconButton>
          </Box>
        </Box>

        {/* Lista de notificaciones */}
        <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {loadingNotifications ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Cargando alertas de vencimiento...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No tienes alertas de vencimiento
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <Box
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  backgroundColor: notification.read 
                    ? 'transparent' 
                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Icono según tipo */}
                  <Box sx={{
                    p: 1,
                    borderRadius: '50%',
                    backgroundColor: 
                      notification.type === 'contract' ? '#e3f2fd' :
                      notification.type === 'payment' ? '#e8f5e8' :
                      notification.type === 'warning' ? '#fff3e0' :
                      notification.type === 'expired' ? '#ffebee' :
                      '#f3e5f5',
                    color: 
                      notification.type === 'contract' ? '#1976d2' :
                      notification.type === 'payment' ? '#388e3c' :
                      notification.type === 'warning' ? '#f57c00' :
                      notification.type === 'expired' ? '#d32f2f' :
                      '#9c27b0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {
                      notification.type === 'contract' ? <DescriptionIcon fontSize="small" /> :
                      notification.type === 'payment' ? <PaidIcon fontSize="small" /> :
                      notification.type === 'warning' ? <WarningIcon fontSize="small" /> :
                      notification.type === 'expired' ? <EventBusyIcon fontSize="small" /> :
                      <NotificationImportantIcon fontSize="small" />
                    }
                  </Box>

                  {/* Contenido */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: notification.read ? 400 : 600,
                          color: theme.palette.mode === 'dark' ? 'white' : 'black',
                          fontSize: '0.875rem'
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#f44336',
                            flexShrink: 0,
                            ml: 1
                          }}
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.8rem',
                        lineHeight: 1.4,
                        mb: 0.5
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {notification.time}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Modal>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Box sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            transition: 'transform 0.3s ease-in-out',
            transform: (visible || location.pathname === '/ajustes' || location.pathname === '/calendario' || location.pathname === '/' || location.pathname.startsWith('/recibos-page')) ? 'translateX(0)' : 'translateX(-100px)',
          }}>
            <IconButton onClick={handleDrawerToggle} sx={{ p: 0, boxShadow: 3, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}>
              <Avatar src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : ''} {...(!usuarioFetch?.logo && { ...stringAvatar((authUser?.username || '').toUpperCase()) })} />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={handleDrawerToggle}
              PaperProps={{
                sx: {
                  borderTopRightRadius: 15,
                  borderBottomRightRadius: 0,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  overflow: 'hidden'
                }
              }}
            >
              {drawerContent}
            </Drawer>
          </Box>
          
         
        </>
      ) : (
        <Box sx={{ position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 1100, width: 280 }}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
            
            {/* Main curved sidebar */}
            <Box sx={(theme) => ({ 
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(180deg, #1d2240 0%, #13162b 100%)'
                : "linear-gradient(360deg, #8f6bffff 0%, #7642eeff 14%, #50399dff 28%, #3b1299ff 100%);",
              color: 'white',
              height: '100%',
              width: 240,
              ml: '0px',
              borderTopRightRadius: 40,
              borderBottomRightRadius: 40,
              boxShadow: theme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.4)' : '0 12px 28px rgba(87,70,210,0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            })}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, pt: 4, pb: 2 }}>
                <Box
                  component="img"
                  src={playstoreLogo}
                  alt="Play Store"
                  sx={{ width: 28, height: 28, objectFit: 'contain', flex: '0 0 auto' }}
                />

                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.35)' }} />
                
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
                  {usuarioFetch?.nombreNegocio || 'CRM'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, px: 3, py: 1, overflowY: 'auto' }}>
                <DesktopMenu orientation="vertical" />
              </Box>
              <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, position:"relative"}}>
                <IconButton onClick={toggleTheme} sx={{ color: 'white' }}>
                  {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{authUser?.username}</Typography>
                
                {/* Icon button de notificaciones en la esquina superior derecha */}
                          <Box sx={{ 
                            position: 'absolute', 
                            bottom: 78, 
                            right:22, 
                            zIndex: 10 
                          }}>
                            <Tooltip title="Notificaciones">
                              <IconButton
                                onClick={handleNotificationsClick}
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  }
                                }}
                              >
                                <Badge badgeContent={notificationCount} color="error">
                                  <NotificationsIcon />
                                </Badge>
                              </IconButton>
                            </Tooltip>
                          </Box>
                
                <IconButton data-tour="open-drawer" onClick={handleDrawerToggle} sx={{ p: 0 }}>
                   <Avatar src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : ''} {...(!usuarioFetch?.logo && { ...stringAvatar((authUser?.username || '').toUpperCase()) })} />
                </IconButton>
              </Box>
              <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>{drawerContent}</Drawer>
            </Box>
          </Box>
        </Box>
      )}
      {/* Desktop sidebar spacer (handled in Layout with padding-left) */}
      <Box sx={{ display: { xs: 'none', md: 'none' } }} />
     {/* <Tooltip title="Abrir Chat IA">
        <Box
          component={motion.div}
          onClick={handleOpenChat}
          whileTap={{ scale: 1.15 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
              sx={{
      position: 'fixed',
      width: 50,
      height: 50,
      bottom: 80,
      right: 10,
      zIndex: 1200,
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #F871B8 0%, #6E42CA 50%, #3B82F6 100%)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: '0 0 12px rgba(111,51,241,0.5)',
      '&:hover': {
        transform: 'scale(1.12)',
        transition: '0.2s ease-in-out',
      },
    }}
  >
          <AutoAwesomeIcon  sx={{ fontSize: 20 }} />

  </Box>
</Tooltip> */}
      {qrModal}
      {notificationsModal}
      <AnimatePresence>
        {isChatOpen && <ChatModal open={isChatOpen} onClose={handleCloseChat} />}
      </AnimatePresence>
      {/* Subscription Modal */}
      <SubscriptionModal
        open={subscriptionModalOpen}
        onClose={handleCloseSubscriptionModal}
        onSelectPlan={handleSelectPlan}
      />
      {/* Notification Detail Modal */}
      <NotificationDetailModal
        open={notificationDetailOpen}
        onClose={handleCloseNotificationDetail}
        notification={selectedNotification}
      />
    </>
  );
};

export default Header;
