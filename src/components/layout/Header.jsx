import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Box,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  Switch,
  Divider,
  Typography,
  Badge,
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
  const isDark = theme.palette.mode === 'dark';
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
   const [alertaRecibo, setAlertaRecibo] = useState(null);
  const apiRoot = `${import.meta.env.VITE_API_URL}${String(import.meta.env.VITE_API_URL || '').includes('/api') ? '' : '/api'}`;
  // Datos de notificaciones desde el backend
  const [notifications, setNotifications] = useState([]);
   const lastAlertIdsRef = useRef(new Set());
  const initialAlertsLoadedRef = useRef(false);
  const lastReciboAlertIdsRef = useRef(new Set());
  const lastScrollY = useRef(0);
  const hideTimer = useRef(null);
  const [alertas, setAlertas] = useState([]);
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
      refreshNotifications({ showToast: false });
    }
  };

  const handleCloseNotifications = () => {
    setIsClosing(true);
    setTimeout(() => {
      setNotificationsOpen(false);
      setIsClosing(false);
    }, 600); // Tiempo igual a la duración de la animación
  };
  const fetchReciboDetails = async (reciboId) => {
    if (!reciboId) return null;
    try {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('inquilino_token') ||
        localStorage.getItem('propietario_token') ||
        localStorage.getItem('admin_token');

      const response = await fetch(`${apiRoot}/recibo/${reciboId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result?.data ?? null;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener detalles del recibo:', error);
      return null;
    }
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
    markAsRead(notification);
  };

  const handleCloseNotificationDetail = () => {
    setNotificationDetailOpen(false);
    setSelectedNotification(null);
  };

  // Función para mapear alertas del backend al formato de notificaciones
  const parseBackendDate = (value) => {
    if (!value) return new Date();
    if (Array.isArray(value)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = value;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

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
        timestamp: now.getTime(),
        read: false,              // tu backend maneja visto/noMostrar; acá arrancás como no leída
        type,
        source: "alerta",
        raw: a,                   // opcional: guardás el original
      };
    });
  };

  const mapReciboAlertasToNotifications = (alertas, recibosData = {}) => {
    return alertas.map((a) => {
      const createdAt = parseBackendDate(a.fechaCreacion || a.ultimaNotificacion);
      const isTransfer = a.tipo === "TRANSFERENCIA_PENDIENTE";
      const title = isTransfer ? "Transferencia pendiente de revision " : "Alerta de recibo";

      const reciboData = recibosData[a.reciboId] || null;
      const periodo = reciboData?.periodo || null;
      const nombreContrato = reciboData?.nombreContrato || null;

      let message;
      if (isTransfer && periodo && nombreContrato) {
        message = `Tenés una transferencia pendiente de revision para el recibo de ${periodo} / ${nombreContrato}.`;
      } else if (isTransfer) {
        message = `Tenés una transferencia pendiente para el recibo #${a.reciboId || 'N/A'}.`;
      } else {
        message = `Tenés una alerta de pago para el recibo #${a.reciboId || 'N/A'}.`;
      }

      return {
        id: `recibo-${a.id}`,
        backendId: a.id,
        reciboId: a.reciboId ?? null,
        contratoId: a.contratoId ?? null,
        title,
        message,
        time: createdAt.toLocaleString(),
        timestamp: createdAt.getTime(),
        read: a.visto ?? false,
        type: isTransfer ? "payment" : "warning",
        source: "recibo-alerta",
        raw: a,
        reciboData,
      };
    });
  };

  const mergeNotifications = ({ contractAlerts, reciboAlerts } = {}) => {
    setNotifications((prev) => {
      const contratoNotifications = contractAlerts
        ?? prev.filter((notification) => notification.source === "alerta");
      const reciboNotifications = reciboAlerts
        ?? prev.filter((notification) => notification.source === "recibo-alerta");

      const combined = [...reciboNotifications, ...contratoNotifications];
      combined.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
      const unreadCount = combined.filter((notification) => !notification.read).length;
      setNotificationCount(unreadCount);
      return combined;
    });
  };

  // Función para obtener alertas de vencimiento desde el backend
  const fetchVencimientoAlertas = async ({ showToast = false } = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiRoot}/contrato/alertas-vencimiento`, {
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

        mergeNotifications({ contractAlerts: mappedNotifications });

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
     
    }
  };

  const fetchReciboAlertas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiRoot}/alertas/recibos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const alertasData = result?.data ?? [];
        setAlertas(alertasData);

        const reciboIds = [...new Set(alertasData.map((a) => a.reciboId).filter(Boolean))];
        const recibosData = {};
        await Promise.all(
          reciboIds.map(async (id) => {
            const data = await fetchReciboDetails(id);
            if (data) recibosData[id] = data;
          })
        );

        const mappedNotifications = mapReciboAlertasToNotifications(alertasData, recibosData);
        const incomingIds = new Set(mappedNotifications.map((notification) => notification.id));
        lastReciboAlertIdsRef.current = incomingIds;
        mergeNotifications({ reciboAlerts: mappedNotifications });
      } else {
        console.error('Error al obtener alertas de recibos:', response.statusText);
      }
    } catch (error) {
      console.error('Error en fetchReciboAlertas:', error);
    }
  };


  const refreshNotifications = async ({ showToast = false } = {}) => {
    if (!isLogged) return;
    setLoadingNotifications(true);
    await Promise.all([
      fetchVencimientoAlertas({ showToast }),
      fetchReciboAlertas()
    ]);
    setLoadingNotifications(false);
  };

  const markAsRead = async (notification) => {
    setNotifications(prev => {
      const updated = prev.map(notif =>
        notif.id === notification?.id ? { ...notif, read: true } : notif
      );
      const unreadCount = updated.filter(n => !n.read).length;
      setNotificationCount(unreadCount);
      return updated;
    });

    if (notification?.source !== "recibo-alerta" || !notification?.backendId) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiRoot}/alertas/recibos/${notification.backendId}/visto`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error al marcar alerta de recibo como vista:', error);
    }
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
      refreshNotifications({ showToast: false });
    }
  }, [isLogged]);

  useEffect(() => {
    if (!isLogged) return;
    if (!("serviceWorker" in navigator)) return;

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type !== "PUSH_NOTIFICATION") return;
      const payload = event.data?.payload;

      const title = payload?.title || "Nueva notificación";
      const message = payload?.body || "Tienes una nueva notificación.";

      // Mostrar toast inmediato con info del push
      if (Swal) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title,
          text: message,
          showConfirmButton: false,
          timer: 3000,
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

      // Inyectar la notificación push directamente en el panel
      const pushNotification = {
        id: `push-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        message,
        time: new Date().toLocaleString(),
        timestamp: Date.now(),
        read: false,
        type: "info",
        source: "push",
        raw: payload,
      };

      setNotifications((prev) => {
        const updated = [pushNotification, ...prev];
        const unreadCount = updated.filter((n) => !n.read).length;
        setNotificationCount(unreadCount);
        return updated;
      });

      // También refrescar alertas del backend por si hay nuevas
      fetchReciboAlertas();
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [isLogged]);


   useEffect(() => {
    if (!isLogged)return;

    const intervalId = setInterval(() => {
      refreshNotifications({ showToast: true });
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

  const getRoleName = () => {
    if (authorities?.includes('ROLE_SUPER_ADMIN')) return 'Super Admin';
    if (authorities?.includes('ROLE_ADMIN')) return 'Administrador';
    return 'Usuario';
  };

  const getPlanBadge = () => {
    if (authorities?.includes('ROLE_SUPER_ADMIN')) {
      return { label: 'Unlimited', bg: 'linear-gradient(135deg, #DC143C 0%, #FF69B4 100%)', color: '#fff' };
    }
    if (plan?.status === 'ACTIVE' && (plan?.planName === 'pro+' || plan?.planName === 'Pro' || plan?.planName === 'Superior')) {
      return { label: plan.planName, bg: 'linear-gradient(135deg, #B8860B 0%, #FFD700 100%)', color: '#1a1a1a' };
    }
    return { label: 'Free', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff' };
  };

  const planBadge = getPlanBadge();

  const drawerMenuItems = [
    { icon: <CalculateIcon />, label: 'Calculadora', tour: 'drawer-calculadora', onClick: () => handleNavigate('/calculadora-de-alquileres'), color: '#3b82f6' },
    { icon: <CalendarMonthIcon />, label: 'Calendario', tour: 'drawer-calendario', onClick: () => handleNavigate('/calendario'), color: '#22c55e', badge: hasCalendarEvents },
    { icon: <ReceiptIcon />, label: 'Presupuestos', tour: 'drawer-presupuestos', onClick: () => handleNavigate('/presupuestos'), color: '#f59e0b' },
    { icon: <PaidIcon />, label: 'Ingresos', tour: null, onClick: () => handleNavigate('/contabilidad'), color: '#10b981' },
    { icon: <ContactMailIcon />, label: 'Prospectos', tour: null, onClick: () => handleNavigate('/prospectos'), color: '#ec4899' },
    { icon: <QrCode2Icon />, label: 'Compartir', tour: 'drawer-compartir', onClick: () => { setDrawerOpen(false); handleOpenQR(); }, color: '#6366f1' },
  ];

  const drawerBottomItems = [
    { icon: <WorkspacePremiumIcon />, label: 'Planes Premium', tour: 'drawer-suscripcion', onClick: handleOpenSubscriptionModal, color: '#f59e0b' },
    { icon: <SettingsIcon />, label: 'Ajustes', tour: 'drawer-ajustes', onClick: () => handleNavigate('/ajustes'), color: isDark ? '#94a3b8' : '#64748b' },
  ];

  const drawerContent = (
    <Box
      sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#111118' : '#fff', position: 'relative' }}
      role="presentation"
    >
      {/* Profile header */}
      <Box sx={{
        p: 2.5,
        pb: 2,
        background: isDark
          ? 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(124,58,237,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.03) 100%)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : googleProfile?.picture || ''}
            {...(!usuarioFetch?.logo && { ...stringAvatar((usuarioFetch?.username || '').toUpperCase()) })}
            sx={{ width: 48, height: 48, border: `2px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)'}` }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuarioFetch?.nombreNegocio || 'Mi Negocio'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {getRoleName()}
            </Typography>
          </Box>
          {/* Notifications button */}
          <IconButton
            size="small"
            onClick={handleNotificationsClick}
            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' } }}
          >
            <Badge badgeContent={notificationCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
              <NotificationsIcon sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>
        </Box>
        {/* Plan badge */}
        <Box sx={{
          background: planBadge.bg,
          borderRadius: 2,
          px: 2,
          py: 0.5,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
        }}>
          <WorkspacePremiumIcon sx={{ fontSize: 14, color: planBadge.color }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: planBadge.color, fontSize: '0.65rem', letterSpacing: 0.5 }}>
            {planBadge.label}
          </Typography>
        </Box>
      </Box>

      {/* Menu items */}
      <Box sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontSize: '0.6rem', px: 1, mb: 0.5, display: 'block' }}>
          Herramientas
        </Typography>
        {drawerMenuItems.map((item, i) => (
          <Box
            key={i}
            data-tour={item.tour}
            onClick={item.onClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:active': { transform: 'scale(0.98)' },
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
            }}
          >
            <Box sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isDark ? `${item.color}22` : `${item.color}14`,
              color: item.color,
              '& .MuiSvgIcon-root': { fontSize: 18 },
            }}>
              {item.badge ? (
                <Badge color="error" variant="dot" invisible={!item.badge}
                  sx={{ '& .MuiBadge-badge': { top: 2, right: 2, width: 6, height: 6, minWidth: 6 } }}>
                  {item.icon}
                </Badge>
              ) : item.icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
              {item.label}
            </Typography>
          </Box>
        ))}

        <Box sx={{ my: 1.5, mx: 1, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} />

        {drawerBottomItems.map((item, i) => (
          <Box
            key={i}
            data-tour={item.tour}
            onClick={item.onClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:active': { transform: 'scale(0.98)' },
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
            }}
          >
            <Box sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isDark ? `${item.color}22` : `${item.color}14`,
              color: item.color,
              '& .MuiSvgIcon-root': { fontSize: 18 },
            }}>
              {item.icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{
        px: 1.5,
        py: 1.5,
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        {/* Dark mode toggle */}
        {isMobile && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            mb: 0.5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 34, height: 34, borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.1)',
                color: isDark ? '#fbbf24' : '#6366f1',
                '& .MuiSvgIcon-root': { fontSize: 18 },
              }}>
                {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>Tema</Typography>
            </Box>
            <Switch
              size="small"
              data-tour="toggle-tema"
              onChange={toggleTheme}
              checked={darkMode}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' },
              }}
            />
          </Box>
        )}
        {/* Logout */}
        <Box
          onClick={handleLogout}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:active': { transform: 'scale(0.98)' },
            '&:hover': { bgcolor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)' },
          }}
        >
          <Box sx={{
            width: 34, height: 34, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
            color: '#ef4444',
            '& .MuiSvgIcon-root': { fontSize: 18 },
          }}>
            <LogoutIcon />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: '#ef4444' }}>
            Cerrar Sesión
          </Typography>
        </Box>
      </Box>
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
                Cargando notificaciones...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No tienes notificaciones
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
            <IconButton onClick={handleDrawerToggle} sx={{
              p: 0.3,
              bgcolor: isDark ? 'rgba(30,30,40,0.9)' : 'rgba(245, 245, 245, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.1)',
              border: `1.5px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`,
              borderRadius: 2.5,
              '&:hover': { bgcolor: isDark ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,1)' },
            }}>
              <Avatar src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : ''} {...(!usuarioFetch?.logo && { ...stringAvatar((authUser?.username || '').toUpperCase()) })} sx={{ width: 36, height: 36, borderRadius: 1.5, border: notificationCount > 0 ? '2.5px solid #8b5cf6' : '2px solid transparent', boxShadow: notificationCount > 0 ? '0 0 8px rgba(139,92,246,0.5)' : 'none', transition: 'border 0.3s ease, box-shadow 0.3s ease', animation: notificationCount > 0 ? 'notifPulse 2s ease-in-out infinite' : 'none', '@keyframes notifPulse': { '0%, 100%': { boxShadow: '0 0 4px rgba(139,92,246,0.3)' }, '50%': { boxShadow: '0 0 12px rgba(139,92,246,0.6)' } } }} />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={handleDrawerToggle}
              sx={{ zIndex: 1400 }}
              PaperProps={{
                sx: {
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  overflow: 'hidden',
                  boxShadow: isDark
                    ? '8px 0 40px rgba(0,0,0,0.5)'
                    : '8px 0 40px rgba(0,0,0,0.1)',
                  border: 'none',
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
                   <Avatar src={usuarioFetch?.logo ? `${usuarioFetch.logo}?t=${logoTimestamp}` : ''} {...(!usuarioFetch?.logo && { ...stringAvatar((authUser?.username || '').toUpperCase()) })} sx={{ border: notificationCount > 0 ? '2.5px solid #8b5cf6' : '2.5px solid rgba(255,255,255,0.3)', boxShadow: notificationCount > 0 ? '0 0 10px rgba(139,92,246,0.5)' : 'none', transition: 'border 0.3s ease, box-shadow 0.3s ease', animation: notificationCount > 0 ? 'notifPulse 2s ease-in-out infinite' : 'none', '@keyframes notifPulse': { '0%, 100%': { boxShadow: '0 0 4px rgba(139,92,246,0.3)' }, '50%': { boxShadow: '0 0 12px rgba(139,92,246,0.6)' } } }} />
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
